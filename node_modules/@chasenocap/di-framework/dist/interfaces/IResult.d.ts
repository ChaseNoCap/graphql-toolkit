/**
 * Generic result interface for success/error patterns
 */
export interface IResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: Error;
    message?: string;
}
/**
 * Success result factory
 */
export declare function success<T>(data: T, message?: string): IResult<T>;
/**
 * Error result factory
 */
export declare function failure<T = unknown>(error: Error | string, data?: T): IResult<T>;
//# sourceMappingURL=IResult.d.ts.map