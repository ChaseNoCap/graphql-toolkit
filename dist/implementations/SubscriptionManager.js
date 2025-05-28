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
import { GRAPHQL_TOOLKIT_TYPES } from '../types/InjectionTokens.js';
let SubscriptionManager = class SubscriptionManager {
    logger;
    subscriptions = new Map();
    connections = new Map();
    subscriptionConnections = new Map(); // topic -> connectionIds
    stats = {
        activeConnections: 0,
        totalSubscriptions: 0,
        messagesSent: 0,
        messagesReceived: 0,
        averageConnectionDuration: 0,
        peakConnections: 0,
        errorRate: 0,
        uptime: Date.now(),
    };
    constructor(logger) {
        this.logger = logger;
    }
    async subscribe(name, resolver, options) {
        const subscriptionId = this.generateId();
        this.logger.debug('Creating subscription', {
            subscriptionId,
            name,
            options,
        });
        try {
            // Store the subscription resolver
            this.subscriptions.set(subscriptionId, resolver);
            // Initialize topic connections if needed
            if (!this.subscriptionConnections.has(name)) {
                this.subscriptionConnections.set(name, new Set());
            }
            this.stats.totalSubscriptions++;
            this.logger.info('Subscription created successfully', {
                subscriptionId,
                name,
                totalSubscriptions: this.stats.totalSubscriptions,
            });
            return subscriptionId;
        }
        catch (error) {
            this.logger.error('Failed to create subscription', error, {
                subscriptionId,
                name,
            });
            throw error;
        }
    }
    async unsubscribe(subscriptionId) {
        this.logger.debug('Unsubscribing', { subscriptionId });
        try {
            const removed = this.subscriptions.delete(subscriptionId);
            if (removed) {
                // Remove from all topic connections
                for (const connectionSet of this.subscriptionConnections.values()) {
                    connectionSet.delete(subscriptionId);
                }
                this.stats.totalSubscriptions--;
                this.logger.info('Subscription removed successfully', {
                    subscriptionId,
                    remainingSubscriptions: this.stats.totalSubscriptions,
                });
            }
            return removed;
        }
        catch (error) {
            this.logger.error('Failed to unsubscribe', error, {
                subscriptionId,
            });
            return false;
        }
    }
    async publish(topic, payload) {
        this.logger.debug('Publishing to topic', {
            topic,
            hasMetadata: !!payload.metadata,
        });
        try {
            const connectionIds = this.subscriptionConnections.get(topic);
            if (!connectionIds || connectionIds.size === 0) {
                this.logger.debug('No subscribers for topic', { topic });
                return 0;
            }
            let successCount = 0;
            const publishPromises = [];
            for (const connectionId of connectionIds) {
                publishPromises.push(this.publishToConnection(connectionId, topic, payload)
                    .then(() => { successCount++; })
                    .catch(error => {
                    this.logger.warn('Failed to publish to connection', {
                        connectionId,
                        topic,
                        error: error.message,
                    });
                }));
            }
            await Promise.allSettled(publishPromises);
            this.stats.messagesSent += successCount;
            this.logger.info('Published to subscribers', {
                topic,
                totalSubscribers: connectionIds.size,
                successfulDeliveries: successCount,
            });
            return successCount;
        }
        catch (error) {
            this.logger.error('Failed to publish to topic', error, { topic });
            throw error;
        }
    }
    async publishToSubscribers(topic, payload, filter) {
        this.logger.debug('Publishing to filtered subscribers', { topic });
        try {
            const connectionIds = this.subscriptionConnections.get(topic);
            if (!connectionIds || connectionIds.size === 0) {
                return 0;
            }
            let successCount = 0;
            const publishPromises = [];
            for (const connectionId of connectionIds) {
                const connection = this.connections.get(connectionId);
                if (!connection)
                    continue;
                // Apply filter
                try {
                    const shouldPublish = filter(payload, {}, { connection });
                    if (!shouldPublish)
                        continue;
                }
                catch (filterError) {
                    this.logger.warn('Subscription filter error', {
                        connectionId,
                        topic,
                        error: filterError.message,
                    });
                    continue;
                }
                publishPromises.push(this.publishToConnection(connectionId, topic, payload)
                    .then(() => { successCount++; })
                    .catch(error => {
                    this.logger.warn('Failed to publish to filtered connection', {
                        connectionId,
                        topic,
                        error: error.message,
                    });
                }));
            }
            await Promise.allSettled(publishPromises);
            this.stats.messagesSent += successCount;
            this.logger.info('Published to filtered subscribers', {
                topic,
                eligibleSubscribers: connectionIds.size,
                successfulDeliveries: successCount,
            });
            return successCount;
        }
        catch (error) {
            this.logger.error('Failed to publish to filtered subscribers', error, { topic });
            throw error;
        }
    }
    getConnections() {
        return new Map(this.connections);
    }
    getConnection(connectionId) {
        return this.connections.get(connectionId);
    }
    async closeConnection(connectionId) {
        this.logger.debug('Closing connection', { connectionId });
        try {
            const connection = this.connections.get(connectionId);
            if (!connection) {
                return false;
            }
            // Mark as inactive
            connection.isActive = false;
            // Remove from all subscriptions
            for (const subscriptionId of connection.subscriptions) {
                await this.unsubscribe(subscriptionId);
            }
            // Remove connection
            this.connections.delete(connectionId);
            this.stats.activeConnections--;
            this.logger.info('Connection closed', {
                connectionId,
                duration: Date.now() - connection.startTime.getTime(),
                subscriptionCount: connection.subscriptions.size,
            });
            return true;
        }
        catch (error) {
            this.logger.error('Failed to close connection', error, { connectionId });
            return false;
        }
    }
    getStats() {
        return { ...this.stats };
    }
    async healthCheck() {
        const now = Date.now();
        const errors = [];
        const warnings = [];
        // Check for stale connections
        let staleConnections = 0;
        for (const connection of this.connections.values()) {
            const timeSinceLastActivity = now - connection.lastActivity.getTime();
            if (timeSinceLastActivity > 300000) { // 5 minutes
                staleConnections++;
            }
        }
        if (staleConnections > 0) {
            warnings.push(`${staleConnections} stale connections detected`);
        }
        // Check error rate
        if (this.stats.errorRate > 0.1) { // 10%
            errors.push(`High error rate: ${(this.stats.errorRate * 100).toFixed(2)}%`);
        }
        // Check memory usage (simplified)
        const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024; // MB
        if (memoryUsage > 512) { // 512MB
            warnings.push(`High memory usage: ${memoryUsage.toFixed(2)}MB`);
        }
        const healthy = errors.length === 0;
        const latency = this.calculateAverageLatency();
        return {
            healthy,
            connections: this.stats.activeConnections,
            memoryUsage,
            latency,
            errors,
            warnings,
        };
    }
    async publishToConnection(connectionId, topic, payload) {
        const connection = this.connections.get(connectionId);
        if (!connection || !connection.isActive) {
            throw new Error(`Connection ${connectionId} is not active`);
        }
        // In a real implementation, this would send the payload via WebSocket
        // For now, we'll just log it and update connection activity
        connection.lastActivity = new Date();
        this.logger.debug('Published to connection', {
            connectionId,
            topic,
            userId: connection.userId,
        });
    }
    generateId() {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }
    calculateAverageLatency() {
        // In a real implementation, this would track actual latencies
        // For now, return a placeholder
        return 50; // 50ms
    }
    // Helper method to register a connection (would be called by WebSocket manager)
    registerConnection(connection) {
        this.connections.set(connection.id, connection);
        this.stats.activeConnections++;
        this.stats.peakConnections = Math.max(this.stats.peakConnections, this.stats.activeConnections);
        this.logger.info('Connection registered', {
            connectionId: connection.id,
            userId: connection.userId,
            activeConnections: this.stats.activeConnections,
        });
    }
    // Helper method to add subscription to connection
    addSubscriptionToConnection(connectionId, subscriptionId, topic) {
        const connection = this.connections.get(connectionId);
        if (connection) {
            connection.subscriptions.add(subscriptionId);
            const topicConnections = this.subscriptionConnections.get(topic) || new Set();
            topicConnections.add(connectionId);
            this.subscriptionConnections.set(topic, topicConnections);
        }
    }
};
SubscriptionManager = __decorate([
    injectable(),
    __param(0, inject(GRAPHQL_TOOLKIT_TYPES.ILogger)),
    __metadata("design:paramtypes", [Object])
], SubscriptionManager);
export { SubscriptionManager };
//# sourceMappingURL=SubscriptionManager.js.map