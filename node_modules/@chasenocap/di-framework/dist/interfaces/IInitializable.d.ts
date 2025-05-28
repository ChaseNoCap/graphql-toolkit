/**
 * Interface for services that need initialization
 */
export interface IInitializable {
    /**
     * Initialize the service
     */
    initialize(): void | Promise<void>;
}
/**
 * Type guard for IInitializable
 */
export declare function isInitializable(obj: unknown): obj is IInitializable;
//# sourceMappingURL=IInitializable.d.ts.map