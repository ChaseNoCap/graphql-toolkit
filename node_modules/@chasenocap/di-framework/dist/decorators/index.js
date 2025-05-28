import { injectable, inject, named, tagged, unmanaged } from 'inversify';
// Re-export inversify decorators
export { injectable, inject, named, tagged, unmanaged };
/**
 * Decorator for singleton services
 */
export function singleton(target) {
    injectable()(target);
    return target;
}
/**
 * Decorator for transient services
 */
export function transient(target) {
    injectable()(target);
    return target;
}
/**
 * Decorator for request-scoped services
 */
export function scoped(target) {
    injectable()(target);
    return target;
}
/**
 * Decorator for lazy injection
 */
export function lazy(serviceIdentifier) {
    return (target, targetKey, index) => {
        const metadata = new Metadata('inject', serviceIdentifier);
        if (typeof index === 'number') {
            tagParameter(target, targetKey, index, metadata);
        }
        else {
            tagProperty(target, targetKey, metadata);
        }
    };
}
/**
 * Decorator for optional injection
 */
export function optional(serviceIdentifier) {
    return (target, targetKey, index) => {
        const metadata = new Metadata('optional', serviceIdentifier);
        if (typeof index === 'number') {
            tagParameter(target, targetKey, index, metadata);
        }
        else {
            tagProperty(target, targetKey, metadata);
        }
    };
}
// Helper classes and functions
class Metadata {
    key;
    value;
    constructor(key, value) {
        this.key = key;
        this.value = value;
    }
}
function tagParameter(target, propertyKey, index, metadata) {
    const existingMetadata = Reflect.getMetadata('custom:inject:param', target, propertyKey) || [];
    existingMetadata[index] = metadata;
    Reflect.defineMetadata('custom:inject:param', existingMetadata, target, propertyKey);
}
function tagProperty(target, propertyKey, metadata) {
    Reflect.defineMetadata('custom:inject:prop', metadata, target, propertyKey);
}
//# sourceMappingURL=index.js.map