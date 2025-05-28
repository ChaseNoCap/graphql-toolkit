import type { interfaces } from 'inversify';
/**
 * Container middleware for intercepting service resolution
 */
export interface IContainerMiddleware {
    /**
     * Intercept service resolution
     */
    intercept<T>(context: interfaces.Context, serviceIdentifier: interfaces.ServiceIdentifier<T>, next: () => T): T | Promise<T>;
}
/**
 * Container middleware with async support
 */
export interface IAsyncContainerMiddleware {
    /**
     * Intercept service resolution asynchronously
     */
    interceptAsync<T>(context: interfaces.Context, serviceIdentifier: interfaces.ServiceIdentifier<T>, next: () => Promise<T>): Promise<T>;
}
/**
 * Container event listener for lifecycle events
 */
export interface IContainerEventListener {
    /**
     * Called before service resolution
     */
    onBeforeResolve?<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>, context: interfaces.Context): void | Promise<void>;
    /**
     * Called after successful service resolution
     */
    onAfterResolve?<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>, instance: T, context: interfaces.Context): void | Promise<void>;
    /**
     * Called when service resolution fails
     */
    onResolutionError?<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>, error: Error, context: interfaces.Context): void | Promise<void>;
    /**
     * Called when service is disposed
     */
    onDispose?<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>, instance: T): void | Promise<void>;
}
/**
 * Container performance monitor
 */
export interface IContainerPerformanceMonitor {
    /**
     * Called to measure resolution time
     */
    measureResolution<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>, resolveTime: number, instance: T): void;
    /**
     * Get performance metrics
     */
    getMetrics(): ContainerMetrics;
}
/**
 * Container performance metrics
 */
export interface ContainerMetrics {
    totalResolutions: number;
    averageResolutionTime: number;
    slowestResolution: {
        serviceIdentifier: string;
        time: number;
    } | null;
    resolutionsByService: Record<string, {
        count: number;
        totalTime: number;
        averageTime: number;
    }>;
}
//# sourceMappingURL=IContainerMiddleware.d.ts.map