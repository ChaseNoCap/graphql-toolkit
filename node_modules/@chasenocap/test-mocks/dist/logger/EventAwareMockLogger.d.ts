import { EventAwareInterfaceMock } from '../base/EventAwareMock.js';
import type { ILogContext } from './ILogContext.js';
import type { ILogger, LogCall, LogLevel } from './MockLogger.js';
export declare class EventAwareMockLogger extends EventAwareInterfaceMock<ILogger> implements ILogger {
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
    getStats(): {
        totalCalls: number;
        callsByLevel: Record<LogLevel, number>;
        hasContext: number;
        timeSpan: {
            first: Date;
            last: Date;
            duration: number;
        } | null;
    };
}
//# sourceMappingURL=EventAwareMockLogger.d.ts.map