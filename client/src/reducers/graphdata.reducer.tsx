/**
 * @author Miles van der Lely <m.vanderlely@uva.nl>
 *
 * This file contains the graph data reducer, which is used to store the graph data.
 */
// import { VisGraph } from '../types'

import { API } from '../services/api.service'
import { BasicEdge, BasicNode } from '../components/router.component'

// Metadata is used for mappings.
export type MetadataType = {
    type: 'ordered'
    dataType: 'number'
    min: number
    max: number
    average: number
    count: number
    frequencies: [string, number][]
    frequencyDict: {[key: string]: number}
} | {
    type: 'categorical'
    frequencies: [string, number][]
    frequencyDict: {[key: string]: number}
}

// The graph data state is a set of nodes and edges.
export interface GraphDataState {
    nodes: {
        data: BasicNode[],
        metadata: {[key: string]: MetadataType}
    },
    edges: {
        data: BasicEdge[],
        metadata: {[key: string]: MetadataType}
    },
    globals: {[key: string]: {[key: string]: string}},
    directed: boolean
}

export type GraphDataReducerAction =
    | { type: 'set', property: 'data', value: {
        nodes: BasicNode[],
        edges: BasicEdge[],
        globals: {[key: string]: any},
    }}
    | { type: 'set', property: 'directed', value: boolean}
    | { type: 'update', object: 'node' | 'edge', value: {
        id: string,
        attributes: {[key: string]: string}
    } }

// The graph data reducer is used to update the graph data state.
function updateData(state: GraphDataState, action: GraphDataReducerAction): GraphDataState {
    if (action.type !== 'update') {
        return state
    }

    let newState: BasicNode[] | BasicEdge[] = []

    if (action.object === 'node') {
        newState = state.nodes.data.map((node) => {
            if (node.id !== action.value.id)
                return node

            node = {...node,
                ...action.value.attributes}

            return node

        })
    } else if (action.object === 'edge') {
        newState = state.edges.data.map((edge) => {
            if (edge.id !== action.value.id)
                return edge

            edge = {...edge, ...action.value.attributes}

            return edge
        })
    }

    if (action.object === 'node') {
        state.nodes.data = newState as BasicNode[]

        state.nodes.metadata = calculateMetadata(state.nodes.data)

        API.updateGraph(state)
    } else if (action.object === 'edge') {
        state.edges.data = newState as BasicEdge[]

        state.edges.metadata = calculateMetadata(state.edges.data)

        API.updateGraph(state)
    }

    return {...state}
}

function calculateMetadata(data: BasicNode[] | BasicEdge[])
    : {[key: string]: MetadataType} {

    let nodeMetadata: {[key: string]: MetadataType} = {}

    for (const node of data) {
        for (const attribute of Object.keys(node)) {
            let metadata = nodeMetadata[attribute]

            if (metadata === undefined) {
                nodeMetadata[attribute] = {
                    type: 'ordered',
                    frequencies: [],
                    dataType: 'number',
                    min: Number.MAX_VALUE,
                    max: Number.MIN_VALUE,
                    count: 0,
                    average: 0,
                    frequencyDict: {}
                }

                metadata = nodeMetadata[attribute]
            }

            const value = node[attribute]

            if (metadata.type === 'ordered' && isNaN(Number(value))) {
                nodeMetadata[attribute].type = 'categorical'
            }

            if (metadata.type === 'ordered') {
                const numValue = Number(value)

                nodeMetadata[attribute].type = 'ordered'

                // @ts-ignore
                nodeMetadata[attribute].min = Math.min(nodeMetadata[attribute].min, numValue)
                // @ts-ignore
                nodeMetadata[attribute].max = Math.max(nodeMetadata[attribute].max, numValue)

                // @ts-ignore
                nodeMetadata[attribute].average += numValue
                // @ts-ignore
                nodeMetadata[attribute].count += 1
            }

            const index = metadata.frequencies.findIndex((f) => {return f[0] === value})

            if (index === -1) {
                metadata.frequencies.push([value, 1])
            } else {
                metadata.frequencies[index][1] += 1
            }
        }
    }

    for (const attribute of Object.keys(nodeMetadata)) {
        if (nodeMetadata[attribute].type === 'ordered') {
            // @ts-ignore
            nodeMetadata[attribute].average /= nodeMetadata[attribute].count
        }
        // sort frequencies
        nodeMetadata[attribute].frequencies.sort((a, b) => {return b[1] - a[1]})

        // create frequency dict
        nodeMetadata[attribute].frequencyDict = {}

        nodeMetadata[attribute].frequencies.forEach((freq, i) => {
            nodeMetadata[attribute].frequencyDict[freq[0]] = i
        })
    }

    return nodeMetadata
}

function setData(state: GraphDataState, action: GraphDataReducerAction): GraphDataState {
    if (action.type !== 'set') {
        return state
    }

    switch (action.property) {
        case 'data':
            state.edges.data = action.value.edges

            state.nodes.data = action.value.nodes

            state.directed = false

            state.globals = action.value.globals

            return {...state}
        case 'directed':

            state.directed = action.value

            return {...state}

        default:
            return state
    }
}

export function GraphDataReducer(state: GraphDataState, action: GraphDataReducerAction): GraphDataState {
    var newState
    switch (action.type) {
        case 'set':
            newState = setData(state, action)

            return {...newState,
                nodes: {...newState.nodes,
                    metadata: calculateMetadata(newState.nodes.data)
                },
                edges: {...newState.edges,
                    metadata: calculateMetadata(newState.edges.data)
                }}
        case 'update':
            newState = updateData(state, action)

            return {...newState,
                nodes: {...newState.nodes,
                    metadata: calculateMetadata(newState.nodes.data)
                },
                edges: {...newState.edges,
                    metadata: calculateMetadata(newState.edges.data)
                }}
        default:
            return state
    }
}
