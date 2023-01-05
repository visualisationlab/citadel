/**
 * @author Miles van der Lely <m.vanderlely@uva.nl>
 *
 * This file contains logic for selecting mappings.
 */
import { Set, Map } from 'immutable'

// All available mapping channels.
export type MappingChannel = 'hue' | 'saturation' | 'lightness' | 'radius' | 'alpha' | 'text' | 'width' | 'opacity' | 'none' | 'region' | 'x-position' | 'y-position'

// A mapping is a mapping channel, an attribute type, an object type, and an attribute name.
export type MappingType = {
    mappingName: MappingChannel,
    attributeType: 'categorical' | 'ordered',
    objectType: 'none' | 'node' | 'edge',
    attributeName: string,
}

// The state of the selected mappings state is a set of mappings.
export type SelectedMappingsState = Set<Map<string, any>>

// The action type for the selected mappings reducer.
export type SelectedMappingsReducerAction =
    | { type: 'addEmpty' }
    | { type: 'remove', mapping: MappingType}
    | { type: 'editRow', prevItem: MappingType, newItem: MappingType }
    | { type: 'load', mappings: SelectedMappingsState }

/* global mappingChannels */
export const mappingChannels = ['hue' , 'saturation' , 'lightness' , 'radius' , 'alpha' , 'text','width','none','region']

// The mapping properties are used to determine which channels can be used for which object types and attribute types.
type BasicMappingType = {objectType: 'node' | 'edge' | 'all', channelType: 'categorical' | 'ordered'}

// The mapping properties are stored in a map.
export type MappingProperties = {[key: string]: BasicMappingType}

/* global mappingProperties */
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

// The selected mappings reducer.
export function SelectedMappingsReducer(state: SelectedMappingsState, action: SelectedMappingsReducerAction): SelectedMappingsState {
    switch (action.type) {
        case 'addEmpty':
            const emptyRow = Map({
                mappingName: 'none',
                mappingType: 'categorical',
                objectType: 'none',
                attributeName: '',
            })

            if (state.has(emptyRow)) {
                return state
            }

            return state.add(emptyRow)
        case 'remove':
            return state.delete(Map(action.mapping))

        case 'editRow':
            if (!state.has(Map(action.prevItem))) {
                console.log('Item does not exist')

                return state
            }

            state = state.delete(Map(action.prevItem))

            return state.add(Map(action.newItem))
        case 'load':
            return state
        default:
            return state
    }
}
