/**
 * Base interface for configuration options
 */
export interface IOptions {
    /**
     * Enable debug mode
     */
    debug?: boolean;
}
/**
 * Interface for services that can be configured
 */
export interface IConfigurable<T extends IOptions = IOptions> {
    /**
     * Configure the service
     */
    configure(options: T): void;
}
/**
 * Type guard for IConfigurable
 */
export declare function isConfigurable(obj: unknown): obj is IConfigurable;
//# sourceMappingURL=IOptions.d.ts.map