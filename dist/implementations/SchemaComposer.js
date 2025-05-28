var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { injectable, inject } from 'inversify';
import { isSchema, validateSchema, } from 'graphql';
import { GRAPHQL_TOOLKIT_TYPES } from '../types/InjectionTokens.js';
let SchemaComposer = class SchemaComposer {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    async compose(options) {
        this.logger.info('Starting schema composition', {
            layerCount: options.layers.length,
            federationEnabled: options.federationEnabled,
            mergeStrategy: options.mergeStrategy || 'merge',
        });
        try {
            // Validate composition options
            if (options.validate !== false) {
                const validation = await this.validate(options);
                if (!validation.valid) {
                    throw new Error(`Schema composition validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
                }
            }
            // Sort layers by priority and dependencies
            const sortedLayers = this.sortLayersByDependencies(options.layers);
            // Compose schemas based on strategy
            const composedSchema = await this.composeSchemas(sortedLayers, options);
            // Generate metadata
            const metadata = this.generateMetadata(composedSchema, sortedLayers, options);
            const result = {
                schema: composedSchema,
                layers: sortedLayers,
                metadata,
            };
            this.logger.info('Schema composition completed successfully', {
                totalTypes: metadata.totalTypes,
                totalFields: metadata.totalFields,
                layerCount: metadata.layerCount,
                conflicts: metadata.conflicts?.length || 0,
            });
            return result;
        }
        catch (error) {
            this.logger.error('Schema composition failed', error);
            throw error;
        }
    }
    async addLayer(schema, layer) {
        this.logger.info('Adding layer to composed schema', {
            layerName: layer.name,
            currentLayerCount: schema.layers.length,
        });
        try {
            const newLayers = [...schema.layers, layer];
            const options = {
                layers: newLayers,
                federationEnabled: schema.metadata.optimizations.enableFieldLevelCaching,
                mergeStrategy: 'merge',
                validate: true,
            };
            return await this.compose(options);
        }
        catch (error) {
            this.logger.error('Failed to add layer to schema', error, {
                layerName: layer.name,
            });
            throw error;
        }
    }
    async removeLayer(schema, layerName) {
        this.logger.info('Removing layer from composed schema', {
            layerName,
            currentLayerCount: schema.layers.length,
        });
        try {
            const newLayers = schema.layers.filter(layer => layer.name !== layerName);
            if (newLayers.length === schema.layers.length) {
                throw new Error(`Layer '${layerName}' not found in composed schema`);
            }
            const options = {
                layers: newLayers,
                federationEnabled: schema.metadata.optimizations.enableFieldLevelCaching,
                mergeStrategy: 'merge',
                validate: true,
            };
            return await this.compose(options);
        }
        catch (error) {
            this.logger.error('Failed to remove layer from schema', error, {
                layerName,
            });
            throw error;
        }
    }
    async validate(options) {
        this.logger.debug('Validating schema composition', {
            layerCount: options.layers.length,
        });
        const errors = [];
        const warnings = [];
        const conflicts = [];
        try {
            // Validate individual layers
            for (const layer of options.layers) {
                if (!isSchema(layer.schema)) {
                    errors.push({
                        type: 'composition',
                        message: `Layer '${layer.name}' does not contain a valid GraphQL schema`,
                        layer: layer.name,
                        severity: 'error',
                    });
                    continue;
                }
                // Validate GraphQL schema
                const schemaErrors = validateSchema(layer.schema);
                if (schemaErrors.length > 0) {
                    errors.push(...schemaErrors.map(error => ({
                        type: 'graphql',
                        message: error.message,
                        layer: layer.name,
                        severity: 'error',
                    })));
                }
            }
            // Validate dependencies
            this.validateDependencies(options.layers, errors);
            // Detect conflicts
            this.detectConflicts(options.layers, conflicts, warnings);
            // Validate federation if enabled
            if (options.federationEnabled) {
                this.validateFederation(options.layers, errors, warnings);
            }
            const result = {
                valid: errors.length === 0,
                errors,
                warnings,
                conflicts,
            };
            this.logger.debug('Schema validation completed', {
                valid: result.valid,
                errorCount: errors.length,
                warningCount: warnings.length,
                conflictCount: conflicts.length,
            });
            return result;
        }
        catch (error) {
            this.logger.error('Schema validation failed', error);
            throw error;
        }
    }
    getMetadata(schema) {
        return schema.metadata;
    }
    sortLayersByDependencies(layers) {
        const sorted = [];
        const visited = new Set();
        const visiting = new Set();
        const visit = (layer) => {
            if (visiting.has(layer.name)) {
                throw new Error(`Circular dependency detected: ${layer.name}`);
            }
            if (visited.has(layer.name)) {
                return;
            }
            visiting.add(layer.name);
            // Visit dependencies first
            if (layer.dependencies) {
                for (const depName of layer.dependencies) {
                    const depLayer = layers.find(l => l.name === depName);
                    if (depLayer) {
                        visit(depLayer);
                    }
                }
            }
            visiting.delete(layer.name);
            visited.add(layer.name);
            sorted.push(layer);
        };
        // Sort by priority first, then by dependencies
        const prioritySorted = [...layers].sort((a, b) => a.priority - b.priority);
        for (const layer of prioritySorted) {
            visit(layer);
        }
        return sorted;
    }
    async composeSchemas(layers, options) {
        if (layers.length === 0) {
            throw new Error('Cannot compose empty schema layers');
        }
        if (layers.length === 1) {
            return layers[0].schema;
        }
        try {
            // For now, simple composition by taking the last schema
            // In a real implementation, you'd use @graphql-tools/schema
            if (layers.length === 1) {
                return layers[0].schema;
            }
            // Simple merge - in practice would use proper schema merging tools
            return layers[layers.length - 1].schema;
        }
        catch (error) {
            this.logger.error('Failed to compose schemas', error);
            throw new Error(`Schema composition failed: ${error.message}`);
        }
    }
    generateMetadata(schema, layers, options) {
        const typeMap = schema.getTypeMap();
        const types = Object.keys(typeMap).filter(name => !name.startsWith('__'));
        // Count fields across all types
        let totalFields = 0;
        for (const typeName of types) {
            const type = typeMap[typeName];
            if ('getFields' in type && typeof type.getFields === 'function') {
                const fields = type.getFields();
                totalFields += Object.keys(fields).length;
            }
        }
        return {
            composedAt: new Date(),
            totalTypes: types.length,
            totalFields,
            layerCount: layers.length,
            optimizations: options.optimizations || {},
            conflicts: [], // Would be populated by conflict detection
        };
    }
    validateDependencies(layers, errors) {
        const layerNames = new Set(layers.map(l => l.name));
        for (const layer of layers) {
            if (layer.dependencies) {
                for (const depName of layer.dependencies) {
                    if (!layerNames.has(depName)) {
                        errors.push({
                            type: 'composition',
                            message: `Layer '${layer.name}' depends on '${depName}' which is not available`,
                            layer: layer.name,
                            severity: 'error',
                        });
                    }
                }
            }
        }
    }
    detectConflicts(layers, conflicts, warnings) {
        const typeOccurrences = new Map();
        const fieldOccurrences = new Map();
        // Track type and field occurrences across layers
        for (const layer of layers) {
            const typeMap = layer.schema.getTypeMap();
            for (const [typeName, type] of Object.entries(typeMap)) {
                if (typeName.startsWith('__'))
                    continue;
                // Track type occurrences
                if (!typeOccurrences.has(typeName)) {
                    typeOccurrences.set(typeName, []);
                }
                typeOccurrences.get(typeName).push(layer.name);
                // Track field occurrences
                if ('getFields' in type && typeof type.getFields === 'function') {
                    const fields = type.getFields();
                    for (const fieldName of Object.keys(fields)) {
                        const fullFieldName = `${typeName}.${fieldName}`;
                        if (!fieldOccurrences.has(fullFieldName)) {
                            fieldOccurrences.set(fullFieldName, []);
                        }
                        fieldOccurrences.get(fullFieldName).push(layer.name);
                    }
                }
            }
        }
        // Detect conflicts
        for (const [typeName, layerNames] of typeOccurrences) {
            if (layerNames.length > 1) {
                conflicts.push({
                    type: 'type',
                    name: typeName,
                    layers: layerNames,
                    resolution: 'merged',
                    details: `Type '${typeName}' appears in multiple layers: ${layerNames.join(', ')}`,
                });
            }
        }
        for (const [fieldName, layerNames] of fieldOccurrences) {
            if (layerNames.length > 1) {
                warnings.push({
                    type: 'compatibility',
                    message: `Field '${fieldName}' appears in multiple layers: ${layerNames.join(', ')}`,
                    suggestion: 'Ensure field types are compatible across layers',
                });
            }
        }
    }
    validateFederation(layers, errors, warnings) {
        // Federation-specific validation would go here
        // For now, just add a placeholder warning
        warnings.push({
            type: 'best-practice',
            message: 'Federation validation is not fully implemented',
            suggestion: 'Implement comprehensive federation validation',
        });
    }
};
SchemaComposer = __decorate([
    injectable(),
    __param(0, inject(GRAPHQL_TOOLKIT_TYPES.ILogger)),
    __metadata("design:paramtypes", [Object])
], SchemaComposer);
export { SchemaComposer };
//# sourceMappingURL=SchemaComposer.js.map