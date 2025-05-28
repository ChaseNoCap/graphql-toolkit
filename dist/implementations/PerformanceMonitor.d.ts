import { DocumentNode, GraphQLResolveInfo } from 'graphql';
import type { ILogger } from '@chasenocap/logger';
import type { IPerformanceMonitor, IQueryComplexityAnalyzer, IQueryMetrics, IFieldMetrics, IPerformanceThresholds, IPerformanceStats, IPerformanceAlert, IQueryValidationResult, IQueryCostEstimate } from '../interfaces/IPerformanceMonitor.js';
export declare class QueryComplexityAnalyzer implements IQueryComplexityAnalyzer {
    private logger;
    constructor(logger: ILogger);
    calculateComplexity(document: DocumentNode, variables?: Record<string, any>): number;
    calculateDepth(document: DocumentNode): number;
    countFields(document: DocumentNode): number;
    validateQuery(document: DocumentNode, variables?: Record<string, any>, thresholds?: Partial<IPerformanceThresholds>): IQueryValidationResult;
    estimateCost(document: DocumentNode, variables?: Record<string, any>): IQueryCostEstimate;
}
export declare class PerformanceMonitor implements IPerformanceMonitor {
    private logger;
    private complexityAnalyzer;
    private activeQueries;
    private completedQueries;
    private fieldMetrics;
    private alerts;
    private thresholds;
    constructor(logger: ILogger, complexityAnalyzer: IQueryComplexityAnalyzer);
    startQuery(queryId: string, document: DocumentNode, variables?: Record<string, any>, context?: any): IQueryMetrics;
    endQuery(queryId: string, errors?: Error[]): void;
    startField(queryId: string, info: GraphQLResolveInfo): IFieldMetrics;
    endField(queryId: string, fieldPath: string[], errors?: Error[]): void;
    recordCacheEvent(queryId: string, fieldPath: string[], hit: boolean): void;
    recordDataLoaderBatch(queryId: string, loaderName: string, batchSize: number, cacheHits: number): void;
    getStats(timeframe?: 'hour' | 'day' | 'week'): IPerformanceStats;
    getSlowQueries(limit?: number): IQueryMetrics[];
    getComplexQueries(limit?: number): IQueryMetrics[];
    getAlerts(severity?: IPerformanceAlert['severity']): IPerformanceAlert[];
    setThresholds(thresholds: Partial<IPerformanceThresholds>): void;
    generateReport(timeframe: 'hour' | 'day' | 'week', format: 'json' | 'csv' | 'html'): Promise<string>;
    private createAlert;
    private extractOperationName;
    private extractOperationType;
    private pathToArray;
    private generateCSVReport;
    private generateHTMLReport;
}
//# sourceMappingURL=PerformanceMonitor.d.ts.map