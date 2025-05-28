import { SimpleEventAwareMock } from '../base/SimpleEventAwareMock.js';
import type { ILogContext } from './ILogContext.js';
import type { ILogger, LogCall, LogLevel } from './MockLogger.js';
export declare class SimpleEventAwareMockLogger extends SimpleEventAwareMock implements ILogger {
    calls: LogCall[];
    private childContext?;
    constructor(context?: ILogContext);
    debug(message: string, context?: ILogContext): void;
    info(message: string, context?: ILogContext): void;
    warn(message: string, context?: ILogContext): void;
    error(message: string, error?: Error | unknown, context?: ILogContext): void;
    child(context: ILogContext): ILogger;
    private logWithEvents;
    getCallsByLevel(level: LogLevel): LogCall[];
    getCallsMatching(pattern: string | RegExp): LogCall[];
    hasLogged(level: LogLevel, message: string): boolean;
    hasLoggedMatching(level: LogLevel, pattern: string | RegExp): boolean;
    clear(): void;
}
//# sourceMappingURL=SimpleEventAwareMockLogger.d.ts.map