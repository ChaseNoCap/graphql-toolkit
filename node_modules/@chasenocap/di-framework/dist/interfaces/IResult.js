/**
 * Success result factory
 */
export function success(data, message) {
    return {
        success: true,
        data,
        message,
    };
}
/**
 * Error result factory
 */
export function failure(error, data) {
    return {
        success: false,
        error: typeof error === 'string' ? new Error(error) : error,
        message: typeof error === 'string' ? error : error.message,
        data,
    };
}
//# sourceMappingURL=IResult.js.map