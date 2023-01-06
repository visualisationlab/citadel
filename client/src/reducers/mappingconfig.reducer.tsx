/**
 * @author Miles van der Lely <m.vanderlely@uva.nl>
 *
 * This file contains the reducer for mapping configuration data.
 */

import { Set, Map } from 'immutable'
import { MappingType } from './selectedmappings.reducer'

export type MappingConfigState = Map<MappingType, MappingSettings>

// Defines the number of regions, the colour scheme, and mapping per attribute value.
export type MappingSettings = {
    regionNum: number,
    colourScheme: string,
    settings: {[key: string]: number}
}

// The action type for the selected mappings reducer.
export type MappingConfigReducerAction =
    | { type: 'updateData', key: MappingType, value: {[key: string]: number}}
    | { type: 'updateHueSettings', key: MappingType, value: string}
    | { type: 'updateRegionSettings', key: MappingType, value: number}

// The selected mappings reducer.
export function MappingConfigReducer(state: MappingConfigState, action: MappingConfigReducerAction): MappingConfigState {
    switch (action.type) {
        case 'updateData':
            if (state.has(action.key)) {
                return state.set(action.key, {...state.get(action.key)!, settings: {...action.value}})
            }

            return state.set(action.key, {regionNum: 1, colourScheme: 'default', settings: {...action.value}})

        case 'updateHueSettings':
            if (state.has(action.key)) {
                return state.set(action.key, {...state.get(action.key)!, colourScheme: action.value})
            }

            return state.set(action.key, {regionNum: 1, colourScheme: action.value, settings: {}})

        case 'updateRegionSettings':
            if (action.value < 0 || action.value > 8) {
                return state
            }

            if (state.has(action.key)) {
                return state.set(action.key, {...state.get(action.key)!, regionNum: action.value})
            }

            return state.set(action.key, {regionNum: action.value, colourScheme: 'default', settings: {}})
    }
}
