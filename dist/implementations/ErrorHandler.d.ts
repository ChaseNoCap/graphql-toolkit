import { GraphQLError, GraphQLFormattedError } from 'graphql';
import type { ILogger } from '@chasenocap/logger';
import type { IErrorHandler, IErrorFormatter, IErrorLogger, IErrorMonitor, IErrorHandlerOptions, IGraphQLErrorExtensions, IErrorContext, IErrorMetrics } from '../interfaces/IErrorHandler.js';
export declare class ErrorFormatter implements IErrorFormatter {
    private logger;
    constructor(logger: ILogger);
    format(error: GraphQLError, context?: IErrorContext): GraphQLFormattedError;
    createExtensions(error: GraphQLError, context?: IErrorContext): IGraphQLErrorExtensions;
    sanitize(error: GraphQLError): GraphQLError;
    classify(error: GraphQLError): IGraphQLErrorExtensions['classification'];
    private getErrorCode;
    private sanitizeMessage;
    private sanitizeVariables;
}
export declare class ErrorLogger implements IErrorLogger {
    private logger;
    constructor(logger: ILogger);
    logError(error: GraphQLError, context?: IErrorContext): void;
    logPerformanceWarning(message: string, metrics: Record<string, any>): void;
    logValidationError(errors: GraphQLError[]): void;
}
export declare class ErrorMonitor implements IErrorMonitor {
    private metrics;
    private startTime;
    private totalRequests;
    trackError(error: GraphQLError, context?: IErrorContext): void;
    getMetrics(): IErrorMetrics;
    getErrorTrends(timeframe: 'hour' | 'day' | 'week'): Map<string, number>;
    isErrorRateHigh(): boolean;
    reset(): void;
}
export declare class ErrorHandler implements IErrorHandler {
    private formatter;
    private errorLogger;
    private monitor;
    private options;
    constructor(formatter: IErrorFormatter, errorLogger: IErrorLogger, monitor: IErrorMonitor);
    handleExecutionError(error: GraphQLError, context?: IErrorContext): GraphQLFormattedError;
    handleValidationErrors(errors: readonly GraphQLError[]): GraphQLFormattedError[];
    handleSchemaError(error: Error): GraphQLFormattedError;
    createUserError(message: string, code?: string, metadata?: Record<string, any>): GraphQLError;
    createBusinessError(message: string, code?: string, metadata?: Record<string, any>): GraphQLError;
    createSystemError(error: Error, requestId?: string): GraphQLError;
    configure(options: IErrorHandlerOptions): void;
}
//# sourceMappingURL=ErrorHandler.d.ts.map