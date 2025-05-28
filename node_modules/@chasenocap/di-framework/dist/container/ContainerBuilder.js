import { Container } from 'inversify';
import { isDisposable } from '../interfaces/IDisposable.js';
import { EventDrivenContainerMiddleware, ContainerPerformanceMonitor, } from './ContainerMiddleware.js';
/**
 * Fluent container builder
 */
export class ContainerBuilder {
    container;
    disposables = new Set();
    middlewares = [];
    eventListeners = [];
    performanceMonitor;
    options;
    constructor(options = {}) {
        this.options = options;
        this.container = new Container({
            defaultScope: options.defaultScope || 'Singleton',
            autoBindInjectable: options.autoBindInjectable ?? true,
            skipBaseClassChecks: options.skipBaseClassChecks ?? true,
        });
        // Setup default performance monitoring if enabled
        if (options.enablePerformanceMonitoring) {
            this.performanceMonitor = new ContainerPerformanceMonitor();
        }
    }
    /**
     * Add a binding configuration
     */
    addBinding(token, implementation, scope) {
        const binding = this.container.bind(token).to(implementation);
        if (scope) {
            binding.inSingletonScope();
        }
        return this;
    }
    /**
     * Add a factory binding
     */
    addFactory(token, factory) {
        this.container.bind(token).toFactory(factory);
        return this;
    }
    /**
     * Add a constant value binding
     */
    addConstant(token, value) {
        this.container.bind(token).toConstantValue(value);
        return this;
    }
    /**
     * Add a module
     */
    addModule(module) {
        this.container.load(module);
        return this;
    }
    /**
     * Add middleware to intercept service resolution
     */
    addMiddleware(middleware) {
        this.middlewares.push(middleware);
        return this;
    }
    /**
     * Add event listener for container lifecycle events
     */
    addEventListener(listener) {
        this.eventListeners.push(listener);
        return this;
    }
    /**
     * Set custom performance monitor
     */
    setPerformanceMonitor(monitor) {
        this.performanceMonitor = monitor;
        return this;
    }
    /**
     * Enable automatic event emission for container operations
     */
    enableEventEmission(eventBus) {
        if (eventBus) {
            const eventListener = {
                onBeforeResolve: async (serviceIdentifier, context) => {
                    await eventBus.emit('container.resolution.started', {
                        serviceIdentifier: this.getServiceIdentifierString(serviceIdentifier),
                        context: context.plan?.rootRequest?.target?.name,
                    });
                },
                onAfterResolve: async (serviceIdentifier, instance, context) => {
                    await eventBus.emit('container.resolution.completed', {
                        serviceIdentifier: this.getServiceIdentifierString(serviceIdentifier),
                        instance: instance?.constructor?.name,
                        context: context.plan?.rootRequest?.target?.name,
                    });
                },
                onResolutionError: async (serviceIdentifier, error, context) => {
                    await eventBus.emit('container.resolution.failed', {
                        serviceIdentifier: this.getServiceIdentifierString(serviceIdentifier),
                        error: error.message,
                        context: context.plan?.rootRequest?.target?.name,
                    });
                },
                onDispose: async (serviceIdentifier, instance) => {
                    await eventBus.emit('container.service.disposed', {
                        serviceIdentifier: this.getServiceIdentifierString(serviceIdentifier),
                        instance: instance?.constructor?.name,
                    });
                },
            };
            this.addEventListener(eventListener);
        }
        return this;
    }
    /**
     * Configure container options
     */
    configure(configurator) {
        configurator(this.container);
        return this;
    }
    /**
     * Build and initialize the container
     */
    async build() {
        // Setup middleware and event system
        this.setupMiddleware();
        // Initialize all services that implement IInitializable
        await this.initializeServices();
        // Track disposables
        this.setupDisposableTracking();
        return this.container;
    }
    /**
     * Get the underlying container (for advanced scenarios)
     */
    getContainer() {
        return this.container;
    }
    setupMiddleware() {
        if (this.options.enableEventSystem ||
            this.eventListeners.length > 0 ||
            this.middlewares.length > 0) {
            // Create event-driven middleware if we have listeners or explicit middleware
            const eventMiddleware = new EventDrivenContainerMiddleware(this.eventListeners, this.performanceMonitor);
            // Add all custom middlewares
            const allMiddlewares = [eventMiddleware, ...this.middlewares];
            // Wrap container get method with middleware
            this.wrapContainerWithMiddleware(allMiddlewares);
        }
    }
    wrapContainerWithMiddleware(middlewares) {
        const originalGet = this.container.get.bind(this.container);
        const originalGetAsync = this.container.getAsync?.bind(this.container);
        this.container.get = (serviceIdentifier) => {
            // Create a middleware chain
            let index = 0;
            const next = () => {
                if (index < middlewares.length) {
                    const middleware = middlewares[index++];
                    // Note: We can't get the full context here, this is a limitation
                    const mockContext = {};
                    return middleware.intercept(mockContext, serviceIdentifier, next);
                }
                return originalGet(serviceIdentifier);
            };
            return next();
        };
        // Also wrap async get if available
        if (originalGetAsync) {
            this.container.getAsync = async (serviceIdentifier) => {
                let index = 0;
                const next = async () => {
                    if (index < middlewares.length) {
                        const middleware = middlewares[index++];
                        const mockContext = {};
                        const syncNext = () => originalGetAsync(serviceIdentifier);
                        const result = middleware.intercept(mockContext, serviceIdentifier, syncNext);
                        return result instanceof Promise ? result : Promise.resolve(result);
                    }
                    return originalGetAsync(serviceIdentifier);
                };
                return next();
            };
        }
    }
    async initializeServices() {
        // Note: Inversify doesn't provide a way to iterate all bindings
        // Services should be initialized manually or tracked separately
        // This is a limitation of the current approach
    }
    setupDisposableTracking() {
        const originalGet = this.container.get.bind(this.container);
        this.container.get = (serviceIdentifier) => {
            const instance = originalGet(serviceIdentifier);
            if (isDisposable(instance)) {
                this.disposables.add(instance);
            }
            return instance;
        };
    }
    /**
     * Get performance metrics if monitoring is enabled
     */
    getPerformanceMetrics() {
        return this.performanceMonitor?.getMetrics();
    }
    /**
     * Get service identifier as string for logging/events
     */
    getServiceIdentifierString(serviceIdentifier) {
        if (typeof serviceIdentifier === 'string') {
            return serviceIdentifier;
        }
        if (typeof serviceIdentifier === 'symbol') {
            return serviceIdentifier.toString();
        }
        if (typeof serviceIdentifier === 'function') {
            return serviceIdentifier.name || 'Anonymous';
        }
        return String(serviceIdentifier);
    }
    /**
     * Dispose all tracked disposables
     */
    async dispose() {
        const errors = [];
        // Notify event listeners about disposal
        const eventMiddleware = this.middlewares.find((m) => m instanceof EventDrivenContainerMiddleware);
        for (const disposable of this.disposables) {
            try {
                // Find the service identifier for this disposable (limitation: we don't track this)
                if (eventMiddleware) {
                    await eventMiddleware.notifyDispose('unknown', disposable);
                }
                await disposable.dispose();
            }
            catch (error) {
                errors.push(error);
            }
        }
        this.disposables.clear();
        if (errors.length > 0) {
            throw new AggregateError(errors, 'Failed to dispose some services');
        }
    }
}
//# sourceMappingURL=ContainerBuilder.js.map