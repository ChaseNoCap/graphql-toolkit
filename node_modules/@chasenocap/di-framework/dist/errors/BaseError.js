/**
 * Base error class with additional context
 */
export class BaseError extends Error {
    code;
    context;
    timestamp;
    constructor(message, code, context) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.context = context;
        this.timestamp = new Date();
        // Maintain proper stack trace
        Error.captureStackTrace(this, this.constructor);
    }
    /**
     * Convert to JSON representation
     */
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            context: this.context,
            timestamp: this.timestamp,
            stack: this.stack,
        };
    }
}
/**
 * Dependency injection related errors
 */
export class InjectionError extends BaseError {
    constructor(message, context) {
        super(message, 'INJECTION_ERROR', context);
    }
}
/**
 * Service not found error
 */
export class ServiceNotFoundError extends InjectionError {
    constructor(serviceIdentifier, context) {
        super(`Service not found: ${String(serviceIdentifier)}`, {
            serviceIdentifier: String(serviceIdentifier),
            ...context,
        });
    }
}
/**
 * Circular dependency error
 */
export class CircularDependencyError extends InjectionError {
    constructor(chain, context) {
        super(`Circular dependency detected: ${chain.join(' -> ')}`, {
            dependencyChain: chain,
            ...context,
        });
    }
}
/**
 * Configuration error
 */
export class ConfigurationError extends BaseError {
    constructor(message, context) {
        super(message, 'CONFIGURATION_ERROR', context);
    }
}
/**
 * Initialization error
 */
export class InitializationError extends BaseError {
    constructor(message, serviceName, context) {
        super(message, 'INITIALIZATION_ERROR', {
            serviceName,
            ...context,
        });
    }
}
//# sourceMappingURL=BaseError.js.map