import type { IEventBus } from '@chasenocap/event-system';
export declare class SimpleEventAwareMock {
    protected eventBus?: IEventBus;
    protected mockName: string;
    constructor(mockName: string);
    setEventBus(eventBus: IEventBus): void;
    protected emitEvent(operation: string, _payload?: Record<string, any>): Promise<void>;
    enableEventEmission(eventBus: IEventBus): void;
    protected emitMockEvent(eventType: string, payload?: Record<string, any>): Promise<void>;
}
//# sourceMappingURL=SimpleEventAwareMock.d.ts.map