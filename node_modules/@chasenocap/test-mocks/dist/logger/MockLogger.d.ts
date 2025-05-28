import type { ILogContext } from './ILogContext.js';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export interface LogCall {
    level: LogLevel;
    message: string;
    context?: ILogContext;
    timestamp: Date;
}
export interface ILogger {
    debug(message: string, context?: ILogContext): void;
    info(message: string, context?: ILogContext): void;
    warn(message: string, context?: ILogContext): void;
    error(message: string, error?: Error | unknown, context?: ILogContext): void;
    child(context: ILogContext): ILogger;
}
export declare class MockLogger implements ILogger {
    calls: LogCall[];
    private childContext?;
    constructor(context?: ILogContext);
    debug(message: string, context?: ILogContext): void;
    info(message: string, context?: ILogContext): void;
    warn(message: string, context?: ILogContext): void;
    error(message: string, error?: Error | unknown, context?: ILogContext): void;
    child(context: ILogContext): ILogger;
    hasLogged(level: LogLevel, message: string | RegExp): boolean;
    getCallsMatching(filter: (call: LogCall) => boolean): LogCall[];
    getCallsByLevel(level: LogLevel): LogCall[];
    clear(): void;
    private recordCall;
}
//# sourceMappingURL=MockLogger.d.ts.map