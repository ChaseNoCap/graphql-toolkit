var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MockLogger_1;
import { injectable } from 'inversify';
let MockLogger = MockLogger_1 = class MockLogger {
    calls = [];
    childContext;
    constructor(context) {
        this.childContext = context;
    }
    debug(message, context) {
        this.recordCall('debug', message, { ...this.childContext, ...context });
    }
    info(message, context) {
        this.recordCall('info', message, { ...this.childContext, ...context });
    }
    warn(message, context) {
        this.recordCall('warn', message, { ...this.childContext, ...context });
    }
    error(message, error, context) {
        const errorContext = error instanceof Error
            ? { error: error.message, stack: error.stack }
            : error ? { error } : {};
        this.recordCall('error', message, {
            ...this.childContext,
            ...errorContext,
            ...context
        });
    }
    child(context) {
        const childLogger = new MockLogger_1({ ...this.childContext, ...context });
        childLogger.calls = this.calls;
        return childLogger;
    }
    hasLogged(level, message) {
        return this.calls.some(call => call.level === level &&
            (typeof message === 'string'
                ? call.message === message
                : message.test(call.message)));
    }
    getCallsMatching(filter) {
        return this.calls.filter(filter);
    }
    getCallsByLevel(level) {
        return this.calls.filter(call => call.level === level);
    }
    clear() {
        this.calls = [];
    }
    recordCall(level, message, context) {
        this.calls.push({
            level,
            message,
            context,
            timestamp: new Date()
        });
    }
};
MockLogger = MockLogger_1 = __decorate([
    injectable(),
    __metadata("design:paramtypes", [Object])
], MockLogger);
export { MockLogger };
//# sourceMappingURL=MockLogger.js.map