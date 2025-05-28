import { interfaces } from 'inversify';
/**
 * Token metadata
 */
export interface ITokenMetadata {
    name: string;
    description?: string;
    type?: string;
}
/**
 * Creates a type-safe injection token
 */
export declare function createToken<T>(name: string, description?: string): interfaces.ServiceIdentifier<T>;
/**
 * Creates multiple related tokens with a common prefix
 */
export declare function createTokens<T extends Record<string, string>>(prefix: string, tokens: T): {
    [K in keyof T]: interfaces.ServiceIdentifier<any>;
};
/**
 * Registry for tracking all tokens
 */
export declare class TokenRegistry {
    private static tokens;
    static register(token: symbol, metadata: ITokenMetadata): void;
    static getMetadata(token: symbol): ITokenMetadata | undefined;
    static getAllTokens(): Map<symbol, ITokenMetadata>;
    static clear(): void;
}
//# sourceMappingURL=TokenFactory.d.ts.map