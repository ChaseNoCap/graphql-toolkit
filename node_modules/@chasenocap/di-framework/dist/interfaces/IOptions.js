/**
 * Type guard for IConfigurable
 */
export function isConfigurable(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        'configure' in obj &&
        typeof obj.configure === 'function');
}
//# sourceMappingURL=IOptions.js.map