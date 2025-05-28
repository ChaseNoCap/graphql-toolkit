export interface ICache<T = any> {
    get(key: string): Promise<T | undefined>;
    set(key: string, value: T, ttl?: number): Promise<void>;
    has(key: string): Promise<boolean>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
}
export interface CacheEntry<T> {
    value: T;
    expiresAt?: Date;
    setAt: Date;
}
export interface CacheStats {
    hits: number;
    misses: number;
    sets: number;
    deletes: number;
    clears: number;
}
export declare class MockCache<T = any> implements ICache<T> {
    private storage;
    stats: CacheStats;
    get(key: string): Promise<T | undefined>;
    set(key: string, value: T, ttl?: number): Promise<void>;
    has(key: string): Promise<boolean>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
    getHitRate(): number;
    resetStats(): void;
    getAllKeys(): string[];
    getAllEntries(): Array<[string, CacheEntry<T>]>;
    simulateExpiration(): void;
    setEntryTime(key: string, setAt: Date, expiresAt?: Date): void;
}
//# sourceMappingURL=MockCache.d.ts.map