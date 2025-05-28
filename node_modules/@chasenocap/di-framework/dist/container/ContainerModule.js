import { ContainerModule as InversifyModule } from 'inversify';
/**
 * Extended container module with metadata
 */
export class ContainerModule extends InversifyModule {
    metadata;
    constructor(metadata) {
        super((bind, unbind, isBound, rebind) => {
            this.configure(bind, unbind, isBound, rebind);
        });
        this.metadata = metadata;
    }
}
/**
 * Creates a simple container module
 */
export function createModule(metadata, configurator) {
    return new (class extends ContainerModule {
        configure(bind, unbind, isBound, rebind) {
            configurator(bind, unbind, isBound, rebind);
        }
    })(metadata);
}
//# sourceMappingURL=ContainerModule.js.map