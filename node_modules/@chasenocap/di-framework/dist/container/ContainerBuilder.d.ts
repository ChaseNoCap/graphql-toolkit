import { Container, interfaces } from 'inversify';
import type { IContainerMiddleware, IContainerEventListener, IContainerPerformanceMonitor } from '../interfaces/IContainerMiddleware.js';
/**
 * Container configuration options
 */
export interface IContainerOptions {
    defaultScope?: interfaces.BindingScope;
    autoBindInjectable?: boolean;
    skipBaseClassChecks?: boolean;
    enableEventSystem?: boolean;
    enablePerformanceMonitoring?: boolean;
}
/**
 * Fluent container builder
 */
export declare class ContainerBuilder {
    private container;
    private disposables;
    private middlewares;
    private eventListeners;
    private performanceMonitor?;
    private options;
    constructor(options?: IContainerOptions);
    /**
     * Add a binding configuration
     */
    addBinding<T>(token: interfaces.ServiceIdentifier<T>, implementation: interfaces.Newable<T>, scope?: interfaces.BindingScope): this;
    /**
     * Add a factory binding
     */
    addFactory<T>(token: interfaces.ServiceIdentifier<T>, factory: interfaces.FactoryCreator<T>): this;
    /**
     * Add a constant value binding
     */
    addConstant<T>(token: interfaces.ServiceIdentifier<T>, value: T): this;
    /**
     * Add a module
     */
    addModule(module: interfaces.ContainerModule): this;
    /**
     * Add middleware to intercept service resolution
     */
    addMiddleware(middleware: IContainerMiddleware): this;
    /**
     * Add event listener for container lifecycle events
     */
    addEventListener(listener: IContainerEventListener): this;
    /**
     * Set custom performance monitor
     */
    setPerformanceMonitor(monitor: IContainerPerformanceMonitor): this;
    /**
     * Enable automatic event emission for container operations
     */
    enableEventEmission(eventBus?: any): this;
    /**
     * Configure container options
     */
    configure(configurator: (container: Container) => void): this;
    /**
     * Build and initialize the container
     */
    build(): Promise<Container>;
    /**
     * Get the underlying container (for advanced scenarios)
     */
    getContainer(): Container;
    private setupMiddleware;
    private wrapContainerWithMiddleware;
    private initializeServices;
    private setupDisposableTracking;
    /**
     * Get performance metrics if monitoring is enabled
     */
    getPerformanceMetrics(): import("../interfaces/IContainerMiddleware.js").ContainerMetrics | undefined;
    /**
     * Get service identifier as string for logging/events
     */
    private getServiceIdentifierString;
    /**
     * Dispose all tracked disposables
     */
    dispose(): Promise<void>;
}
//# sourceMappingURL=ContainerBuilder.d.ts.map