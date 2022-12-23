import { Set, Map } from 'immutable'

export type MappingChannel = 'hue' | 'saturation' | 'lightness' | 'radius' | 'alpha' | 'shape' | 'text' | 'width' | 'opacity' | 'none' | 'region' | 'x-position' | 'y-position'

export type MappingType = {
    mappingName: MappingChannel,
    attributeType: 'categorical' | 'ordered',
    objectType: 'none' | 'node' | 'edge',
    attributeName: string,
}

export type SelectedMappingsState = Set<Map<string, any>>

export type SelectedMappingsReducerAction =
    | { type: 'addEmpty' }
    | { type: 'remove', mapping: MappingType}
    | { type: 'editRow', prevItem: MappingType, newItem: MappingType }
    | { type: 'load', mappings: SelectedMappingsState }

/* global mappingChannels */
export const mappingChannels = ['hue' , 'saturation' , 'lightness' , 'radius' , 'alpha' , 'shape','text','width','none','region']

type BasicMappingType = {objectType: 'node' | 'edge' | 'all', channelType: 'categorical' | 'ordered'}

export type MappingProperties = {[key: string]: BasicMappingType}

/* global mappingProperties */
export let mappingProperties = Map<MappingChannel, BasicMappingType>()

mappingProperties = mappingProperties.set('hue', {objectType: 'all', channelType: 'categorical'})
mappingProperties = mappingProperties.set('saturation', {objectType: 'all', channelType: 'ordered'})
mappingProperties = mappingProperties.set('lightness', {objectType: 'all', channelType: 'ordered'})
mappingProperties = mappingProperties.set('radius', {objectType: 'node', channelType: 'ordered'})
mappingProperties = mappingProperties.set('alpha', {objectType: 'all', channelType: 'ordered'})
mappingProperties = mappingProperties.set('shape', {objectType: 'node', channelType: 'categorical'})
mappingProperties = mappingProperties.set('text', {objectType: 'all', channelType: 'categorical'})
mappingProperties = mappingProperties.set('width', {objectType: 'edge', channelType: 'ordered'})
mappingProperties = mappingProperties.set('none', {objectType: 'all', channelType: 'categorical'})
mappingProperties = mappingProperties.set('region', {objectType: 'node', channelType: 'categorical'})
mappingProperties = mappingProperties.set('x-position', {objectType: 'node', channelType: 'ordered'})
mappingProperties = mappingProperties.set('y-position', {objectType: 'node', channelType: 'ordered'})

export function SelectedMappingsReducer(state: SelectedMappingsState, action: SelectedMappingsReducerAction): SelectedMappingsState {
    switch (action.type) {
        case 'addEmpty':
            const emptyRow = Map({
                mappingName: 'none',
                mappingType: 'categorical',
                objectType: 'none',
                attributeName: '',
            })

            console.log(state.has(emptyRow))
            if (state.has(emptyRow)) {

                console.log("Item already exists")

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
