import { interfaces } from 'inversify';
import { ContainerBuilder } from '../container/ContainerBuilder.js';
/**
 * Snapshot of container state
 */
export interface IContainerSnapshot {
    bindings: Map<interfaces.ServiceIdentifier<any>, interfaces.Binding<any>[]>;
    modules: interfaces.ContainerModule[];
}
/**
 * Test-specific container builder with snapshot/restore capabilities
 */
export declare class TestContainerBuilder extends ContainerBuilder {
    private snapshots;
    private mockBindings;
    /**
     * Replace a service with a mock
     */
    mock<T>(token: interfaces.ServiceIdentifier<T>, mockImplementation: T): this;
    /**
     * Replace multiple services with mocks
     */
    mockMany(mocks: Array<[interfaces.ServiceIdentifier<any>, any]>): this;
    /**
     * Create a snapshot of current container state
     */
    snapshot(): this;
    /**
     * Restore container to previous snapshot
     */
    restore(): this;
    /**
     * Reset container to clean state
     */
    reset(): this;
    /**
     * Get all mock bindings
     */
    getMocks(): Map<interfaces.ServiceIdentifier<any>, any>;
    /**
     * Check if a service is mocked
     */
    isMocked(token: interfaces.ServiceIdentifier<any>): boolean;
    /**
     * Create isolated container for testing
     */
    static createIsolated(configurator?: (builder: TestContainerBuilder) => void): TestContainerBuilder;
}
//# sourceMappingURL=TestContainerBuilder.d.ts.map