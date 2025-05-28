/**
 * Type guard for IInitializable
 */
export function isInitializable(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        'initialize' in obj &&
        typeof obj.initialize === 'function');
}
//# sourceMappingURL=IInitializable.js.map