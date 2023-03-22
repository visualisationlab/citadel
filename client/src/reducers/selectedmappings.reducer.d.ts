/**
 * @author Miles van der Lely <m.vanderlely@uva.nl>
 *
 * This file contains logic for selecting mappings. Mapping settings are
 * stored separately.
 */
import { Set, Map } from 'immutable';
export declare const shapeTypes: string[];
export declare type MappingChannel = 'hue' | 'saturation' | 'lightness' | 'radius' | 'shape' | 'alpha' | 'text' | 'width' | 'opacity' | 'none' | 'region' | 'x-position' | 'y-position';
export declare const mappingChannels: string[];
export declare type MappingType = {
    mappingName: MappingChannel;
    attributeType: 'categorical' | 'ordered';
    objectType: 'none' | 'node' | 'edge';
    attributeName: string;
};
export declare type MappingConfigState = Map<string, MappingSettings>;
export declare type MappingSettings = {
    regionNum: number;
    colourScheme: string | null;
    settings: Map<string, number>;
};
export declare type SchemeState = Map<string, number[]>;
export declare type SchemeReducerAction = {
    type: 'add';
    key: string;
    value: number[];
} | {
    type: 'remove';
    key: string;
} | {
    type: 'update';
    key: string;
    value: number[];
};
export declare type MappingsState = {
    selectedMappings: Set<Map<string, any>>;
    schemes: Map<string, number[]>;
    config: MappingConfigState;
};
export declare type MappingsReducerAction = {
    type: 'selection';
    action: 'add';
} | {
    type: 'selection';
    action: 'remove';
    mapping: MappingType;
} | {
    type: 'selection';
    action: 'edit';
    prevMapping: MappingType;
    newMapping: MappingType;
} | {
    type: 'selection';
    action: 'load';
    state: MappingsState;
} | {
    type: 'selection';
    action: 'clear';
} | {
    type: 'settings';
    action: 'add';
    mapping: MappingType;
    settings: MappingSettings;
} | {
    type: 'settings';
    action: 'edit';
    mapping: MappingType;
    settings: MappingSettings;
} | {
    type: 'scheme';
    action: 'add';
    key: string;
} | {
    type: 'scheme';
    action: 'remove';
    key: string;
} | {
    type: 'scheme';
    action: 'update';
    key: string;
    values: number[];
} | {
    type: 'scheme';
    action: 'load';
    state: SchemeState;
} | {
    type: 'scheme';
    action: 'rename';
    oldName: string;
    newName: string;
};
declare type BasicMappingType = {
    objectType: 'node' | 'edge' | 'all';
    channelType: 'categorical' | 'ordered';
};
export declare type MappingProperties = {
    [key: string]: BasicMappingType;
};
export declare let mappingProperties: Map<MappingChannel, BasicMappingType>;
export declare function MappingsReducer(state: MappingsState, action: MappingsReducerAction): MappingsState;
export {};
