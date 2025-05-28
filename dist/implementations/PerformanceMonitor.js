var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { injectable, inject } from 'inversify';
import { visit, Kind, } from 'graphql';
import { GRAPHQL_TOOLKIT_TYPES } from '../types/InjectionTokens.js';
let QueryComplexityAnalyzer = class QueryComplexityAnalyzer {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    calculateComplexity(document, variables) {
        let complexity = 0;
        visit(document, {
            Field: {
                enter: (node) => {
                    // Base complexity per field
                    complexity += 1;
                    // Add complexity for arguments
                    if (node.arguments && node.arguments.length > 0) {
                        complexity += node.arguments.length * 0.5;
                    }
                    // Add complexity for list fields (inferred from common naming)
                    if (node.name.value.endsWith('s') ||
                        node.name.value.includes('list') ||
                        node.name.value.includes('all')) {
                        complexity += 2;
                    }
                    // Add complexity for connection fields
                    if (node.name.value.includes('connection') ||
                        node.name.value.includes('edges')) {
                        complexity += 3;
                    }
                },
            },
            FragmentSpread: {
                enter: () => {
                    complexity += 1;
                },
            },
            InlineFragment: {
                enter: () => {
                    complexity += 0.5;
                },
            },
        });
        return Math.round(complexity);
    }
    calculateDepth(document) {
        let maxDepth = 0;
        const calculateNodeDepth = (node, currentDepth) => {
            let depth = currentDepth;
            visit(node, {
                Field: {
                    enter: () => {
                        depth++;
                    },
                    leave: () => {
                        maxDepth = Math.max(maxDepth, depth);
                        depth--;
                    },
                },
            });
            return depth;
        };
        visit(document, {
            OperationDefinition: {
                enter: (node) => {
                    calculateNodeDepth(node, 0);
                },
            },
        });
        return maxDepth;
    }
    countFields(document) {
        let fieldCount = 0;
        visit(document, {
            Field: {
                enter: () => {
                    fieldCount++;
                },
            },
        });
        return fieldCount;
    }
    validateQuery(document, variables, thresholds) {
        const defaultThresholds = {
            maxQueryComplexity: 100,
            maxQueryDepth: 10,
            slowQueryThreshold: 1000,
            maxMemoryUsage: 512,
            maxConcurrentQueries: 100,
            dataLoaderBatchThreshold: 10,
        };
        const effectiveThresholds = { ...defaultThresholds, ...thresholds };
        const complexity = this.calculateComplexity(document, variables);
        const depth = this.calculateDepth(document);
        const fieldCount = this.countFields(document);
        const violations = [];
        const warnings = [];
        // Check complexity
        if (complexity > effectiveThresholds.maxQueryComplexity) {
            violations.push({
                type: 'complexity',
                value: complexity,
                threshold: effectiveThresholds.maxQueryComplexity,
                message: `Query complexity ${complexity} exceeds maximum ${effectiveThresholds.maxQueryComplexity}`,
            });
        }
        // Check depth
        if (depth > effectiveThresholds.maxQueryDepth) {
            violations.push({
                type: 'depth',
                value: depth,
                threshold: effectiveThresholds.maxQueryDepth,
                message: `Query depth ${depth} exceeds maximum ${effectiveThresholds.maxQueryDepth}`,
            });
        }
        // Check field count
        if (fieldCount > 50) {
            warnings.push(`High field count: ${fieldCount}. Consider using fragments or breaking into multiple queries.`);
        }
        return {
            valid: violations.length === 0,
            complexity,
            depth,
            fieldCount,
            violations,
            warnings,
        };
    }
    estimateCost(document, variables) {
        const complexity = this.calculateComplexity(document, variables);
        const depth = this.calculateDepth(document);
        const fieldCount = this.countFields(document);
        // Estimate based on complexity and field count
        const estimatedTime = Math.max(50, complexity * 10 + fieldCount * 2); // Base 50ms
        const estimatedMemory = Math.max(1, complexity * 0.5 + fieldCount * 0.1); // MB
        const dataLoaderCalls = Math.floor(fieldCount / 3); // Estimate 1 DataLoader call per 3 fields
        const cacheableFields = Math.floor(fieldCount * 0.7); // 70% of fields potentially cacheable
        let riskLevel = 'low';
        if (complexity > 50 || depth > 7) {
            riskLevel = 'medium';
        }
        if (complexity > 80 || depth > 9) {
            riskLevel = 'high';
        }
        return {
            complexity,
            estimatedTime,
            estimatedMemory,
            dataLoaderCalls,
            cacheableFields,
            riskLevel,
        };
    }
};
QueryComplexityAnalyzer = __decorate([
    injectable(),
    __param(0, inject(GRAPHQL_TOOLKIT_TYPES.ILogger)),
    __metadata("design:paramtypes", [Object])
], QueryComplexityAnalyzer);
export { QueryComplexityAnalyzer };
let PerformanceMonitor = class PerformanceMonitor {
    logger;
    complexityAnalyzer;
    activeQueries = new Map();
    completedQueries = [];
    fieldMetrics = new Map();
    alerts = [];
    thresholds = {
        maxQueryComplexity: 100,
        maxQueryDepth: 10,
        slowQueryThreshold: 1000,
        maxMemoryUsage: 512,
        maxConcurrentQueries: 100,
        dataLoaderBatchThreshold: 10,
    };
    constructor(logger, complexityAnalyzer) {
        this.logger = logger;
        this.complexityAnalyzer = complexityAnalyzer;
    }
    startQuery(queryId, document, variables, context) {
        const validation = this.complexityAnalyzer.validateQuery(document, variables, this.thresholds);
        const metrics = {
            queryId,
            operation: this.extractOperationName(document),
            operationType: this.extractOperationType(document),
            startTime: new Date(),
            complexity: validation.complexity,
            depth: validation.depth,
            fieldCount: validation.fieldCount,
            variables: variables || {},
            cacheHits: 0,
            cacheMisses: 0,
            dataLoaderBatches: 0,
            dataLoaderCacheHits: 0,
            userId: context?.userId,
            requestId: context?.requestId,
        };
        this.activeQueries.set(queryId, metrics);
        // Check for violations and create alerts
        if (!validation.valid) {
            for (const violation of validation.violations) {
                this.createAlert('threshold', 'high', violation.message, violation.type, violation.value, violation.threshold, queryId);
            }
        }
        this.logger.debug('Query monitoring started', {
            queryId,
            operation: metrics.operation,
            complexity: metrics.complexity,
            depth: metrics.depth,
        });
        return metrics;
    }
    endQuery(queryId, errors) {
        const metrics = this.activeQueries.get(queryId);
        if (!metrics) {
            this.logger.warn('Attempted to end unknown query', { queryId });
            return;
        }
        metrics.endTime = new Date();
        metrics.duration = metrics.endTime.getTime() - metrics.startTime.getTime();
        if (errors && errors.length > 0) {
            metrics.errors = errors.map(e => e.message);
        }
        // Check for slow query
        if (metrics.duration > this.thresholds.slowQueryThreshold) {
            this.createAlert('threshold', 'medium', `Slow query detected: ${metrics.duration}ms`, 'time', metrics.duration, this.thresholds.slowQueryThreshold, queryId, metrics.operation);
        }
        this.activeQueries.delete(queryId);
        this.completedQueries.push(metrics);
        // Keep only recent queries (last 1000)
        if (this.completedQueries.length > 1000) {
            this.completedQueries = this.completedQueries.slice(-1000);
        }
        this.logger.debug('Query monitoring ended', {
            queryId,
            duration: metrics.duration,
            errors: metrics.errors?.length || 0,
        });
    }
    startField(queryId, info) {
        const fieldMetrics = {
            fieldName: info.fieldName,
            typeName: info.parentType.name,
            path: info.path ? this.pathToArray(info.path) : [],
            startTime: new Date(),
            cacheHit: false,
            resolverComplexity: 1,
            dataFetched: false,
        };
        const key = `${queryId}-${fieldMetrics.path.join('.')}`;
        if (!this.fieldMetrics.has(key)) {
            this.fieldMetrics.set(key, []);
        }
        this.fieldMetrics.get(key).push(fieldMetrics);
        return fieldMetrics;
    }
    endField(queryId, fieldPath, errors) {
        const key = `${queryId}-${fieldPath.join('.')}`;
        const metrics = this.fieldMetrics.get(key);
        if (metrics && metrics.length > 0) {
            const fieldMetric = metrics[metrics.length - 1];
            fieldMetric.endTime = new Date();
            fieldMetric.duration = fieldMetric.endTime.getTime() - fieldMetric.startTime.getTime();
            if (errors && errors.length > 0) {
                fieldMetric.errors = errors.map(e => e.message);
            }
        }
    }
    recordCacheEvent(queryId, fieldPath, hit) {
        const metrics = this.activeQueries.get(queryId);
        if (metrics) {
            if (hit) {
                metrics.cacheHits++;
            }
            else {
                metrics.cacheMisses++;
            }
        }
        const key = `${queryId}-${fieldPath.join('.')}`;
        const fieldMetrics = this.fieldMetrics.get(key);
        if (fieldMetrics && fieldMetrics.length > 0) {
            fieldMetrics[fieldMetrics.length - 1].cacheHit = hit;
        }
    }
    recordDataLoaderBatch(queryId, loaderName, batchSize, cacheHits) {
        const metrics = this.activeQueries.get(queryId);
        if (metrics) {
            metrics.dataLoaderBatches++;
            metrics.dataLoaderCacheHits += cacheHits;
        }
        this.logger.debug('DataLoader batch recorded', {
            queryId,
            loaderName,
            batchSize,
            cacheHits,
        });
    }
    getStats(timeframe) {
        const now = Date.now();
        let timeThreshold = 0;
        switch (timeframe) {
            case 'hour':
                timeThreshold = now - (60 * 60 * 1000);
                break;
            case 'day':
                timeThreshold = now - (24 * 60 * 60 * 1000);
                break;
            case 'week':
                timeThreshold = now - (7 * 24 * 60 * 60 * 1000);
                break;
            default:
                timeThreshold = 0;
        }
        const relevantQueries = this.completedQueries.filter(q => q.startTime.getTime() > timeThreshold);
        const totalQueries = relevantQueries.length;
        const totalDuration = relevantQueries.reduce((sum, q) => sum + (q.duration || 0), 0);
        const averageQueryTime = totalQueries > 0 ? totalDuration / totalQueries : 0;
        const slowQueries = relevantQueries.filter(q => (q.duration || 0) > this.thresholds.slowQueryThreshold).length;
        const complexQueries = relevantQueries.filter(q => q.complexity > this.thresholds.maxQueryComplexity * 0.8).length;
        const totalCacheOps = relevantQueries.reduce((sum, q) => sum + q.cacheHits + q.cacheMisses, 0);
        const totalCacheHits = relevantQueries.reduce((sum, q) => sum + q.cacheHits, 0);
        const cacheHitRate = totalCacheOps > 0 ? totalCacheHits / totalCacheOps : 0;
        const queriesWithErrors = relevantQueries.filter(q => q.errors && q.errors.length > 0).length;
        const errorRate = totalQueries > 0 ? queriesWithErrors / totalQueries : 0;
        const memoryUsage = process.memoryUsage();
        return {
            totalQueries,
            averageQueryTime,
            slowQueries,
            complexQueries,
            cacheHitRate,
            errorRate,
            memoryUsage: {
                current: memoryUsage.heapUsed / 1024 / 1024,
                peak: memoryUsage.heapUsed / 1024 / 1024, // Simplified
                average: memoryUsage.heapUsed / 1024 / 1024, // Simplified
            },
            concurrentQueries: {
                current: this.activeQueries.size,
                peak: this.activeQueries.size, // Simplified
            },
            dataLoaderStats: {
                totalBatches: relevantQueries.reduce((sum, q) => sum + q.dataLoaderBatches, 0),
                averageBatchSize: 10, // Simplified
                cacheHitRate: 0.8, // Simplified
            },
        };
    }
    getSlowQueries(limit = 10) {
        return [...this.completedQueries]
            .filter(q => q.duration !== undefined)
            .sort((a, b) => (b.duration || 0) - (a.duration || 0))
            .slice(0, limit);
    }
    getComplexQueries(limit = 10) {
        return [...this.completedQueries]
            .sort((a, b) => b.complexity - a.complexity)
            .slice(0, limit);
    }
    getAlerts(severity) {
        return severity
            ? this.alerts.filter(a => a.severity === severity)
            : [...this.alerts];
    }
    setThresholds(thresholds) {
        this.thresholds = { ...this.thresholds, ...thresholds };
        this.logger.info('Performance thresholds updated', { thresholds: this.thresholds });
    }
    async generateReport(timeframe, format) {
        const stats = this.getStats(timeframe);
        const slowQueries = this.getSlowQueries(5);
        const complexQueries = this.getComplexQueries(5);
        const recentAlerts = this.alerts.slice(-10);
        const reportData = {
            timestamp: new Date().toISOString(),
            timeframe,
            stats,
            slowQueries,
            complexQueries,
            alerts: recentAlerts,
        };
        switch (format) {
            case 'json':
                return JSON.stringify(reportData, null, 2);
            case 'csv':
                return this.generateCSVReport(reportData);
            case 'html':
                return this.generateHTMLReport(reportData);
            default:
                throw new Error(`Unsupported format: ${format}`);
        }
    }
    createAlert(type, severity, message, metric, value, threshold, queryId, operation) {
        const alert = {
            type,
            severity,
            message,
            metric,
            value,
            threshold,
            timestamp: new Date(),
            queryId,
            operation,
        };
        this.alerts.push(alert);
        // Keep only recent alerts (last 100)
        if (this.alerts.length > 100) {
            this.alerts = this.alerts.slice(-100);
        }
        this.logger.warn('Performance alert created', { alert });
    }
    extractOperationName(document) {
        for (const definition of document.definitions) {
            if (definition.kind === Kind.OPERATION_DEFINITION) {
                return definition.name?.value || 'Anonymous';
            }
        }
        return 'Unknown';
    }
    extractOperationType(document) {
        for (const definition of document.definitions) {
            if (definition.kind === Kind.OPERATION_DEFINITION) {
                return definition.operation;
            }
        }
        return 'query';
    }
    pathToArray(path) {
        const result = [];
        let current = path;
        while (current) {
            result.unshift(String(current.key));
            current = current.prev;
        }
        return result;
    }
    generateCSVReport(data) {
        // Simplified CSV generation
        const headers = ['timestamp', 'metric', 'value'];
        const rows = [
            [data.timestamp, 'totalQueries', data.stats.totalQueries],
            [data.timestamp, 'averageQueryTime', data.stats.averageQueryTime],
            [data.timestamp, 'errorRate', data.stats.errorRate],
        ];
        return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    }
    generateHTMLReport(data) {
        return `
      <html>
        <head><title>GraphQL Performance Report</title></head>
        <body>
          <h1>Performance Report (${data.timeframe})</h1>
          <h2>Statistics</h2>
          <ul>
            <li>Total Queries: ${data.stats.totalQueries}</li>
            <li>Average Query Time: ${data.stats.averageQueryTime.toFixed(2)}ms</li>
            <li>Error Rate: ${(data.stats.errorRate * 100).toFixed(2)}%</li>
            <li>Cache Hit Rate: ${(data.stats.cacheHitRate * 100).toFixed(2)}%</li>
          </ul>
          <h2>Recent Alerts</h2>
          <ul>
            ${data.alerts.map((alert) => `<li>${alert.severity}: ${alert.message}</li>`).join('')}
          </ul>
        </body>
      </html>
    `;
    }
};
PerformanceMonitor = __decorate([
    injectable(),
    __param(0, inject(GRAPHQL_TOOLKIT_TYPES.ILogger)),
    __param(1, inject(GRAPHQL_TOOLKIT_TYPES.IQueryComplexityAnalyzer)),
    __metadata("design:paramtypes", [Object, Object])
], PerformanceMonitor);
export { PerformanceMonitor };
//# sourceMappingURL=PerformanceMonitor.js.map