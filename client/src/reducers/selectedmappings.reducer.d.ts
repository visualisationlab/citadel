import { Set, Map } from 'immutable';
export type MappingChannel = 'hue' | 'saturation' | 'lightness' | 'radius' | 'alpha' | 'shape' | 'text' | 'width' | 'opacity' | 'none' | 'region' | 'x-position' | 'y-position';
export type MappingType = {
    mappingName: MappingChannel;
    attributeType: 'categorical' | 'ordered';
    objectType: 'none' | 'node' | 'edge';
    attributeName: string;
};
export type SelectedMappingsState = Set<Map<string, any>>;
export type SelectedMappingsReducerAction = {
    type: 'addEmpty';
} | {
    type: 'remove';
    mapping: MappingType;
} | {
    type: 'editRow';
    prevItem: MappingType;
    newItem: MappingType;
} | {
    type: 'load';
    mappings: SelectedMappingsState;
};
export declare const mappingChannels: string[];
type BasicMappingType = {
    objectType: 'node' | 'edge' | 'all';
    channelType: 'categorical' | 'ordered';
};
export type MappingProperties = {
    [key: string]: BasicMappingType;
};
export declare let mappingProperties: Map<MappingChannel, BasicMappingType>;
export declare function SelectedMappingsReducer(state: SelectedMappingsState, action: SelectedMappingsReducerAction): SelectedMappingsState;
export {};
