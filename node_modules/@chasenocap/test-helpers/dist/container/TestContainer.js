import { Container } from 'inversify';
export class TestContainerBuilder {
    snapshots = new Map();
    build(options = {}) {
        const container = options.baseContainer
            ? options.baseContainer.createChild()
            : new Container();
        const mocks = {};
        if (options.useMocks?.includes('logger')) {
            mocks.logger = undefined;
        }
        if (options.useMocks?.includes('fileSystem')) {
            mocks.fileSystem = undefined;
        }
        if (options.useMocks?.includes('cache')) {
            mocks.cache = undefined;
        }
        if (options.customMocks) {
            for (const [token, mock] of Object.entries(options.customMocks)) {
                if (typeof token === 'string') {
                    mocks[token] = mock;
                }
            }
        }
        const testContainer = {
            container,
            mocks,
            restore: () => this.restoreContainer(container),
            snapshot: () => this.snapshotContainer(container),
            getMock: (token) => {
                if (typeof token === 'string' && token in mocks) {
                    return mocks[token];
                }
                return container.get(token);
            }
        };
        return testContainer;
    }
    snapshotContainer(container) {
        const snapshot = container.createChild();
        this.snapshots.set(container, snapshot);
    }
    restoreContainer(container) {
        const snapshot = this.snapshots.get(container);
        if (snapshot) {
            container.unbindAll();
        }
    }
}
export function createTestContainer(options) {
    const builder = new TestContainerBuilder();
    return builder.build(options);
}
//# sourceMappingURL=TestContainer.js.map