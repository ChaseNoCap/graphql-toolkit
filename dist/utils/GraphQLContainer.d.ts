import { Container } from 'inversify';
import type { ISchemaComposer } from '../interfaces/ISchemaComposer.js';
import type { IDataLoaderFactory } from '../interfaces/IDataLoaderFactory.js';
import type { IErrorHandler } from '../interfaces/IErrorHandler.js';
import type { ISubscriptionManager } from '../interfaces/ISubscriptionManager.js';
import type { IPerformanceMonitor } from '../interfaces/IPerformanceMonitor.js';
import type { IGraphQLToolkitConfig } from '../types/GraphQLTypes.js';
export interface IGraphQLToolkitOptions {
    config?: IGraphQLToolkitConfig;
    enableLogging?: boolean;
    enableCaching?: boolean;
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
}
export declare function createGraphQLContainer(options?: IGraphQLToolkitOptions): Promise<Container>;
export declare function createSchemaComposer(options?: IGraphQLToolkitOptions): Promise<ISchemaComposer>;
export declare function createDataLoaderFactory(options?: IGraphQLToolkitOptions): Promise<IDataLoaderFactory>;
export declare function createErrorHandler(options?: IGraphQLToolkitOptions): Promise<IErrorHandler>;
export declare function createSubscriptionManager(options?: IGraphQLToolkitOptions): Promise<ISubscriptionManager>;
export declare function createPerformanceMonitor(options?: IGraphQLToolkitOptions): Promise<IPerformanceMonitor>;
//# sourceMappingURL=GraphQLContainer.d.ts.map