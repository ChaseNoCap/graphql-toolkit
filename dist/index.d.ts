export type { ISchemaComposer, IFederationGateway, ISchemaLayer, ICompositionOptions, IComposedSchema, ISchemaMetadata, IValidationResult, ISchemaConflict, IFederationSubgraph, IMercuriusConfig, } from './interfaces/ISchemaComposer.js';
export type { IDataLoaderFactory, IDataLoaderRegistry, IBatchLoadFunction, IDataLoaderOptions, IDataLoaderConfig, IDataLoaderMetadata, IDataLoaderStats, IDataLoaderFactoryOptions, IGraphQLContext, } from './interfaces/IDataLoaderFactory.js';
export type { IErrorHandler, IErrorFormatter, IErrorLogger, IErrorMonitor, IErrorRecovery, IErrorHandlerOptions, IGraphQLErrorExtensions, IErrorContext, IErrorMetrics, } from './interfaces/IErrorHandler.js';
export type { ISubscriptionManager, IWebSocketManager, ISubscriptionAuth, ISubscriptionPayload, ISubscriptionFilter, ISubscriptionResolver, ISubscriptionOptions, ISubscriptionConnection, ISubscriptionStats, ISubscriptionHealth, ISubscriptionMiddleware, } from './interfaces/ISubscriptionManager.js';
export type { IPerformanceMonitor, IQueryComplexityAnalyzer, IPerformanceOptimizer, IQueryMetrics, IFieldMetrics, IPerformanceThresholds, IPerformanceStats, IPerformanceAlert, IQueryValidationResult, IQueryCostEstimate, IThresholdViolation, IOptimizationSuggestion, } from './interfaces/IPerformanceMonitor.js';
export { SchemaComposer } from './implementations/SchemaComposer.js';
export { DataLoaderFactory, DataLoaderRegistry } from './implementations/DataLoaderFactory.js';
export { ErrorHandler, ErrorFormatter, ErrorLogger, ErrorMonitor, } from './implementations/ErrorHandler.js';
export { SubscriptionManager } from './implementations/SubscriptionManager.js';
export { PerformanceMonitor, QueryComplexityAnalyzer, } from './implementations/PerformanceMonitor.js';
export { GRAPHQL_TOOLKIT_TYPES } from './types/InjectionTokens.js';
export type { IGraphQLToolkitConfig, IMercuriusPluginOptions, IResolverContext, ISubscriptionContext, IFederationContext, QueryComplexityRule, DepthLimitRule, IGraphQLMiddleware, ISchemaDirective, IGraphQLPlugin, IQueryPlan, IQueryStep, IFederationEntity, ISubgraphHealth, IGatewayHealth, } from './types/GraphQLTypes.js';
export { createGraphQLContainer, createSchemaComposer, createDataLoaderFactory, createErrorHandler, createSubscriptionManager, createPerformanceMonitor, } from './utils/GraphQLContainer.js';
export type { IGraphQLToolkitOptions } from './utils/GraphQLContainer.js';
export type { GraphQLSchema, GraphQLError, GraphQLFormattedError, DocumentNode, GraphQLResolveInfo, } from 'graphql';
export { default as DataLoader } from 'dataloader';
export declare const createMercuriusPlugin: (config: any) => Promise<{
    container: import("inversify").Container;
    getService: <T>(token: symbol) => T;
}>;
export declare const DEFAULT_PERFORMANCE_THRESHOLDS: {
    readonly maxQueryComplexity: 100;
    readonly maxQueryDepth: 10;
    readonly slowQueryThreshold: 1000;
    readonly maxMemoryUsage: 512;
    readonly maxConcurrentQueries: 100;
    readonly dataLoaderBatchThreshold: 10;
};
export declare const DEFAULT_ERROR_OPTIONS: {
    readonly includeStackTrace: boolean;
    readonly includeVariables: boolean;
    readonly sanitizeErrors: boolean;
    readonly logErrors: true;
    readonly enableExtensions: true;
    readonly maskInternalErrors: boolean;
};
export declare const DEFAULT_SUBSCRIPTION_OPTIONS: {
    readonly bufferSize: 100;
    readonly keepAlive: true;
    readonly keepAliveInterval: 30000;
    readonly connectionTimeout: 300000;
    readonly maxConnections: 1000;
    readonly enableCompression: true;
    readonly enableBatching: false;
};
export declare const VERSION = "1.0.0";
//# sourceMappingURL=index.d.ts.map