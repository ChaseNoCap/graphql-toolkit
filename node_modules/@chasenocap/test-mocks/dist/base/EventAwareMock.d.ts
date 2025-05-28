import type { IEventBus } from '@chasenocap/event-system';
export declare abstract class EventAwareMock {
    protected eventBus?: IEventBus;
    protected mockName: string;
    constructor(mockName: string);
    setEventBus(eventBus: IEventBus): void;
    protected emitEvent(operation: string, _payload?: Record<string, any>, _metadata?: Record<string, any>): Promise<void>;
    protected emitOperationStarted(operation: string, payload?: Record<string, any>): Promise<void>;
    protected emitOperationCompleted(operation: string, payload?: Record<string, any>, result?: any): Promise<void>;
    protected emitOperationFailed(operation: string, error: Error, context?: Record<string, any>): Promise<void>;
    protected emitMockEvent(eventType: string, payload?: Record<string, any>): Promise<void>;
    enableEventEmission(eventBus: IEventBus): void;
}
export declare abstract class EventAwareInterfaceMock<T = any> extends EventAwareMock {
}
//# sourceMappingURL=EventAwareMock.d.ts.map