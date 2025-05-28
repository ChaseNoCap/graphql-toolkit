/**
 * Creates a type-safe injection token
 */
export function createToken(name, description) {
    const token = Symbol.for(name);
    // Register metadata separately since we can't add properties to symbols
    TokenRegistry.register(token, { name, description });
    return token;
}
/**
 * Creates multiple related tokens with a common prefix
 */
export function createTokens(prefix, tokens) {
    const result = {};
    for (const [key, description] of Object.entries(tokens)) {
        result[key] = createToken(`${prefix}.${key}`, description);
    }
    return result;
}
/**
 * Registry for tracking all tokens
 */
export class TokenRegistry {
    static tokens = new Map();
    static register(token, metadata) {
        this.tokens.set(token, metadata);
    }
    static getMetadata(token) {
        return this.tokens.get(token);
    }
    static getAllTokens() {
        return new Map(this.tokens);
    }
    static clear() {
        this.tokens.clear();
    }
}
//# sourceMappingURL=TokenFactory.js.map