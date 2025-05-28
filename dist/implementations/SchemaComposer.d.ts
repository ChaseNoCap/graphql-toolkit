import type { ILogger } from '@chasenocap/logger';
import type { ISchemaComposer, ICompositionOptions, IComposedSchema, ISchemaLayer, ISchemaMetadata, IValidationResult } from '../interfaces/ISchemaComposer.js';
export declare class SchemaComposer implements ISchemaComposer {
    private logger;
    constructor(logger: ILogger);
    compose(options: ICompositionOptions): Promise<IComposedSchema>;
    addLayer(schema: IComposedSchema, layer: ISchemaLayer): Promise<IComposedSchema>;
    removeLayer(schema: IComposedSchema, layerName: string): Promise<IComposedSchema>;
    validate(options: ICompositionOptions): Promise<IValidationResult>;
    getMetadata(schema: IComposedSchema): ISchemaMetadata;
    private sortLayersByDependencies;
    private composeSchemas;
    private generateMetadata;
    private validateDependencies;
    private detectConflicts;
    private validateFederation;
}
//# sourceMappingURL=SchemaComposer.d.ts.map