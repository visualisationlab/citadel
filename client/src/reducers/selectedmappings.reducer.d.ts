/**
 * @author Miles van der Lely <m.vanderlely@uva.nl>
 *
 * This file contains logic for selecting mappings. Mapping settings are
 * stored separately.
 */
import { Set, Map } from 'immutable';
export type MappingChannel = 'hue' | 'saturation' | 'lightness' | 'radius' | 'alpha' | 'text' | 'width' | 'opacity' | 'none' | 'region' | 'x-position' | 'y-position';
export declare const mappingChannels: string[];
export type MappingType = {
    mappingName: MappingChannel;
    attributeType: 'categorical' | 'ordered';
    objectType: 'none' | 'node' | 'edge';
    attributeName: string;
};
export type MappingConfigState = Map<MappingType, MappingSettings>;
export type MappingSettings = {
    regionNum: number;
    colourScheme: string | null;
    settings: {
        [key: string]: number;
    };
};
export type SchemeState = Map<string, number[]>;
export type SchemeReducerAction = {
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
export type MappingsState = {
    selectedMappings: Set<Map<string, any>>;
    schemes: Map<string, number[]>;
    config: MappingConfigState;
};
export type MappingsReducerAction = {
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
    value: number[];
} | {
    type: 'scheme';
    action: 'remove';
    key: string;
} | {
    type: 'scheme';
    action: 'update';
    key: string;
    value: number[];
} | {
    type: 'scheme';
    action: 'load';
    state: SchemeState;
};
type BasicMappingType = {
    objectType: 'node' | 'edge' | 'all';
    channelType: 'categorical' | 'ordered';
};
export type MappingProperties = {
    [key: string]: BasicMappingType;
};
export declare let mappingProperties: Map<MappingChannel, BasicMappingType>;
export declare function MappingsReducer(state: MappingsState, action: MappingsReducerAction): MappingsState;
export {};
