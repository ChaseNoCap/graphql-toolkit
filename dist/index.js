// Core implementations
export { SchemaComposer } from './implementations/SchemaComposer.js';
export { DataLoaderFactory, DataLoaderRegistry } from './implementations/DataLoaderFactory.js';
export { ErrorHandler, ErrorFormatter, ErrorLogger, ErrorMonitor, } from './implementations/ErrorHandler.js';
export { SubscriptionManager } from './implementations/SubscriptionManager.js';
export { PerformanceMonitor, QueryComplexityAnalyzer, } from './implementations/PerformanceMonitor.js';
// Types and tokens
export { GRAPHQL_TOOLKIT_TYPES } from './types/InjectionTokens.js';
// Container and factory utilities
export { createGraphQLContainer, createSchemaComposer, createDataLoaderFactory, createErrorHandler, createSubscriptionManager, createPerformanceMonitor, } from './utils/GraphQLContainer.js';
// Re-export DataLoader
export { default as DataLoader } from 'dataloader';
// Mercurius integration utilities
export const createMercuriusPlugin = async (config) => {
    const { createGraphQLContainer } = await import('./utils/GraphQLContainer.js');
    const container = await createGraphQLContainer({ config });
    return {
        container,
        // Helper to get services from container
        getService: (token) => container.get(token),
    };
};
// Default configurations
export const DEFAULT_PERFORMANCE_THRESHOLDS = {
    maxQueryComplexity: 100,
    maxQueryDepth: 10,
    slowQueryThreshold: 1000,
    maxMemoryUsage: 512,
    maxConcurrentQueries: 100,
    dataLoaderBatchThreshold: 10,
};
export const DEFAULT_ERROR_OPTIONS = {
    includeStackTrace: process.env.NODE_ENV === 'development',
    includeVariables: process.env.NODE_ENV === 'development',
    sanitizeErrors: process.env.NODE_ENV === 'production',
    logErrors: true,
    enableExtensions: true,
    maskInternalErrors: process.env.NODE_ENV === 'production',
};
export const DEFAULT_SUBSCRIPTION_OPTIONS = {
    bufferSize: 100,
    keepAlive: true,
    keepAliveInterval: 30000,
    connectionTimeout: 300000,
    maxConnections: 1000,
    enableCompression: true,
    enableBatching: false,
};
// Version information
export const VERSION = '1.0.0';
//# sourceMappingURL=index.js.map