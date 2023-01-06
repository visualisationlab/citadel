/**
 * @author Miles van der Lely <m.vanderlely@uva.nl>
 *
 * This file contains the reducer for mapping configuration data.
 */
import { Map } from 'immutable';
import { MappingType } from './selectedmappings.reducer';
export type MappingConfigState = Map<MappingType, MappingSettings>;
export type MappingSettings = {
    regionNum: number;
    colourScheme: string;
    settings: {
        [key: string]: number;
    };
};
export type SelectedMappingsReducerAction = {
    type: 'updateData';
    key: MappingType;
    value: {
        [key: string]: number;
    };
} | {
    type: 'updateHueSettings';
    key: MappingType;
    value: string;
} | {
    type: 'updateRegionSettings';
    key: MappingType;
    value: number;
};
export declare function SelectedMappingsReducer(state: MappingConfigState, action: SelectedMappingsReducerAction): MappingConfigState;
