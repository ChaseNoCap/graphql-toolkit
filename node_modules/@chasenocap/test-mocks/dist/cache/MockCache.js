var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { injectable } from 'inversify';
let MockCache = class MockCache {
    storage = new Map();
    stats = {
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: 0,
        clears: 0
    };
    async get(key) {
        const entry = this.storage.get(key);
        if (!entry) {
            this.stats.misses++;
            return undefined;
        }
        if (entry.expiresAt && entry.expiresAt < new Date()) {
            this.storage.delete(key);
            this.stats.misses++;
            return undefined;
        }
        this.stats.hits++;
        return entry.value;
    }
    async set(key, value, ttl) {
        const entry = {
            value,
            setAt: new Date()
        };
        if (ttl) {
            entry.expiresAt = new Date(Date.now() + ttl);
        }
        this.storage.set(key, entry);
        this.stats.sets++;
    }
    async has(key) {
        const value = await this.get(key);
        return value !== undefined;
    }
    async delete(key) {
        this.storage.delete(key);
        this.stats.deletes++;
    }
    async clear() {
        this.storage.clear();
        this.stats.clears++;
    }
    getHitRate() {
        const total = this.stats.hits + this.stats.misses;
        return total === 0 ? 0 : this.stats.hits / total;
    }
    resetStats() {
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            clears: 0
        };
    }
    getAllKeys() {
        return Array.from(this.storage.keys());
    }
    getAllEntries() {
        return Array.from(this.storage.entries());
    }
    simulateExpiration() {
        const now = new Date();
        for (const [key, entry] of this.storage.entries()) {
            if (entry.expiresAt && entry.expiresAt < now) {
                this.storage.delete(key);
            }
        }
    }
    setEntryTime(key, setAt, expiresAt) {
        const entry = this.storage.get(key);
        if (entry) {
            entry.setAt = setAt;
            entry.expiresAt = expiresAt;
        }
    }
};
MockCache = __decorate([
    injectable()
], MockCache);
export { MockCache };
//# sourceMappingURL=MockCache.js.map