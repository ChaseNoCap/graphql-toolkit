var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EventAwareMockLogger_1;
import { injectable } from 'inversify';
import { EventAwareInterfaceMock } from '../base/EventAwareMock.js';
let EventAwareMockLogger = EventAwareMockLogger_1 = class EventAwareMockLogger extends EventAwareInterfaceMock {
    calls = [];
    childContext;
    constructor(context) {
        super('MockLogger');
        this.childContext = context;
    }
    debug(message, context) {
        this.logWithEvents('debug', message, context);
    }
    info(message, context) {
        this.logWithEvents('info', message, context);
    }
    warn(message, context) {
        this.logWithEvents('warn', message, context);
    }
    error(message, error, context) {
        const enhancedContext = {
            ...context,
            error: error instanceof Error ? {
                message: error.message,
                name: error.name,
                stack: error.stack
            } : error
        };
        this.logWithEvents('error', message, enhancedContext);
    }
    child(context) {
        const mergedContext = { ...this.childContext, ...context };
        const childLogger = new EventAwareMockLogger_1(mergedContext);
        if (this.eventBus) {
            childLogger.enableEventEmission(this.eventBus);
        }
        this.emitOperationCompleted('child.created', {
            parentContext: this.childContext,
            childContext: context,
            mergedContext
        });
        return childLogger;
    }
    logWithEvents(level, message, context) {
        const finalContext = { ...this.childContext, ...context };
        const logCall = {
            level,
            message,
            context: finalContext,
            timestamp: new Date()
        };
        this.emitOperationStarted('log', {
            level,
            message,
            context: finalContext,
            hasContext: !!finalContext && Object.keys(finalContext).length > 0
        }).catch(console.warn);
        try {
            this.calls.push(logCall);
            this.emitOperationCompleted('log', {
                level,
                message,
                context: finalContext,
                callIndex: this.calls.length - 1,
                totalCalls: this.calls.length
            }, logCall).catch(console.warn);
            this.emitMockEvent(`log.${level}`, {
                message,
                context: finalContext,
                callIndex: this.calls.length - 1
            }).catch(console.warn);
        }
        catch (operationError) {
            this.emitOperationFailed('log', operationError, {
                level,
                message,
                context: finalContext
            }).catch(console.warn);
            throw operationError;
        }
    }
    getCallsByLevel(level) {
        return this.calls.filter(call => call.level === level);
    }
    getCallsMatching(pattern) {
        const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
        return this.calls.filter(call => regex.test(call.message));
    }
    hasLogged(level, message) {
        return this.calls.some(call => call.level === level && call.message === message);
    }
    hasLoggedMatching(level, pattern) {
        const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
        return this.calls.some(call => call.level === level && regex.test(call.message));
    }
    clear() {
        const clearedCallsCount = this.calls.length;
        this.emitOperationStarted('clear', {
            callsToCleared: clearedCallsCount
        }).catch(console.warn);
        this.calls = [];
        this.emitOperationCompleted('clear', {
            clearedCallsCount
        }).catch(console.warn);
    }
    getStats() {
        const stats = {
            totalCalls: this.calls.length,
            callsByLevel: {},
            hasContext: this.calls.filter(call => call.context && Object.keys(call.context).length > 0).length,
            timeSpan: this.calls.length > 0 ? {
                first: this.calls[0].timestamp,
                last: this.calls[this.calls.length - 1].timestamp,
                duration: this.calls[this.calls.length - 1].timestamp.getTime() - this.calls[0].timestamp.getTime()
            } : null
        };
        ['debug', 'info', 'warn', 'error'].forEach(level => {
            stats.callsByLevel[level] = this.getCallsByLevel(level).length;
        });
        return stats;
    }
};
EventAwareMockLogger = EventAwareMockLogger_1 = __decorate([
    injectable(),
    __metadata("design:paramtypes", [Object])
], EventAwareMockLogger);
export { EventAwareMockLogger };
//# sourceMappingURL=EventAwareMockLogger.js.map