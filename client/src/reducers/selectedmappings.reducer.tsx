/**
 * @author Miles van der Lely <m.vanderlely@uva.nl>
 *
 * This file contains logic for selecting mappings. Mapping settings are
 * stored separately.
 */
import { Set, Map } from 'immutable'

export const shapeTypes = ['circle', 'square']

// All available mapping channels.
export type MappingChannel = 'hue' | 'saturation' | 'lightness' | 'radius' | 'shape'
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
    settings: Map<string, number>,
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
    | { type: 'mappings/added' }
    | { type: 'mappings/removed', payload:{ mapping: MappingType }}
    | { type: 'mappings/edited', payload:{ prevMapping: MappingType, newMapping: MappingType }}
    | { type: 'mappings/loaded', payload: { text: string }}
    | { type: 'mappings/cleared' }
    | { type: 'settings/added', payload: { mapping: MappingType, settings: MappingSettings }}
    | { type: 'settings/edited', payload: { mapping: MappingType, settings: MappingSettings }}
    | { type: 'schemes/added', payload: { key: string }}
    | { type: 'schemes/removed', payload: { key: string }}
    | { type: 'schemes/updated', payload: { key: string, values: number[] }}
    | { type: 'schemes/loaded', payload: { text: string } }
    | { type: 'schemes/renamed', payload: { oldName: string, newName: string} }


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
mappingProperties = mappingProperties.set('shape', {objectType: 'node', channelType: 'categorical'})

const MAXSCHEMES = 20

function checkColour(colour: number): boolean {
    return colour >= 0 && colour < 360
}

function checkColours(colours: number[]): boolean {
    for (const colour of colours) {
        if (!checkColour(colour)) {
            return false
        }
    }

    if (colours.length > MAXSCHEMES) {
        return false
    }

    return true
}

function checkSchemeName(name: string): boolean {
    // Check if name contains illegal characters
    if (name.match(/[^a-zA-Z0-9_]/)) {
        return false
    }

    if (name.length > 0 && name.length < 20) {
        return true
    }

    return false
}

// Reducer for scheme settings.
function SchemeReducer(state: MappingsState, action: MappingsReducerAction): MappingsState {
    switch(action.type) {
        case 'schemes/added':
            if (state.schemes.get(action.payload.key) !== undefined) {
                console.log('Adding scheme: Scheme already exists')

                return state
            }

            if (state.schemes.size >= MAXSCHEMES) {
                console.log('Adding scheme: Maximum number of schemes reached')

                return state
            }

            state.schemes = state.schemes.set(action.payload.key, [])

            localStorage.setItem('schemes', JSON.stringify(state.schemes.toJS()))

            return {...state}
        case 'schemes/removed':
            if (state.schemes.get(action.payload.key) === undefined) {
                console.log('Deleting scheme: Scheme does not exist')

                return state
            }

            state.config = state.config.map((value, _) => {
                if (value.colourScheme === action.payload.key) {
                        value.colourScheme = null
                    }

                    return value
                })

            state.schemes = state.schemes.delete(action.payload.key)

            localStorage.setItem('schemes', JSON.stringify(state.schemes.toJS()))

            return {...state}
        case 'schemes/updated':
            if (state.schemes.get(action.payload.key) === undefined) {
                console.log('Updating scheme: Scheme does not exist')

                return state
            }

            console.log('here')

            // Check if the scheme values are valid.
            for (let value of action.payload.values) {
                if (typeof value !== 'number') {
                    console.log('Updating scheme: Value is not a number')

                    return state
                }

                if (value < 0 || value > MAXSCHEMECOLOURS) {
                    console.log('Updating scheme: Value is out of range')

                    return state
                }

                if (value % 1 !== 0) {
                    console.log('Updating scheme: Value is not an integer')

                    return state
                }
            }

            state.schemes = state.schemes.set(action.payload.key, action.payload.values)

            localStorage.setItem('schemes', JSON.stringify(state.schemes.toJS()))

            return {...state}
        case 'schemes/loaded':
            let loadedSchemes = JSON.parse(action.payload.text)

            if (loadedSchemes === null) {
                console.log('Loading schemes: No schemes found')

                return state
            }

            // Check if the loaded schemes are valid.
            for (let key in loadedSchemes) {
                if (key.length > 20) {
                    console.log('Loading schemes: Scheme keys are too long')

                    return state
                }

                if (key.length === 0) {
                    console.log('Loading schemes: Scheme keys are empty')

                    return state
                }

                if (typeof key !== 'string') {
                    console.log('Loading schemes: Invalid scheme keys')

                    return state
                }

                if (!Array.isArray(loadedSchemes[key])) {
                    console.log('Loading schemes: Scheme values are not an array')

                    return state
                }

                for (let value of loadedSchemes[key]) {
                    if (typeof value !== 'number') {
                        console.log('Loading schemes: Value is not a number')

                        return state
                    }
                }

                if (loadedSchemes[key].length > MAXSCHEMECOLOURS) {
                    console.log('Loading schemes: Scheme values are too long')

                    return state
                }

                for (let value of loadedSchemes[key]) {
                    if (value < 0 || value > 360) {
                        console.log('Loading schemes: Value is out of range')

                        return state
                    }
                }

                if (loadedSchemes[key].length === 0) {
                    console.log('Loading schemes: Scheme values are empty')

                    return state
                }
            }

            state.schemes = Map<string, number[]>(loadedSchemes)

            localStorage.setItem('schemes', JSON.stringify(state.schemes.toJS()))

            return {...state}
        case 'schemes/renamed':
            let oldName = state.schemes.get(action.payload.oldName)
            if (oldName === undefined) {
                console.log('Renaming scheme: Scheme does not exist')

                return state
            }

            // Check if the new name is valid.
            if (typeof action.payload.newName !== 'string') {
                console.log('Renaming scheme: New name is not a string')

                return state
            }

            if (state.schemes.get(action.payload.newName) !== undefined) {
                console.log('Renaming scheme: New name already exists')

                return state
            }

            // Check name length
            if (action.payload.newName.length > 20) {
                console.log('Renaming scheme: New name is too long')

                return state
            }

            if (action.payload.newName.length === 0) {
                console.log('Renaming scheme: New name is empty')

                return state
            }

            // Check name characters
            if (!action.payload.newName.match(/^[a-zA-Z0-9_]+$/)) {
                console.log('Renaming scheme: New name contains invalid characters')

                return state
            }

            // Update the config.
            state.config = state.config.map((value, _) => {
                if (value.colourScheme === action.payload.oldName) {
                    value.colourScheme = action.payload.newName
                }

                return value
            })

            // Update the schemes.
            state.schemes = state.schemes.set(action.payload.newName, oldName)
            state.schemes = state.schemes.delete(action.payload.oldName)

            localStorage.setItem('schemes', JSON.stringify(state.schemes.toJS()))

            return {...state}

        default:
            return state
    }
}

// Reducer for mapping config.
function ConfigReducer(state: MappingsState, action: MappingsReducerAction): MappingsState {
    switch(action.type) {
        case 'settings/added':
            if (state.config.get(JSON.stringify(action.payload.mapping)) !== undefined) {
                console.log('Adding config: Config already exists')
            }

            state.config = state.config.set(JSON.stringify(action.payload.mapping), action.payload.settings)

            return {...state}
        case 'settings/edited':
            if (state.config.get(JSON.stringify(action.payload.mapping)) === undefined) {
                console.log('Editing config: Config does not exist')

                return state
            }

            state.config = state.config.set(JSON.stringify(action.payload.mapping), action.payload.settings)

            return {...state}

        default:
            return state
    }
}

// The selected mappings reducer.
export function MappingsReducer(state: MappingsState, action: MappingsReducerAction): MappingsState {
    // Check if type begins with 'schemes/' or 'settings/'.
    if (action.type.startsWith('schemes/')) {

        return SchemeReducer(state, action)
    } else if (action.type.startsWith('settings/')) {
        return ConfigReducer(state, action)
    }

    switch (action.type) {
        case 'mappings/added':
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
        case 'mappings/removed':
            state.selectedMappings = state.selectedMappings.delete(Map(action.payload.mapping))

            return {...state}
        case 'mappings/edited':
            if (!state.selectedMappings.has(Map(action.payload.prevMapping))) {
                console.log('Editing mapping: Previous mapping does not exist')

                return {...state}
            }

            state.selectedMappings = state.selectedMappings.delete(Map(action.payload.prevMapping))

            state.selectedMappings = state.selectedMappings.add(Map(action.payload.newMapping))

            if (!state.config.has(JSON.stringify(action.payload.newMapping))) {
                state.config = state.config.set(JSON.stringify(action.payload.newMapping), {
                    colourScheme: null,
                    regionNum: 0,
                    settings: Map(),
                })
            }

            return {...state}
        case 'mappings/loaded':
            let loadedMappings = JSON.parse(action.payload.text)

            if (loadedMappings === null) {
                console.log('Loading mappings: No mappings found')

                return {...state}
            }

            // Check if the loaded mappings are valid.
            for (let i = 0; i < loadedMappings.length; i++) {
                if (loadedMappings[i].mappingName === undefined ||
                    loadedMappings[i].mappingType === undefined ||
                    loadedMappings[i].objectType === undefined ||
                    loadedMappings[i].attributeName === undefined) {
                    console.log('Loading mappings: Invalid mappings found')

                    return {...state}
                }
            }

            state.selectedMappings = Set(loadedMappings)

            return {...state}
        case 'mappings/cleared':
            state.selectedMappings = Set()

            return {...state}
        default:
            return {...state}
    }
}
