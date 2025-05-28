/**
 * Type guard for IDisposable
 */
export function isDisposable(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        'dispose' in obj &&
        typeof obj.dispose === 'function');
}
//# sourceMappingURL=IDisposable.js.map