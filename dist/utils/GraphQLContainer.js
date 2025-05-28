import { Container } from 'inversify';
// Implementations
import { SchemaComposer } from '../implementations/SchemaComposer.js';
import { DataLoaderFactory, DataLoaderRegistry } from '../implementations/DataLoaderFactory.js';
import { ErrorHandler, ErrorFormatter, ErrorLogger, ErrorMonitor } from '../implementations/ErrorHandler.js';
import { SubscriptionManager } from '../implementations/SubscriptionManager.js';
import { PerformanceMonitor, QueryComplexityAnalyzer } from '../implementations/PerformanceMonitor.js';
// Types
import { GRAPHQL_TOOLKIT_TYPES } from '../types/InjectionTokens.js';
export async function createGraphQLContainer(options = {}) {
    const container = new Container();
    const config = {
        enableFederation: true,
        enablePerformanceMonitoring: true,
        enableErrorHandling: true,
        enableSubscriptions: true,
        enableDataLoaders: true,
        ...options.config,
    };
    // Core dependencies - these would be injected by the consuming application
    // For now, we'll create mock implementations for testing
    // Schema Composition
    if (config.enableFederation) {
        container.bind(GRAPHQL_TOOLKIT_TYPES.ISchemaComposer)
            .to(SchemaComposer)
            .inSingletonScope();
    }
    // DataLoader Factory
    if (config.enableDataLoaders) {
        container.bind(GRAPHQL_TOOLKIT_TYPES.IDataLoaderRegistry)
            .to(DataLoaderRegistry)
            .inSingletonScope();
        container.bind(GRAPHQL_TOOLKIT_TYPES.IDataLoaderFactory)
            .to(DataLoaderFactory)
            .inSingletonScope();
    }
    // Error Handling
    if (config.enableErrorHandling) {
        container.bind(GRAPHQL_TOOLKIT_TYPES.IErrorFormatter)
            .to(ErrorFormatter)
            .inSingletonScope();
        container.bind(GRAPHQL_TOOLKIT_TYPES.IErrorLogger)
            .to(ErrorLogger)
            .inSingletonScope();
        container.bind(GRAPHQL_TOOLKIT_TYPES.IErrorMonitor)
            .to(ErrorMonitor)
            .inSingletonScope();
        container.bind(GRAPHQL_TOOLKIT_TYPES.IErrorHandler)
            .to(ErrorHandler)
            .inSingletonScope();
    }
    // Subscription Management
    if (config.enableSubscriptions) {
        container.bind(GRAPHQL_TOOLKIT_TYPES.ISubscriptionManager)
            .to(SubscriptionManager)
            .inSingletonScope();
    }
    // Performance Monitoring
    if (config.enablePerformanceMonitoring) {
        container.bind(GRAPHQL_TOOLKIT_TYPES.IQueryComplexityAnalyzer)
            .to(QueryComplexityAnalyzer)
            .inSingletonScope();
        container.bind(GRAPHQL_TOOLKIT_TYPES.IPerformanceMonitor)
            .to(PerformanceMonitor)
            .inSingletonScope();
    }
    return container;
}
// Convenience factory functions
export async function createSchemaComposer(options) {
    const container = await createGraphQLContainer({
        ...options,
        config: { enableFederation: true, ...options?.config },
    });
    return container.get(GRAPHQL_TOOLKIT_TYPES.ISchemaComposer);
}
export async function createDataLoaderFactory(options) {
    const container = await createGraphQLContainer({
        ...options,
        config: { enableDataLoaders: true, ...options?.config },
    });
    return container.get(GRAPHQL_TOOLKIT_TYPES.IDataLoaderFactory);
}
export async function createErrorHandler(options) {
    const container = await createGraphQLContainer({
        ...options,
        config: { enableErrorHandling: true, ...options?.config },
    });
    return container.get(GRAPHQL_TOOLKIT_TYPES.IErrorHandler);
}
export async function createSubscriptionManager(options) {
    const container = await createGraphQLContainer({
        ...options,
        config: { enableSubscriptions: true, ...options?.config },
    });
    return container.get(GRAPHQL_TOOLKIT_TYPES.ISubscriptionManager);
}
export async function createPerformanceMonitor(options) {
    const container = await createGraphQLContainer({
        ...options,
        config: { enablePerformanceMonitoring: true, ...options?.config },
    });
    return container.get(GRAPHQL_TOOLKIT_TYPES.IPerformanceMonitor);
}
//# sourceMappingURL=GraphQLContainer.js.map