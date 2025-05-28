import DataLoader from 'dataloader';
import type { ILogger } from '@chasenocap/logger';
import type { ICache } from '@chasenocap/cache';
import type { IDataLoaderFactory, IDataLoaderRegistry, IDataLoaderConfig, IDataLoaderStats, IBatchLoadFunction, IDataLoaderOptions, IDataLoaderMetadata } from '../interfaces/IDataLoaderFactory.js';
export declare class DataLoaderRegistry implements IDataLoaderRegistry {
    private logger;
    private loaders;
    private stats;
    private metadata;
    constructor(logger: ILogger);
    register<K, V, C = K>(name: string, config: IDataLoaderConfig<K, V, C>): DataLoader<K, V, C>;
    get<K, V, C = K>(name: string): DataLoader<K, V, C> | undefined;
    has(name: string): boolean;
    unregister(name: string): boolean;
    clear(): void;
    getNames(): string[];
    getStats(): Map<string, IDataLoaderStats>;
    getStatsFor(name: string): IDataLoaderStats | undefined;
    prime<K, V>(name: string, key: K, value: V): boolean;
    clearCache(name: string): boolean;
    private createInstrumentedBatchFunction;
}
export declare class DataLoaderFactory implements IDataLoaderFactory {
    private logger;
    private cache;
    private registry;
    constructor(logger: ILogger, cache: ICache, registry: IDataLoaderRegistry);
    create<K, V, C = K>(config: IDataLoaderConfig<K, V, C>): DataLoader<K, V, C>;
    createBatchLoader<K, V, C = K>(batchLoadFn: IBatchLoadFunction<K, V>, options?: IDataLoaderOptions<K, V, C>): DataLoader<K, V, C>;
    createCachedLoader<K, V, C = K>(batchLoadFn: IBatchLoadFunction<K, V>, options: IDataLoaderOptions<K, V, C> & {
        redisTTL?: number;
    }): DataLoader<K, V, C>;
    createMonitoredLoader<K, V, C = K>(batchLoadFn: IBatchLoadFunction<K, V>, metadata: IDataLoaderMetadata, options?: IDataLoaderOptions<K, V, C>): DataLoader<K, V, C>;
    getRegistry(): IDataLoaderRegistry;
}
//# sourceMappingURL=DataLoaderFactory.d.ts.map