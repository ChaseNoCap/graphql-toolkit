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
import DataLoader from 'dataloader';
import { GRAPHQL_TOOLKIT_TYPES } from '../types/InjectionTokens.js';
let DataLoaderRegistry = class DataLoaderRegistry {
    logger;
    loaders = new Map();
    stats = new Map();
    metadata = new Map();
    constructor(logger) {
        this.logger = logger;
    }
    register(name, config) {
        if (this.loaders.has(name)) {
            throw new Error(`DataLoader '${name}' is already registered`);
        }
        this.logger.debug('Registering DataLoader', { name, entity: config.metadata?.entity });
        // Create instrumented batch function
        const instrumentedBatchFn = this.createInstrumentedBatchFunction(name, config.batchLoadFn);
        // Create DataLoader with instrumented function
        const loader = new DataLoader(instrumentedBatchFn, config.options);
        // Store metadata and initialize stats
        if (config.metadata) {
            this.metadata.set(name, config.metadata);
        }
        this.stats.set(name, {
            name,
            totalRequests: 0,
            batchedRequests: 0,
            cacheHits: 0,
            cacheMisses: 0,
            averageBatchSize: 0,
            maxBatchSize: 0,
            totalLatency: 0,
            averageLatency: 0,
            errors: 0,
            createdAt: new Date(),
            lastUsed: new Date(),
        });
        this.loaders.set(name, loader);
        return loader;
    }
    get(name) {
        return this.loaders.get(name);
    }
    has(name) {
        return this.loaders.has(name);
    }
    unregister(name) {
        const removed = this.loaders.delete(name);
        if (removed) {
            this.stats.delete(name);
            this.metadata.delete(name);
            this.logger.debug('Unregistered DataLoader', { name });
        }
        return removed;
    }
    clear() {
        const count = this.loaders.size;
        this.loaders.clear();
        this.stats.clear();
        this.metadata.clear();
        this.logger.debug('Cleared all DataLoaders', { count });
    }
    getNames() {
        return Array.from(this.loaders.keys());
    }
    getStats() {
        return new Map(this.stats);
    }
    getStatsFor(name) {
        return this.stats.get(name);
    }
    prime(name, key, value) {
        const loader = this.loaders.get(name);
        if (!loader) {
            return false;
        }
        loader.prime(key, value);
        // Update cache hit stats
        const stats = this.stats.get(name);
        if (stats) {
            stats.cacheHits++;
        }
        return true;
    }
    clearCache(name) {
        const loader = this.loaders.get(name);
        if (!loader) {
            return false;
        }
        loader.clearAll();
        this.logger.debug('Cleared cache for DataLoader', { name });
        return true;
    }
    createInstrumentedBatchFunction(name, originalBatchFn) {
        return async (keys) => {
            const startTime = Date.now();
            const stats = this.stats.get(name);
            if (stats) {
                stats.batchedRequests++;
                stats.totalRequests += keys.length;
                stats.maxBatchSize = Math.max(stats.maxBatchSize, keys.length);
                stats.lastUsed = new Date();
            }
            try {
                const results = await originalBatchFn(keys);
                const duration = Date.now() - startTime;
                if (stats) {
                    stats.totalLatency += duration;
                    stats.averageLatency = stats.totalLatency / stats.batchedRequests;
                    stats.averageBatchSize = stats.totalRequests / stats.batchedRequests;
                }
                this.logger.debug('DataLoader batch completed', {
                    name,
                    batchSize: keys.length,
                    duration,
                    errors: results.filter(r => r instanceof Error).length,
                });
                return results;
            }
            catch (error) {
                if (stats) {
                    stats.errors++;
                }
                this.logger.error('DataLoader batch failed', error, {
                    name,
                    batchSize: keys.length,
                });
                throw error;
            }
        };
    }
};
DataLoaderRegistry = __decorate([
    injectable(),
    __param(0, inject(GRAPHQL_TOOLKIT_TYPES.ILogger)),
    __metadata("design:paramtypes", [Object])
], DataLoaderRegistry);
export { DataLoaderRegistry };
let DataLoaderFactory = class DataLoaderFactory {
    logger;
    cache;
    registry;
    constructor(logger, cache, registry) {
        this.logger = logger;
        this.cache = cache;
        this.registry = registry;
    }
    create(config) {
        return new DataLoader(config.batchLoadFn, config.options);
    }
    createBatchLoader(batchLoadFn, options) {
        const enhancedOptions = {
            batch: true,
            cache: true,
            maxBatchSize: 100,
            ...options,
        };
        this.logger.debug('Creating batch DataLoader', {
            maxBatchSize: enhancedOptions.maxBatchSize,
            cache: enhancedOptions.cache,
        });
        return new DataLoader(batchLoadFn, enhancedOptions);
    }
    createCachedLoader(batchLoadFn, options) {
        const { redisTTL, ...dataLoaderOptions } = options;
        // Create cache map that uses external cache
        const cacheMap = new Map();
        const cacheTTL = redisTTL || 300000; // 5 minutes default
        const enhancedBatchFn = async (keys) => {
            const cacheKeys = keys.map(key => dataLoaderOptions.cacheKeyFn ? dataLoaderOptions.cacheKeyFn(key) : key);
            // Check cache first
            const cachedResults = await Promise.all(cacheKeys.map(async (cacheKey, index) => {
                try {
                    const cached = await this.cache.get(String(cacheKey));
                    return cached ? { index, value: cached } : null;
                }
                catch {
                    return null;
                }
            }));
            // Filter out cache hits
            const missedIndices = [];
            const missedKeys = [];
            cachedResults.forEach((result, index) => {
                if (!result) {
                    missedIndices.push(index);
                    missedKeys.push(keys[index]);
                }
            });
            // Fetch missed data
            let fetchedResults = [];
            if (missedKeys.length > 0) {
                fetchedResults = await batchLoadFn(missedKeys);
                // Cache the results
                await Promise.all(fetchedResults.map(async (result, missedIndex) => {
                    if (!(result instanceof Error)) {
                        const originalIndex = missedIndices[missedIndex];
                        const cacheKey = String(cacheKeys[originalIndex]);
                        try {
                            await this.cache.set(cacheKey, result, cacheTTL);
                        }
                        catch (error) {
                            this.logger.warn('Failed to cache DataLoader result', { cacheKey, error });
                        }
                    }
                }));
            }
            // Combine cached and fetched results
            const results = new Array(keys.length);
            let fetchedIndex = 0;
            for (let i = 0; i < keys.length; i++) {
                const cachedResult = cachedResults[i];
                if (cachedResult) {
                    results[i] = cachedResult.value;
                }
                else {
                    results[i] = fetchedResults[fetchedIndex++];
                }
            }
            return results;
        };
        const enhancedOptions = {
            ...dataLoaderOptions,
            batch: true,
            cache: true,
            cacheMap,
        };
        this.logger.debug('Creating cached DataLoader', {
            redisTTL: cacheTTL,
            maxBatchSize: enhancedOptions.maxBatchSize,
        });
        return new DataLoader(enhancedBatchFn, enhancedOptions);
    }
    createMonitoredLoader(batchLoadFn, metadata, options) {
        const config = {
            batchLoadFn,
            options: {
                batch: true,
                cache: true,
                maxBatchSize: metadata.performance?.expectedBatchSize || 100,
                ...options,
            },
            metadata,
        };
        return this.registry.register(metadata.name, config);
    }
    getRegistry() {
        return this.registry;
    }
};
DataLoaderFactory = __decorate([
    injectable(),
    __param(0, inject(GRAPHQL_TOOLKIT_TYPES.ILogger)),
    __param(1, inject(GRAPHQL_TOOLKIT_TYPES.ICache)),
    __param(2, inject(GRAPHQL_TOOLKIT_TYPES.IDataLoaderRegistry)),
    __metadata("design:paramtypes", [Object, Object, Object])
], DataLoaderFactory);
export { DataLoaderFactory };
//# sourceMappingURL=DataLoaderFactory.js.map