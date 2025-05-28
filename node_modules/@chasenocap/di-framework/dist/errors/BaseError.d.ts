/**
 * Base error class with additional context
 */
export declare abstract class BaseError extends Error {
    readonly code: string;
    readonly context?: Record<string, any>;
    readonly timestamp: Date;
    constructor(message: string, code: string, context?: Record<string, any>);
    /**
     * Convert to JSON representation
     */
    toJSON(): Record<string, any>;
}
/**
 * Dependency injection related errors
 */
export declare class InjectionError extends BaseError {
    constructor(message: string, context?: Record<string, any>);
}
/**
 * Service not found error
 */
export declare class ServiceNotFoundError extends InjectionError {
    constructor(serviceIdentifier: string | symbol, context?: Record<string, any>);
}
/**
 * Circular dependency error
 */
export declare class CircularDependencyError extends InjectionError {
    constructor(chain: string[], context?: Record<string, any>);
}
/**
 * Configuration error
 */
export declare class ConfigurationError extends BaseError {
    constructor(message: string, context?: Record<string, any>);
}
/**
 * Initialization error
 */
export declare class InitializationError extends BaseError {
    constructor(message: string, serviceName?: string, context?: Record<string, any>);
}
//# sourceMappingURL=BaseError.d.ts.map