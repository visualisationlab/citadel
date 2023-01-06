/**
 * @author Miles van der Lely <m.vanderlely@uva.nl>
 *
 * This file contains the graph data reducer, which is used to store the graph data.
 */
import { VisGraph } from '../types'

import { API } from '../services/api.service'

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
        data: VisGraph.GraphNode[]
        metadata: {[key: string]: MetadataType}
    },
    edges: {
        data: VisGraph.Edge[],
        metadata: {[key: string]: MetadataType}
    }

    directed: boolean
}

export type GraphDataReducerAction =
    | { type: 'set', property: 'data', value: {
        nodes: VisGraph.GraphNode[],
        edges: VisGraph.Edge[]
        directed: boolean
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

    switch (action.object) {
        case 'node':
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

            return {...state}
    }

    return state
}

function calculateMetadata(data: VisGraph.GraphNode[] | VisGraph.Edge[])
    : {[key: string]: MetadataType} {

    let nodeMetadata: {[key: string]: MetadataType} = {}

    for (const node of data) {
        for (const attribute of Object.keys(node.attributes)) {
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

            const value = node.attributes[attribute]

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

    console.log(nodeMetadata)
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

            state.directed = action.value.directed

            return {...state}
        case 'directed':

            state.directed = action.value

            return {...state}
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
    }
}
