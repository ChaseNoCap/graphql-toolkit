import { TestContainerBuilder } from '../container/TestContainer.js';
import './test-globals.js';
const activeSetups = new Set();
export function setupTest(options = {}) {
    const builder = new TestContainerBuilder();
    const testContainer = builder.build(options);
    const setup = {
        container: testContainer.container,
        mocks: testContainer.mocks,
        cleanup: () => {
            if (setup.mocks.logger) {
                setup.mocks.logger.clear();
            }
            if (setup.mocks.fileSystem) {
                setup.mocks.fileSystem.clear();
            }
            if (setup.mocks.cache) {
                setup.mocks.cache.clear();
                setup.mocks.cache.resetStats();
            }
            for (const mock of Object.values(setup.mocks)) {
                if (mock && typeof mock.reset === 'function') {
                    mock.reset();
                }
            }
            activeSetups.delete(setup);
        },
        reset: () => {
            if (setup.mocks.logger) {
                setup.mocks.logger.clear();
            }
            if (setup.mocks.fileSystem) {
                setup.mocks.fileSystem.clear();
            }
            if (setup.mocks.cache) {
                setup.mocks.cache.clear();
                setup.mocks.cache.resetStats();
            }
        }
    };
    activeSetups.add(setup);
    return setup;
}
export function cleanupAllTests() {
    for (const setup of activeSetups) {
        setup.cleanup();
    }
    activeSetups.clear();
}
export function withTestContext(options, testFn) {
    const setup = setupTest(options);
    return testFn(setup)
        .finally(() => {
        setup.cleanup();
    });
}
export function testEach(cases, testFn) {
    for (const testCase of cases) {
        if (typeof it !== 'undefined') {
            it(testCase.name, () => testFn(testCase));
        }
        else {
            throw new Error('testEach requires a test runner with global `it` function');
        }
    }
}
export async function flushPromises() {
    await new Promise(resolve => setImmediate(resolve));
}
export function suppressConsole() {
    const originalConsole = {
        log: console.log,
        error: console.error,
        warn: console.warn
    };
    const output = {
        log: [],
        error: [],
        warn: []
    };
    console.log = (...args) => {
        output.log.push(args.join(' '));
    };
    console.error = (...args) => {
        output.error.push(args.join(' '));
    };
    console.warn = (...args) => {
        output.warn.push(args.join(' '));
    };
    return {
        restore: () => {
            console.log = originalConsole.log;
            console.error = originalConsole.error;
            console.warn = originalConsole.warn;
        },
        getOutput: () => ({ ...output })
    };
}
//# sourceMappingURL=SetupHelpers.js.map