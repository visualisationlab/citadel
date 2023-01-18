/**
 * @author Miles van der Lely <m.vanderlely@uva.nl>
 *
 * This file contains logic for selecting mappings. Mapping settings are
 * stored separately.
 */
import { Set, Map } from 'immutable'

// All available mapping channels.
export type MappingChannel = 'hue' | 'saturation' | 'lightness' | 'radius'
                                   | 'alpha' | 'text' | 'width' | 'opacity'
                                   | 'none' | 'region' | 'x-position' | 'y-position'

export const mappingChannels = ['hue', 'saturation', 'lightness',
                                'radius', 'alpha', 'text', 'width',
                                'none', 'region']

// A mapping is a mapping channel, an attribute type, an object type, and an attribute name.
export type MappingType = {
    mappingName: MappingChannel,
    attributeType: 'categorical' | 'ordered',
    objectType: 'none' | 'node' | 'edge',
    attributeName: string,
}

// Maps stringified mappingType to settings.
export type MappingConfigState = Map<string, MappingSettings>

// Defines the number of regions, the colour scheme, and mapping per attribute value.
export type MappingSettings = {
    regionNum: number,
    colourScheme: string | null,
    settings: Map<string, number>
}

export type SchemeState = Map<string, number[]>

// The action type for the scheme reducer.
export type SchemeReducerAction =
    | { type: 'add', key: string, value: number[]}
    | { type: 'remove', key: string}
    | { type: 'update', key: string, value: number[]}

// The state of the selected mappings state is a set of mappings.
// Javascript doesn't support object sets, so we use immutable.js sets.
// The immutable.js sets are implemented as maps, so we use the Map type.
// This keeps the reducer logic simple.
export type MappingsState = {
    selectedMappings: Set<Map<string, any>>
    schemes: Map<string, number[]>
    config: MappingConfigState
}

// The action type for the selected mappings reducer.
export type MappingsReducerAction =
    | { type: 'selection', action: 'add' }
    | { type: 'selection', action: 'remove', mapping: MappingType}
    | { type: 'selection', action: 'edit', prevMapping: MappingType, newMapping: MappingType }
    | { type: 'selection', action: 'load', state: MappingsState }
    | { type: 'selection', action: 'clear' }
    | { type: 'settings', action: 'add', mapping: MappingType, settings: MappingSettings }
    | { type: 'settings', action: 'edit', mapping: MappingType, settings: MappingSettings }
    | { type: 'scheme', action: 'add', key: string, value: number[]}
    | { type: 'scheme', action: 'remove', key: string}
    | { type: 'scheme', action: 'update', key: string, value: number[]}
    | { type: 'scheme', action: 'load', state: SchemeState }


// The mapping properties are used to determine which channels can be used for which object types and attribute types.
type BasicMappingType = {objectType: 'node' | 'edge' | 'all', channelType: 'categorical' | 'ordered'}

// The mapping properties are stored in a map.
export type MappingProperties = {[key: string]: BasicMappingType}

export let mappingProperties = Map<MappingChannel, BasicMappingType>()

// The mapping properties are initialized here.
mappingProperties = mappingProperties.set('hue', {objectType: 'all', channelType: 'categorical'})
mappingProperties = mappingProperties.set('saturation', {objectType: 'all', channelType: 'ordered'})
mappingProperties = mappingProperties.set('lightness', {objectType: 'all', channelType: 'ordered'})
mappingProperties = mappingProperties.set('radius', {objectType: 'node', channelType: 'ordered'})
mappingProperties = mappingProperties.set('alpha', {objectType: 'all', channelType: 'ordered'})
mappingProperties = mappingProperties.set('text', {objectType: 'all', channelType: 'categorical'})
mappingProperties = mappingProperties.set('width', {objectType: 'edge', channelType: 'ordered'})
mappingProperties = mappingProperties.set('none', {objectType: 'all', channelType: 'categorical'})
mappingProperties = mappingProperties.set('region', {objectType: 'node', channelType: 'categorical'})
mappingProperties = mappingProperties.set('x-position', {objectType: 'node', channelType: 'ordered'})
mappingProperties = mappingProperties.set('y-position', {objectType: 'node', channelType: 'ordered'})

// Reducer for scheme settings.
function SchemeReducer(state: MappingsState, action: MappingsReducerAction): MappingsState {
    if (action.type !== 'scheme') return state

    switch(action.action) {
        case 'add':
            if (state.schemes.get(action.key) !== undefined) {
                console.log('Adding scheme: Scheme already exists')

                return state
            }

            state.schemes = state.schemes.set(action.key, action.value)

            return state
        case 'remove':
            if (state.schemes.get(action.key) === undefined) {
                console.log('Deleting scheme: Scheme does not exist')

                return state
            }

            state.config = state.config.map((value, _) => {
                if (value.colourScheme === action.key) {
                        value.colourScheme = null
                    }

                    return value
                })

            state.schemes = state.schemes.delete(action.key)

            return state
        case 'update':
            if (state.schemes.get(action.key) === undefined) {
                console.log('Updating scheme: Scheme does not exist')

                return state
            }

            state.schemes = state.schemes.set(action.key, action.value)

            return state
        case 'load':
            state.schemes = action.state

            return state
    }
}

// Reducer for mapping config.
function ConfigReducer(state: MappingsState, action: MappingsReducerAction): MappingsState {
    if (action.type !== 'settings') return state

    switch(action.action) {
        case 'add':
            if (state.config.get(JSON.stringify(action.mapping)) !== undefined) {
                console.log('Adding config: Config already exists')
            }

            state.config = state.config.set(JSON.stringify(action.mapping), action.settings)

            return state
        case 'edit':
            if (state.config.get(JSON.stringify(action.mapping)) === undefined) {
                console.log('Editing config: Config does not exist')

                return state
            }

            state.config = state.config.set(JSON.stringify(action.mapping), action.settings)

            return state
    }
}

// The selected mappings reducer.
export function MappingsReducer(state: MappingsState, action: MappingsReducerAction): MappingsState {
    switch(action.type) {
        case 'selection':
            switch (action.action) {
                case 'add':
                    const emptyRow = Map({
                        mappingName: 'none',
                        mappingType: 'categorical',
                        objectType: 'none',
                        attributeName: '',
                    })

                    if (state.selectedMappings.has(emptyRow)) {
                        console.log('Adding mapping: Empty row already exists')
                        return state
                    }

                    state.selectedMappings = state.selectedMappings.add(emptyRow)

                    return {...state}
                case 'remove':
                    state.selectedMappings = state.selectedMappings.delete(Map(action.mapping))

                    return {...state}
                case 'edit':
                    if (!state.selectedMappings.has(Map(action.prevMapping))) {
                        console.log('Editing mapping: Previous mapping does not exist')

                        return {...state}
                    }

                    state.selectedMappings = state.selectedMappings.delete(Map(action.prevMapping))

                    state.selectedMappings = state.selectedMappings.add(Map(action.newMapping))

                    if (!state.config.has(JSON.stringify(action.newMapping))) {
                        state.config = state.config.set(JSON.stringify(action.newMapping), {
                            colourScheme: null,
                            regionNum: 0,
                            settings: Map(),
                        })
                    }

                    return {...state}
                case 'load':
                    return {...action.state}
                case 'clear':
                    state.selectedMappings = Set()

                    return {...state}
            }

            return {...state}
        case 'settings':
            return {...ConfigReducer(state, action)}
        case 'scheme':
            return {...SchemeReducer(state, action)}

    }
}
