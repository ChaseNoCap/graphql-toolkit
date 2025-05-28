import type { ILogger } from '@chasenocap/logger';
import type { ISubscriptionManager, ISubscriptionResolver, ISubscriptionOptions, ISubscriptionConnection, ISubscriptionPayload, ISubscriptionFilter, ISubscriptionStats, ISubscriptionHealth } from '../interfaces/ISubscriptionManager.js';
export declare class SubscriptionManager implements ISubscriptionManager {
    private logger;
    private subscriptions;
    private connections;
    private subscriptionConnections;
    private stats;
    constructor(logger: ILogger);
    subscribe<T>(name: string, resolver: ISubscriptionResolver<T>, options?: ISubscriptionOptions): Promise<string>;
    unsubscribe(subscriptionId: string): Promise<boolean>;
    publish<T>(topic: string, payload: ISubscriptionPayload<T>): Promise<number>;
    publishToSubscribers<T>(topic: string, payload: ISubscriptionPayload<T>, filter: ISubscriptionFilter<T>): Promise<number>;
    getConnections(): Map<string, ISubscriptionConnection>;
    getConnection(connectionId: string): ISubscriptionConnection | undefined;
    closeConnection(connectionId: string): Promise<boolean>;
    getStats(): ISubscriptionStats;
    healthCheck(): Promise<ISubscriptionHealth>;
    private publishToConnection;
    private generateId;
    private calculateAverageLatency;
    registerConnection(connection: ISubscriptionConnection): void;
    addSubscriptionToConnection(connectionId: string, subscriptionId: string, topic: string): void;
}
//# sourceMappingURL=SubscriptionManager.d.ts.map