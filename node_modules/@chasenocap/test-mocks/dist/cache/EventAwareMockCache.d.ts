import { EventAwareInterfaceMock } from '../base/EventAwareMock.js';
import type { ICache, CacheStats } from './MockCache.js';
export declare class EventAwareMockCache<T = any> extends EventAwareInterfaceMock<ICache<T>> implements ICache<T> {
    private storage;
    stats: CacheStats;
    constructor();
    get(key: string): Promise<T | undefined>;
    set(key: string, value: T, ttl?: number): Promise<void>;
    has(key: string): Promise<boolean>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
    getStats(): Promise<CacheStats & {
        size: number;
        hitRate: number;
        operations: number;
    }>;
    warm(entries: Record<string, T>, ttl?: number): Promise<void>;
    expireKey(key: string): Promise<void>;
    resetStats(): Promise<void>;
}
//# sourceMappingURL=EventAwareMockCache.d.ts.map