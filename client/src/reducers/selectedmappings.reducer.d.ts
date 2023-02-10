/**
 * @author Miles van der Lely <m.vanderlely@uva.nl>
 *
 * This file contains logic for selecting mappings. Mapping settings are
 * stored separately.
 */
import { Set, Map } from 'immutable';
export declare const shapeTypes: string[];
export type MappingChannel = 'hue' | 'saturation' | 'lightness' | 'radius' | 'shape' | 'alpha' | 'text' | 'width' | 'opacity' | 'none' | 'region' | 'x-position' | 'y-position';
export declare const mappingChannels: string[];
export type MappingType = {
    mappingName: MappingChannel;
    attributeType: 'categorical' | 'ordered';
    objectType: 'none' | 'node' | 'edge';
    attributeName: string;
};
export type MappingConfigState = Map<string, MappingSettings>;
export type MappingSettings = {
    regionNum: number;
    colourScheme: string | null;
    settings: Map<string, number>;
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
    type: 'mappings/added';
} | {
    type: 'mappings/removed';
    payload: {
        mapping: MappingType;
    };
} | {
    type: 'mappings/edited';
    payload: {
        prevMapping: MappingType;
        newMapping: MappingType;
    };
} | {
    type: 'mappings/loaded';
    payload: {
        text: string;
    };
} | {
    type: 'mappings/cleared';
} | {
    type: 'settings/added';
    payload: {
        mapping: MappingType;
        settings: MappingSettings;
    };
} | {
    type: 'settings/edited';
    payload: {
        mapping: MappingType;
        settings: MappingSettings;
    };
} | {
    type: 'schemes/added';
    payload: {
        key: string;
    };
} | {
    type: 'schemes/removed';
    payload: {
        key: string;
    };
} | {
    type: 'schemes/updated';
    payload: {
        key: string;
        values: number[];
    };
} | {
    type: 'schemes/loaded';
    payload: {
        text: string;
    };
} | {
    type: 'schemes/renamed';
    payload: {
        oldName: string;
        newName: string;
    };
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
