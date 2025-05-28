/**
 * Default performance monitor implementation
 */
export class ContainerPerformanceMonitor {
    metrics = {
        totalResolutions: 0,
        averageResolutionTime: 0,
        slowestResolution: null,
        resolutionsByService: {},
    };
    totalTime = 0;
    measureResolution(serviceIdentifier, resolveTime, _instance) {
        this.metrics.totalResolutions++;
        this.totalTime += resolveTime;
        this.metrics.averageResolutionTime = this.totalTime / this.metrics.totalResolutions;
        const identifierStr = this.getServiceIdentifierString(serviceIdentifier);
        // Update slowest resolution
        if (!this.metrics.slowestResolution || resolveTime > this.metrics.slowestResolution.time) {
            this.metrics.slowestResolution = {
                serviceIdentifier: identifierStr,
                time: resolveTime,
            };
        }
        // Update per-service metrics
        if (!this.metrics.resolutionsByService[identifierStr]) {
            this.metrics.resolutionsByService[identifierStr] = {
                count: 0,
                totalTime: 0,
                averageTime: 0,
            };
        }
        const serviceMetrics = this.metrics.resolutionsByService[identifierStr];
        serviceMetrics.count++;
        serviceMetrics.totalTime += resolveTime;
        serviceMetrics.averageTime = serviceMetrics.totalTime / serviceMetrics.count;
    }
    getMetrics() {
        return { ...this.metrics };
    }
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
}
/**
 * Event-driven container middleware
 */
export class EventDrivenContainerMiddleware {
    eventListeners = [];
    performanceMonitor;
    constructor(eventListeners = [], performanceMonitor) {
        this.eventListeners = eventListeners;
        this.performanceMonitor = performanceMonitor;
    }
    addEventListener(listener) {
        this.eventListeners.push(listener);
    }
    setPerformanceMonitor(monitor) {
        this.performanceMonitor = monitor;
    }
    intercept(context, serviceIdentifier, next) {
        const startTime = Date.now();
        // Notify before resolve
        this.notifyBeforeResolve(serviceIdentifier, context);
        try {
            const instance = next();
            const resolveTime = Date.now() - startTime;
            // Measure performance
            if (this.performanceMonitor) {
                this.performanceMonitor.measureResolution(serviceIdentifier, resolveTime, instance);
            }
            // Notify after resolve
            this.notifyAfterResolve(serviceIdentifier, instance, context);
            return instance;
        }
        catch (error) {
            // Notify error
            this.notifyResolutionError(serviceIdentifier, error, context);
            throw error;
        }
    }
    notifyBeforeResolve(serviceIdentifier, context) {
        for (const listener of this.eventListeners) {
            try {
                listener.onBeforeResolve?.(serviceIdentifier, context);
            }
            catch (error) {
                console.error('Error in container event listener (onBeforeResolve):', error);
            }
        }
    }
    notifyAfterResolve(serviceIdentifier, instance, context) {
        for (const listener of this.eventListeners) {
            try {
                listener.onAfterResolve?.(serviceIdentifier, instance, context);
            }
            catch (error) {
                console.error('Error in container event listener (onAfterResolve):', error);
            }
        }
    }
    notifyResolutionError(serviceIdentifier, error, context) {
        for (const listener of this.eventListeners) {
            try {
                listener.onResolutionError?.(serviceIdentifier, error, context);
            }
            catch (error) {
                console.error('Error in container event listener (onResolutionError):', error);
            }
        }
    }
    async notifyDispose(serviceIdentifier, instance) {
        for (const listener of this.eventListeners) {
            try {
                await listener.onDispose?.(serviceIdentifier, instance);
            }
            catch (error) {
                console.error('Error in container event listener (onDispose):', error);
            }
        }
    }
}
/**
 * Async container middleware
 */
export class AsyncContainerMiddleware {
    eventListeners = [];
    performanceMonitor;
    constructor(eventListeners = [], performanceMonitor) {
        this.eventListeners = eventListeners;
        this.performanceMonitor = performanceMonitor;
    }
    addEventListener(listener) {
        this.eventListeners.push(listener);
    }
    setPerformanceMonitor(monitor) {
        this.performanceMonitor = monitor;
    }
    async interceptAsync(context, serviceIdentifier, next) {
        const startTime = Date.now();
        // Notify before resolve
        await this.notifyBeforeResolve(serviceIdentifier, context);
        try {
            const instance = await next();
            const resolveTime = Date.now() - startTime;
            // Measure performance
            if (this.performanceMonitor) {
                this.performanceMonitor.measureResolution(serviceIdentifier, resolveTime, instance);
            }
            // Notify after resolve
            await this.notifyAfterResolve(serviceIdentifier, instance, context);
            return instance;
        }
        catch (error) {
            // Notify error
            await this.notifyResolutionError(serviceIdentifier, error, context);
            throw error;
        }
    }
    async notifyBeforeResolve(serviceIdentifier, context) {
        await Promise.all(this.eventListeners.map(async (listener) => {
            try {
                await listener.onBeforeResolve?.(serviceIdentifier, context);
            }
            catch (error) {
                console.error('Error in container event listener (onBeforeResolve):', error);
            }
        }));
    }
    async notifyAfterResolve(serviceIdentifier, instance, context) {
        await Promise.all(this.eventListeners.map(async (listener) => {
            try {
                await listener.onAfterResolve?.(serviceIdentifier, instance, context);
            }
            catch (error) {
                console.error('Error in container event listener (onAfterResolve):', error);
            }
        }));
    }
    async notifyResolutionError(serviceIdentifier, error, context) {
        await Promise.all(this.eventListeners.map(async (listener) => {
            try {
                await listener.onResolutionError?.(serviceIdentifier, error, context);
            }
            catch (error) {
                console.error('Error in container event listener (onResolutionError):', error);
            }
        }));
    }
    async notifyDispose(serviceIdentifier, instance) {
        await Promise.all(this.eventListeners.map(async (listener) => {
            try {
                await listener.onDispose?.(serviceIdentifier, instance);
            }
            catch (error) {
                console.error('Error in container event listener (onDispose):', error);
            }
        }));
    }
}
//# sourceMappingURL=ContainerMiddleware.js.map