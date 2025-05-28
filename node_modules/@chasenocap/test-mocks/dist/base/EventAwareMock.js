export class EventAwareMock {
    eventBus;
    mockName;
    constructor(mockName) {
        this.mockName = mockName;
    }
    setEventBus(eventBus) {
        this.eventBus = eventBus;
    }
    async emitEvent(operation, _payload, _metadata) {
        if (!this.eventBus)
            return;
        const event = {
            type: `mock.${operation}.${this.mockName}`,
            timestamp: Date.now()
        };
        try {
            await this.eventBus.emit(event);
        }
        catch (error) {
        }
    }
    async emitOperationStarted(operation, payload) {
        return this.emitEvent(`${operation}.started`, payload);
    }
    async emitOperationCompleted(operation, payload, result) {
        return this.emitEvent(`${operation}.completed`, { ...payload, result });
    }
    async emitOperationFailed(operation, error, context) {
        return this.emitEvent(`${operation}.failed`, {
            ...context,
            error: {
                message: error.message,
                name: error.name,
                stack: error.stack
            }
        });
    }
    async emitMockEvent(eventType, payload) {
        return this.emitEvent(eventType, payload);
    }
    enableEventEmission(eventBus) {
        this.setEventBus(eventBus);
    }
}
export class EventAwareInterfaceMock extends EventAwareMock {
}
//# sourceMappingURL=EventAwareMock.js.map