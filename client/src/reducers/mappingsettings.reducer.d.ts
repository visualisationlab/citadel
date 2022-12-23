/*
 * Implements a reducer for mapping settings.
 *
 * Each setting is a key-value pair, where the key is the JSON key of the mapping,
 * and the value is the configuration for that mapping. The configuration is different
 * for categorical or ordered mappings. For categorical mappings, the configuration
 * is a dictionary of values to indices.
 */

// all categorical: { [key: string] : number }
// Categorical:
// hue (sets of colours)
// shape: none possible
// text: text size
// region: number of regions

// Ordered:
// function
export type MappingsSettingsState =
    { settings: {[key: string]: CategoricalMappingSettings | OrderedMappingSettings},
      hues: [Number, Number, Number][],
      textSize: number,
      regionCount: number,
    }

type CategoricalMappingSettings = { [key: string]: number }
type OrderedMappingSettings = { function: string }

export type MappingsSettingsReducerAction =
    | { type: 'setCategoricalSetting', key: string, value: CategoricalMappingSettings }
    | { type: 'setOrderedSetting', key: string, value: OrderedMappingSettings }
    | { type: 'setHue', index: number, value: [Number, Number, Number] }
    | { type: 'setTextSize', value: number }
    | { type: 'setRegionCount', value: number }

export function MappingsSettingsReducer(state: MappingsSettingsState, action: MappingsSettingsReducerAction): MappingsSettingsState {
    switch (action.type) {
        case 'setCategoricalSetting':
            return {
                ...state,
                settings: {
                    ...state.settings,
                    [action.key]: action.value
                }
            }
        case 'setOrderedSetting':
            return {
                ...state,
                settings: {
                    ...state.settings,
                    [action.key]: action.value
                },
            }
        case 'setHue':
            if (action.index < 0 || action.index >= state.hues.length) {
                return state
            }

            return {
                ...state,
                hues: state.hues.map((hue, index) => {
                    if (index === action.index) {
                        return action.value
                    }

                    return hue
                })
            }
        case 'setTextSize':
            if (action.value < 0) {
                return state
            }

            return {
                ...state,
                textSize: action.value
            }
        case 'setRegionCount':
            if (action.value < 1) {
                return state
            }

            return {
                ...state,
                regionCount: action.value
            }
        default:
            return state
    }
}
