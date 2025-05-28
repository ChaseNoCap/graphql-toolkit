import { ContainerModule as InversifyModule, interfaces } from 'inversify';
/**
 * Module metadata
 */
export interface IModuleMetadata {
    name: string;
    version?: string;
    description?: string;
    dependencies?: string[];
}
/**
 * Extended container module with metadata
 */
export declare abstract class ContainerModule extends InversifyModule {
    readonly metadata: IModuleMetadata;
    constructor(metadata: IModuleMetadata);
    /**
     * Configure bindings for this module
     */
    protected abstract configure(bind: interfaces.Bind, unbind: interfaces.Unbind, isBound: interfaces.IsBound, rebind: interfaces.Rebind): void;
}
/**
 * Creates a simple container module
 */
export declare function createModule(metadata: IModuleMetadata, configurator: (bind: interfaces.Bind, unbind: interfaces.Unbind, isBound: interfaces.IsBound, rebind: interfaces.Rebind) => void): ContainerModule;
//# sourceMappingURL=ContainerModule.d.ts.map