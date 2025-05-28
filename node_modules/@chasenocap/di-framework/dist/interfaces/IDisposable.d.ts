/**
 * Interface for resources that need cleanup
 */
export interface IDisposable {
    /**
     * Dispose of resources
     */
    dispose(): void | Promise<void>;
}
/**
 * Type guard for IDisposable
 */
export declare function isDisposable(obj: unknown): obj is IDisposable;
//# sourceMappingURL=IDisposable.d.ts.map