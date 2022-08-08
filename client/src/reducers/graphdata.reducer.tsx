import { VisGraph } from '../types'

import { Mappings } from '../mappings/module.mappings'

import { API } from '../services/api.service'

export type NodeMapping = 'colour' | 'radius' | 'alpha' | 'shape'
export type EdgeMapping = 'colour' | 'width' | 'alpha'

export interface GraphDataState {
    nodes: {
        data: VisGraph.GraphNode[]

        mapping: {
            generators: {
                'colour': {attribute: string, fun: Mappings.MappingFunction, data: Object}
                'radius': {attribute: string, fun: Mappings.MappingFunction, data: Object}
                'alpha': {attribute: string, fun: Mappings.MappingFunction, data: Object}
                'shape': {attribute: string, fun: Mappings.MappingFunction, data: Object}
            }

            settings: {
                'colours': VisGraph.Colour[]
                'minRadius': number
                'maxRadius': number
            }
        }
    },
    edges: {
        data: VisGraph.Edge[],
        mapping: {
            generators: {
                'colour': {attribute: string, fun: Mappings.MappingFunction, data: Object}
                'width': {attribute: string, fun: Mappings.MappingFunction, data: Object}
                'alpha': {attribute: string, fun: Mappings.MappingFunction, data: Object}
            }

            settings: {
                'colours': VisGraph.Colour[]
                'minWidth': number
                'maxWidth': number
            }
        }
    }
    directed: boolean
}

export type GraphDataReducerAction =
    | { type: 'set', property: 'data', value: {
        nodes: VisGraph.GraphNode[],
        edges: VisGraph.Edge[]
        directed: boolean
    }}
    | { type: 'set', property: 'mapping', object: 'node', map: NodeMapping, fun: Mappings.MappingFunction, key: string }
    | { type: 'set', property: 'mapping', object: 'edge', map: EdgeMapping, fun: Mappings.MappingFunction, key: string }
    | { type: 'set', property: 'directed', value: boolean}
    | { type: 'update', object: 'node' | 'edge', value: {
        id: string,
        attributes: {[key: string]: string}
    } }

function updateNodeMapping(state: GraphDataState): GraphDataState {
    Object.keys(state.nodes.mapping.generators).forEach((key) => {
        const mapping = state.nodes.mapping.generators[key as keyof typeof state.nodes.mapping.generators]

        if (mapping.attribute === '') {
            return state
        }

        const dataFun = Mappings.getDataFunction(mapping.fun)

        if (dataFun == null) {
            return state
        }

        const data = state.nodes.data.filter((item) => {
            return Object.keys(item.attributes).includes(mapping.attribute)
        }).map((item) => {
            return item.attributes[mapping.attribute]
        })

        try {
            const res = dataFun(data)

            console.log(res)
            state.nodes.mapping.generators[key as keyof typeof state.nodes.mapping.generators].data = res
        } catch (e) {
            console.log(`Error! ${e}`)
        }
    })

    return {...state}
}

function updateEdgeMapping(state: GraphDataState): GraphDataState {
    Object.keys(state.edges.mapping.generators).forEach((key) => {
        const mapping = state.edges.mapping.generators[key as keyof typeof state.edges.mapping.generators]

        if (mapping.attribute === '') {
            return state
        }

        const dataFun = Mappings.getDataFunction(mapping.fun)

        if (dataFun == null) {
            return state
        }

        const data = state.edges.data.filter((item) => {
            return Object.keys(item.attributes).includes(mapping.attribute)
        }).map((item) => {
            return item.attributes[mapping.attribute]
        })

        try {
            const res = dataFun(data)

            console.log(res)
            state.edges.mapping.generators[key as keyof typeof state.edges.mapping.generators].data = res
        } catch (e) {
            console.log(`Error! ${e}`)
        }
    })

    return {...state}
}

function updateData(state: GraphDataState, action: GraphDataReducerAction): GraphDataState {
    if (action.type !== 'update') {
        return state
    }

    switch (action.object) {
        case 'node':
            console.log(action)
            const result = state.nodes.data.filter((node) => {return node.id === action.value.id})

            if (result.length === 0 || result.length > 1) {
                console.log(`Wrong number of nodes with id ${action.value.id}: {result.length}`)

                return state
            }

            if (result[0].attributes.length !== action.value.attributes.length) {
                console.log(`Wrong number of attributes in update (a:${result[0].attributes.length} vs u:${action.value.attributes.length})`)

                return state
            }

            const newNodes = state.nodes.data.map((node) => {
                if (node.id !== action.value.id)
                    return node

                node.attributes = action.value.attributes

                return node
            })

            state.nodes.data = newNodes

            API.updateGraph(state)

            return {...updateNodeMapping(state)}
    }

    return state
}

function setData(state: GraphDataState, action: GraphDataReducerAction): GraphDataState {
    if (action.type !== 'set') {
        return state
    }

    switch (action.property) {
        case 'data':
            state.edges.data = action.value.edges

            state.nodes.data = action.value.nodes

            state.directed = action.value.directed

            state = {...updateEdgeMapping(state)}

            return {...updateNodeMapping(state)}
        case 'directed':

            state.directed = action.value

            return {...state}

        case 'mapping':
            switch (action.object) {
                case 'node':
                    state.nodes.mapping.generators[action.map as keyof typeof state.nodes.mapping.generators].attribute = action.key
                    state.nodes.mapping.generators[action.map as keyof typeof state.nodes.mapping.generators].fun = 'linearmap'

                    return {...updateNodeMapping(state)}
                case 'edge':
                    state.edges.mapping.generators[action.map as keyof typeof state.edges.mapping.generators].attribute = action.key
                    state.edges.mapping.generators[action.map as keyof typeof state.edges.mapping.generators].fun = 'linearmap'

                    return {...updateEdgeMapping(state)}
            }
    }
}

export function GraphDataReducer(state: GraphDataState, action: GraphDataReducerAction): GraphDataState {
    switch (action.type) {
        case 'set':
            return setData(state, action)
        case 'update':
            return updateData(state, action)
    }
}
