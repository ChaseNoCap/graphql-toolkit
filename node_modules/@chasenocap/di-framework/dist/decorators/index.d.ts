import { injectable, inject, named, tagged, unmanaged } from 'inversify';
import { interfaces } from 'inversify';
export { injectable, inject, named, tagged, unmanaged };
/**
 * Decorator for singleton services
 */
export declare function singleton<T extends interfaces.Newable<any>>(target: T): T;
/**
 * Decorator for transient services
 */
export declare function transient<T extends interfaces.Newable<any>>(target: T): T;
/**
 * Decorator for request-scoped services
 */
export declare function scoped<T extends interfaces.Newable<any>>(target: T): T;
/**
 * Decorator for lazy injection
 */
export declare function lazy(serviceIdentifier: interfaces.ServiceIdentifier<any>): (target: any, targetKey: string, index?: number) => void;
/**
 * Decorator for optional injection
 */
export declare function optional(serviceIdentifier: interfaces.ServiceIdentifier<any>): (target: any, targetKey: string, index?: number) => void;
//# sourceMappingURL=index.d.ts.map