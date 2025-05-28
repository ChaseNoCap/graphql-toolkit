var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { injectable } from 'inversify';
import { EventAwareInterfaceMock } from '../base/EventAwareMock.js';
let EventAwareMockCache = class EventAwareMockCache extends EventAwareInterfaceMock {
    storage = new Map();
    stats = {
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: 0,
        clears: 0
    };
    constructor() {
        super('MockCache');
    }
    async get(key) {
        await this.emitOperationStarted('get', {
            key,
            hasKey: this.storage.has(key)
        });
        try {
            const entry = this.storage.get(key);
            if (!entry) {
                this.stats.misses++;
                await this.emitOperationCompleted('get', {
                    key,
                    result: 'miss',
                    totalHits: this.stats.hits,
                    totalMisses: this.stats.misses
                }, undefined);
                await this.emitMockEvent('cache.miss', {
                    key,
                    totalMisses: this.stats.misses
                });
                return undefined;
            }
            if (entry.expiresAt && entry.expiresAt <= new Date()) {
                this.storage.delete(key);
                this.stats.misses++;
                await this.emitOperationCompleted('get', {
                    key,
                    result: 'expired',
                    expiredAt: entry.expiresAt,
                    totalMisses: this.stats.misses
                }, undefined);
                await this.emitMockEvent('cache.expired', {
                    key,
                    expiredAt: entry.expiresAt,
                    setAt: entry.setAt
                });
                return undefined;
            }
            this.stats.hits++;
            await this.emitOperationCompleted('get', {
                key,
                result: 'hit',
                setAt: entry.setAt,
                expiresAt: entry.expiresAt,
                totalHits: this.stats.hits
            }, entry.value);
            await this.emitMockEvent('cache.hit', {
                key,
                setAt: entry.setAt,
                totalHits: this.stats.hits
            });
            return entry.value;
        }
        catch (error) {
            await this.emitOperationFailed('get', error, { key });
            throw error;
        }
    }
    async set(key, value, ttl) {
        const isUpdate = this.storage.has(key);
        const expiresAt = ttl ? new Date(Date.now() + ttl * 1000) : undefined;
        await this.emitOperationStarted('set', {
            key,
            isUpdate,
            hasTTL: !!ttl,
            ttlSeconds: ttl,
            expiresAt
        });
        try {
            const entry = {
                value,
                setAt: new Date(),
                expiresAt
            };
            this.storage.set(key, entry);
            this.stats.sets++;
            await this.emitOperationCompleted('set', {
                key,
                isUpdate,
                setAt: entry.setAt,
                expiresAt: entry.expiresAt,
                totalSets: this.stats.sets,
                cacheSize: this.storage.size
            });
            if (isUpdate) {
                await this.emitMockEvent('cache.updated', {
                    key,
                    setAt: entry.setAt,
                    expiresAt: entry.expiresAt
                });
            }
            else {
                await this.emitMockEvent('cache.created', {
                    key,
                    setAt: entry.setAt,
                    expiresAt: entry.expiresAt,
                    newSize: this.storage.size
                });
            }
        }
        catch (error) {
            await this.emitOperationFailed('set', error, {
                key,
                hasTTL: !!ttl
            });
            throw error;
        }
    }
    async has(key) {
        await this.emitOperationStarted('has', { key });
        try {
            const entry = this.storage.get(key);
            let exists = false;
            if (entry) {
                if (entry.expiresAt && entry.expiresAt <= new Date()) {
                    this.storage.delete(key);
                    exists = false;
                    await this.emitMockEvent('cache.expired', {
                        key,
                        expiredAt: entry.expiresAt,
                        setAt: entry.setAt
                    });
                }
                else {
                    exists = true;
                }
            }
            await this.emitOperationCompleted('has', {
                key,
                exists,
                expired: entry && entry.expiresAt && entry.expiresAt <= new Date()
            }, exists);
            return exists;
        }
        catch (error) {
            await this.emitOperationFailed('has', error, { key });
            throw error;
        }
    }
    async delete(key) {
        const existed = this.storage.has(key);
        await this.emitOperationStarted('delete', {
            key,
            existed
        });
        try {
            const entry = this.storage.get(key);
            const deleted = this.storage.delete(key);
            if (deleted) {
                this.stats.deletes++;
            }
            await this.emitOperationCompleted('delete', {
                key,
                existed,
                deleted,
                totalDeletes: this.stats.deletes,
                cacheSize: this.storage.size
            });
            if (deleted) {
                await this.emitMockEvent('cache.deleted', {
                    key,
                    setAt: entry?.setAt,
                    totalDeletes: this.stats.deletes,
                    newSize: this.storage.size
                });
            }
        }
        catch (error) {
            await this.emitOperationFailed('delete', error, { key });
            throw error;
        }
    }
    async clear() {
        const itemCount = this.storage.size;
        await this.emitOperationStarted('clear', {
            itemCount
        });
        try {
            this.storage.clear();
            this.stats.clears++;
            await this.emitOperationCompleted('clear', {
                clearedItems: itemCount,
                totalClears: this.stats.clears
            });
            await this.emitMockEvent('cache.cleared', {
                clearedItems: itemCount,
                totalClears: this.stats.clears
            });
        }
        catch (error) {
            await this.emitOperationFailed('clear', error, {
                attemptedCount: itemCount
            });
            throw error;
        }
    }
    async getStats() {
        const stats = {
            ...this.stats,
            size: this.storage.size,
            hitRate: this.stats.hits + this.stats.misses > 0
                ? this.stats.hits / (this.stats.hits + this.stats.misses)
                : 0,
            operations: this.stats.hits + this.stats.misses + this.stats.sets + this.stats.deletes + this.stats.clears
        };
        await this.emitMockEvent('stats.requested', stats);
        return stats;
    }
    async warm(entries, ttl) {
        const keys = Object.keys(entries);
        await this.emitOperationStarted('warm', {
            entryCount: keys.length,
            keys: keys.slice(0, 5),
            hasTTL: !!ttl
        });
        try {
            const warmedKeys = [];
            for (const [key, value] of Object.entries(entries)) {
                await this.set(key, value, ttl);
                warmedKeys.push(key);
            }
            await this.emitOperationCompleted('warm', {
                warmedCount: warmedKeys.length,
                totalCacheSize: this.storage.size
            });
            await this.emitMockEvent('cache.warmed', {
                entryCount: warmedKeys.length,
                totalSize: this.storage.size
            });
        }
        catch (error) {
            await this.emitOperationFailed('warm', error, {
                attemptedCount: keys.length
            });
            throw error;
        }
    }
    async expireKey(key) {
        const entry = this.storage.get(key);
        await this.emitOperationStarted('expireKey', {
            key,
            exists: !!entry
        });
        try {
            if (entry) {
                entry.expiresAt = new Date(Date.now() - 1000);
                await this.emitOperationCompleted('expireKey', {
                    key,
                    originalSetAt: entry.setAt,
                    forcedExpiryAt: entry.expiresAt
                });
                await this.emitMockEvent('cache.force_expired', {
                    key,
                    setAt: entry.setAt,
                    expiredAt: entry.expiresAt
                });
            }
            else {
                await this.emitOperationCompleted('expireKey', {
                    key,
                    skipped: true,
                    reason: 'key-not-found'
                });
            }
        }
        catch (error) {
            await this.emitOperationFailed('expireKey', error, { key });
            throw error;
        }
    }
    async resetStats() {
        const oldStats = { ...this.stats };
        await this.emitOperationStarted('resetStats', oldStats);
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            clears: 0
        };
        await this.emitOperationCompleted('resetStats', {
            previousStats: oldStats,
            newStats: this.stats
        });
        await this.emitMockEvent('stats.reset', {
            previousStats: oldStats
        });
    }
};
EventAwareMockCache = __decorate([
    injectable(),
    __metadata("design:paramtypes", [])
], EventAwareMockCache);
export { EventAwareMockCache };
//# sourceMappingURL=EventAwareMockCache.js.map