export class SimpleEventAwareMock {
    eventBus;
    mockName;
    constructor(mockName) {
        this.mockName = mockName;
    }
    setEventBus(eventBus) {
        this.eventBus = eventBus;
    }
    async emitEvent(operation, _payload) {
        if (!this.eventBus)
            return;
        try {
            const event = {
                type: `mock.${operation}.${this.mockName}`,
                timestamp: Date.now()
            };
            await this.eventBus.emit(event);
        }
        catch (error) {
            console.warn(`Failed to emit mock event: ${error}`);
        }
    }
    enableEventEmission(eventBus) {
        this.setEventBus(eventBus);
    }
    async emitMockEvent(eventType, payload) {
        return this.emitEvent(eventType, payload);
    }
}
//# sourceMappingURL=SimpleEventAwareMock.js.map