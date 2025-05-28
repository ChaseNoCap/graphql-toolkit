import { ContainerBuilder } from '../container/ContainerBuilder.js';
/**
 * Test-specific container builder with snapshot/restore capabilities
 */
export class TestContainerBuilder extends ContainerBuilder {
    snapshots = [];
    mockBindings = new Map();
    /**
     * Replace a service with a mock
     */
    mock(token, mockImplementation) {
        this.mockBindings.set(token, mockImplementation);
        // Unbind if exists
        if (this.getContainer().isBound(token)) {
            this.getContainer().unbind(token);
        }
        // Bind mock
        this.getContainer().bind(token).toConstantValue(mockImplementation);
        return this;
    }
    /**
     * Replace multiple services with mocks
     */
    mockMany(mocks) {
        for (const [token, mock] of mocks) {
            this.mock(token, mock);
        }
        return this;
    }
    /**
     * Create a snapshot of current container state
     */
    snapshot() {
        const snapshot = {
            bindings: new Map(),
            modules: [],
        };
        // Note: Inversify doesn't expose a way to iterate all bindings
        // This is a limitation of the snapshot functionality
        // In a real implementation, we'd need to track bindings ourselves
        this.snapshots.push(snapshot);
        return this;
    }
    /**
     * Restore container to previous snapshot
     */
    restore() {
        const snapshot = this.snapshots.pop();
        if (!snapshot) {
            throw new Error('No snapshot to restore');
        }
        const container = this.getContainer();
        // Clear current bindings
        container.unbindAll();
        // Note: Due to Inversify limitations, we can't fully restore bindings
        // This is a simplified implementation
        // In practice, you'd need to recreate the container with original bindings
        // Clear mock bindings
        this.mockBindings.clear();
        return this;
    }
    /**
     * Reset container to clean state
     */
    reset() {
        this.getContainer().unbindAll();
        this.snapshots = [];
        this.mockBindings.clear();
        return this;
    }
    /**
     * Get all mock bindings
     */
    getMocks() {
        return new Map(this.mockBindings);
    }
    /**
     * Check if a service is mocked
     */
    isMocked(token) {
        return this.mockBindings.has(token);
    }
    /**
     * Create isolated container for testing
     */
    static createIsolated(configurator) {
        const builder = new TestContainerBuilder({
            defaultScope: 'Singleton',
            autoBindInjectable: false,
            skipBaseClassChecks: true,
        });
        if (configurator) {
            configurator(builder);
        }
        return builder;
    }
}
//# sourceMappingURL=TestContainerBuilder.js.map