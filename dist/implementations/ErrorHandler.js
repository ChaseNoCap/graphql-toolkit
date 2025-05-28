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
import { GraphQLError } from 'graphql';
import { GRAPHQL_TOOLKIT_TYPES } from '../types/InjectionTokens.js';
let ErrorFormatter = class ErrorFormatter {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    format(error, context) {
        const extensions = this.createExtensions(error, context);
        return {
            message: this.sanitizeMessage(error.message),
            locations: error.locations,
            path: error.path,
            extensions: extensions,
        };
    }
    createExtensions(error, context) {
        const classification = this.classify(error);
        const extensions = {
            code: this.getErrorCode(error),
            classification,
            timestamp: new Date().toISOString(),
            requestId: context?.requestId,
            userId: context?.userId,
            path: error.path,
            operation: context?.operation,
        };
        // Add field information if available
        if (error.path && error.path.length > 0) {
            extensions.field = error.path[error.path.length - 1];
        }
        // Add variables in development
        if (context?.variables && process.env.NODE_ENV !== 'production') {
            extensions.variables = this.sanitizeVariables(context.variables);
        }
        // Add original error information
        if (error.originalError) {
            extensions.originalError = {
                name: error.originalError.name,
                message: error.originalError.message,
                stack: process.env.NODE_ENV === 'development' ? error.originalError.stack : undefined,
            };
        }
        // Add stack trace in development
        if (process.env.NODE_ENV === 'development' && error.stack) {
            extensions.stack = error.stack;
        }
        return extensions;
    }
    sanitize(error) {
        const classification = this.classify(error);
        if (classification === 'SystemError' && process.env.NODE_ENV === 'production') {
            return new GraphQLError('An internal error occurred', error.nodes, error.source, error.positions, error.path, error.originalError, {
                ...error.extensions,
                code: 'INTERNAL_ERROR',
                classification: 'SystemError',
            });
        }
        return error;
    }
    classify(error) {
        const code = this.getErrorCode(error);
        // Classify based on error code
        switch (code) {
            case 'GRAPHQL_VALIDATION_FAILED':
            case 'GRAPHQL_PARSE_FAILED':
            case 'BAD_USER_INPUT':
                return 'ValidationError';
            case 'UNAUTHENTICATED':
            case 'FORBIDDEN':
            case 'NOT_FOUND':
                return 'UserError';
            case 'BUSINESS_RULE_VIOLATION':
            case 'CONSTRAINT_VIOLATION':
                return 'BusinessError';
            default:
                return 'SystemError';
        }
    }
    getErrorCode(error) {
        if (error.extensions?.code) {
            return String(error.extensions.code);
        }
        // Infer code from error type
        if (error.message.includes('validation')) {
            return 'GRAPHQL_VALIDATION_FAILED';
        }
        if (error.message.includes('parse') || error.message.includes('syntax')) {
            return 'GRAPHQL_PARSE_FAILED';
        }
        if (error.message.includes('unauthorized') || error.message.includes('authentication')) {
            return 'UNAUTHENTICATED';
        }
        if (error.message.includes('forbidden') || error.message.includes('permission')) {
            return 'FORBIDDEN';
        }
        if (error.message.includes('not found')) {
            return 'NOT_FOUND';
        }
        return 'INTERNAL_ERROR';
    }
    sanitizeMessage(message) {
        // Remove sensitive information from error messages
        return message
            .replace(/password\s*=\s*[^\s]+/gi, 'password=***')
            .replace(/token\s*=\s*[^\s]+/gi, 'token=***')
            .replace(/key\s*=\s*[^\s]+/gi, 'key=***');
    }
    sanitizeVariables(variables) {
        const sanitized = {};
        for (const [key, value] of Object.entries(variables)) {
            if (key.toLowerCase().includes('password') ||
                key.toLowerCase().includes('token') ||
                key.toLowerCase().includes('secret')) {
                sanitized[key] = '***';
            }
            else {
                sanitized[key] = value;
            }
        }
        return sanitized;
    }
};
ErrorFormatter = __decorate([
    injectable(),
    __param(0, inject(GRAPHQL_TOOLKIT_TYPES.ILogger)),
    __metadata("design:paramtypes", [Object])
], ErrorFormatter);
export { ErrorFormatter };
let ErrorLogger = class ErrorLogger {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    logError(error, context) {
        const extensions = (error.extensions || {});
        const classification = extensions.classification || 'SystemError';
        const logData = {
            message: error.message,
            code: extensions?.code,
            classification,
            path: error.path,
            operation: context?.operation,
            userId: context?.userId,
            requestId: context?.requestId,
            locations: error.locations,
        };
        // Log at appropriate level based on classification
        switch (classification) {
            case 'ValidationError':
            case 'UserError':
                this.logger.warn('GraphQL user error', logData);
                break;
            case 'BusinessError':
                this.logger.info('GraphQL business error', logData);
                break;
            case 'SystemError':
            default:
                this.logger.error('GraphQL system error', error, logData);
                break;
        }
    }
    logPerformanceWarning(message, metrics) {
        this.logger.warn('GraphQL performance warning', { message, ...metrics });
    }
    logValidationError(errors) {
        this.logger.warn('GraphQL validation errors', {
            errorCount: errors.length,
            errors: errors.map(e => ({
                message: e.message,
                locations: e.locations,
            })),
        });
    }
};
ErrorLogger = __decorate([
    injectable(),
    __param(0, inject(GRAPHQL_TOOLKIT_TYPES.ILogger)),
    __metadata("design:paramtypes", [Object])
], ErrorLogger);
export { ErrorLogger };
let ErrorMonitor = class ErrorMonitor {
    metrics = {
        totalErrors: 0,
        errorsByType: new Map(),
        errorsByCode: new Map(),
        errorsByPath: new Map(),
        averageResponseTime: 0,
        lastError: new Date(),
        errorRate: 0,
    };
    startTime = Date.now();
    totalRequests = 0;
    trackError(error, context) {
        this.metrics.totalErrors++;
        this.metrics.lastError = new Date();
        this.totalRequests++;
        // Track by classification
        const extensions = (error.extensions || {});
        const classification = extensions.classification || 'SystemError';
        const currentCount = this.metrics.errorsByType.get(classification) || 0;
        this.metrics.errorsByType.set(classification, currentCount + 1);
        // Track by error code
        const code = extensions?.code || 'UNKNOWN';
        const codeCount = this.metrics.errorsByCode.get(code) || 0;
        this.metrics.errorsByCode.set(code, codeCount + 1);
        // Track by path
        if (error.path) {
            const pathStr = error.path.join('.');
            const pathCount = this.metrics.errorsByPath.get(pathStr) || 0;
            this.metrics.errorsByPath.set(pathStr, pathCount + 1);
        }
        // Calculate error rate
        this.metrics.errorRate = this.metrics.totalErrors / this.totalRequests;
    }
    getMetrics() {
        return {
            ...this.metrics,
            errorsByType: new Map(this.metrics.errorsByType),
            errorsByCode: new Map(this.metrics.errorsByCode),
            errorsByPath: new Map(this.metrics.errorsByPath),
        };
    }
    getErrorTrends(timeframe) {
        // This would typically connect to a time-series database
        // For now, return empty map
        return new Map();
    }
    isErrorRateHigh() {
        return this.metrics.errorRate > 0.05; // 5% threshold
    }
    reset() {
        this.metrics = {
            totalErrors: 0,
            errorsByType: new Map(),
            errorsByCode: new Map(),
            errorsByPath: new Map(),
            averageResponseTime: 0,
            lastError: new Date(),
            errorRate: 0,
        };
        this.totalRequests = 0;
        this.startTime = Date.now();
    }
};
ErrorMonitor = __decorate([
    injectable()
], ErrorMonitor);
export { ErrorMonitor };
let ErrorHandler = class ErrorHandler {
    formatter;
    errorLogger;
    monitor;
    options = {
        includeStackTrace: process.env.NODE_ENV === 'development',
        includeVariables: process.env.NODE_ENV === 'development',
        sanitizeErrors: process.env.NODE_ENV === 'production',
        logErrors: true,
        enableExtensions: true,
        maskInternalErrors: process.env.NODE_ENV === 'production',
    };
    constructor(formatter, errorLogger, monitor) {
        this.formatter = formatter;
        this.errorLogger = errorLogger;
        this.monitor = monitor;
    }
    handleExecutionError(error, context) {
        // Log the error
        if (this.options.logErrors) {
            this.errorLogger.logError(error, context);
        }
        // Track the error
        this.monitor.trackError(error, context);
        // Sanitize if needed
        const processedError = this.options.sanitizeErrors ? this.formatter.sanitize(error) : error;
        // Format the error
        return this.formatter.format(processedError, context);
    }
    handleValidationErrors(errors) {
        // Log validation errors
        if (this.options.logErrors) {
            this.errorLogger.logValidationError(errors);
        }
        // Track each error
        errors.forEach(error => this.monitor.trackError(error));
        // Format each error
        return errors.map(error => this.formatter.format(error));
    }
    handleSchemaError(error) {
        const graphqlError = new GraphQLError(error.message, undefined, undefined, undefined, undefined, error, {
            code: 'SCHEMA_ERROR',
            classification: 'SystemError',
        });
        return this.handleExecutionError(graphqlError);
    }
    createUserError(message, code, metadata) {
        return new GraphQLError(message, undefined, undefined, undefined, undefined, undefined, {
            code: code || 'USER_ERROR',
            classification: 'UserError',
            ...metadata,
        });
    }
    createBusinessError(message, code, metadata) {
        return new GraphQLError(message, undefined, undefined, undefined, undefined, undefined, {
            code: code || 'BUSINESS_ERROR',
            classification: 'BusinessError',
            ...metadata,
        });
    }
    createSystemError(error, requestId) {
        const message = this.options.maskInternalErrors
            ? 'An internal error occurred'
            : error.message;
        return new GraphQLError(message, undefined, undefined, undefined, undefined, error, {
            code: 'INTERNAL_ERROR',
            classification: 'SystemError',
            requestId,
        });
    }
    configure(options) {
        this.options = { ...this.options, ...options };
    }
};
ErrorHandler = __decorate([
    injectable(),
    __param(0, inject(GRAPHQL_TOOLKIT_TYPES.IErrorFormatter)),
    __param(1, inject(GRAPHQL_TOOLKIT_TYPES.IErrorLogger)),
    __param(2, inject(GRAPHQL_TOOLKIT_TYPES.IErrorMonitor)),
    __metadata("design:paramtypes", [Object, Object, Object])
], ErrorHandler);
export { ErrorHandler };
//# sourceMappingURL=ErrorHandler.js.map