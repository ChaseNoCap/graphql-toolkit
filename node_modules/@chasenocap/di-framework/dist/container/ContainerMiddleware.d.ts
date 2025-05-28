import type { interfaces } from 'inversify';
import type { IContainerMiddleware, IAsyncContainerMiddleware, IContainerEventListener, IContainerPerformanceMonitor, ContainerMetrics } from '../interfaces/IContainerMiddleware.js';
/**
 * Default performance monitor implementation
 */
export declare class ContainerPerformanceMonitor implements IContainerPerformanceMonitor {
    private metrics;
    private totalTime;
    measureResolution<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>, resolveTime: number, _instance: T): void;
    getMetrics(): ContainerMetrics;
    private getServiceIdentifierString;
}
/**
 * Event-driven container middleware
 */
export declare class EventDrivenContainerMiddleware implements IContainerMiddleware {
    private eventListeners;
    private performanceMonitor?;
    constructor(eventListeners?: IContainerEventListener[], performanceMonitor?: IContainerPerformanceMonitor);
    addEventListener(listener: IContainerEventListener): void;
    setPerformanceMonitor(monitor: IContainerPerformanceMonitor): void;
    intercept<T>(context: interfaces.Context, serviceIdentifier: interfaces.ServiceIdentifier<T>, next: () => T): T;
    private notifyBeforeResolve;
    private notifyAfterResolve;
    private notifyResolutionError;
    notifyDispose<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>, instance: T): Promise<void>;
}
/**
 * Async container middleware
 */
export declare class AsyncContainerMiddleware implements IAsyncContainerMiddleware {
    private eventListeners;
    private performanceMonitor?;
    constructor(eventListeners?: IContainerEventListener[], performanceMonitor?: IContainerPerformanceMonitor);
    addEventListener(listener: IContainerEventListener): void;
    setPerformanceMonitor(monitor: IContainerPerformanceMonitor): void;
    interceptAsync<T>(context: interfaces.Context, serviceIdentifier: interfaces.ServiceIdentifier<T>, next: () => Promise<T>): Promise<T>;
    private notifyBeforeResolve;
    private notifyAfterResolve;
    private notifyResolutionError;
    notifyDispose<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>, instance: T): Promise<void>;
}
//# sourceMappingURL=ContainerMiddleware.d.ts.map