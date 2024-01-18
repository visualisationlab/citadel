import { ValidationError, Validator } from 'jsonschema'
import { Graph } from 'shared'
import * as Types from 'shared'

const validator = new Validator()

// Parses JSON for use by cytoscape.
function parseJson(
    nodes: Types.BasicNode[],
    edges: Types.BasicEdge[]) {
    return {
        elements: {
            nodes: nodes.map((node) => {
                if (!Object.keys(node).includes('data')) {
                    node['data'] = {}
                }

                if (Object.keys(node).includes('attributes')) {
                    node['data'] = node.attributes
                }

                if (Object.keys(node).includes('id')) {
                    node['data']['id'] = node['id'].toString()
                }

                return node
            }),
            edges: edges.map((edge, index) => {
                // IF edge contains data, edgekeys is data, otherwise just edgekeys
                const edgeData = (edge['data']) ? {...edge['data']} : {...edge}
                const edgeKeys = Object.keys(edgeData)

                if (!Object.keys(edge).includes('data')) {
                    edge['data'] = {}
                }

                if (edgeKeys.includes('attributes')) {
                    edge['data'] = edgeData.attributes
                    edge['attributes'] = {}
                }

                if (edgeKeys.includes('id')) {
                    edge['data']['id'] = edgeData.id.toString()
                }

                if (!edgeKeys.includes('id')) {
                    edge['data']['id'] = `e${index}`
                }

                if (edgeKeys.includes('source')) {
                    edge['data']['source'] = edgeData.source.toString()
                }

                if (edgeKeys.includes('target')) {
                    edge['data']['target'] = edgeData.target.toString()
                }

                return edge
            })
        }
    }
}

function isBasicGraph(val: unknown): asserts val is Types.BasicGraph {
    if (typeof val !== 'object' || val === null) {
        throw new Error('Graph is not an object')
    }

    if (!('nodes' in val)) {
        throw new Error('Graph does not contain nodes')
    }

    if (!('edges' in val)) {
        throw new Error('Graph does not contain edges')
    }

    if (!Array.isArray(val['nodes'])) {
        throw new Error('Graph nodes is not an array')
    }

    if (!Array.isArray(val['edges'])) {
        throw new Error('Graph edges is not an array')
    }

    if (val['nodes'].length === 0) {
        throw new Error('Graph nodes is empty')
    }

    // Graph can have no edges

    val['nodes'].forEach((node, index) => {
        this.isNode(node, index)
    })

    val['edges'].forEach((edge, index) => {
        this.isEdge(edge, index)
    })
}

function isEdge(val: unknown, index: number): asserts val is Types.BasicEdge {
    if (typeof val !== 'object' || val === null) {
        throw new Error(`Edge ${index} is not an object`)
    }

    if (!('id' in val)) {
        throw new Error(`Edge ${index} does not contain id`)
    }

    if (typeof val['id'] !== 'string') {
        throw new Error(`Edge ${index} id is not a string`)
    }

    if (!('source' in val)) {
        throw new Error(`Edge ${index} does not contain source`)
    }

    if (typeof val['source'] !== 'string') {
        throw new Error(`Edge ${index} source is not a string`)
    }

    if (!('target' in val)) {
        throw new Error(`Edge ${index} does not contain target`)
    }

    if (typeof val['target'] !== 'string') {
        throw new Error(`Edge ${index} target is not a string`)
    }
}

function isNode(val: unknown, index: number): asserts val is Types.BasicNode {
    if (typeof val !== 'object' || val === null) {
        throw new Error(`Node ${index} is not an object`)
    }

    if (!('id' in val)) {
        throw new Error(`Node ${index} does not contain id`)
    }

    if (typeof val.id !== 'string') {
        throw new Error(`Node ${index} id is not a string`)
    }

    if (('position' in val)) {
        if (typeof val.position !== 'object' || val.position === null) {
            throw new Error(`Node ${index} position is not an object`)
        }

        if (!('x' in val.position)) {
            throw new Error(`Node ${index} position does not contain x`)
        }

        if (typeof val.position.x !== 'number') {
            throw new Error(`Node ${index} position x is not a number`)
        }

        if (!('y' in val.position)) {
            throw new Error(`Node ${index} position does not contain y`)
        }

        if (typeof val.position.y !== 'number') {
            throw new Error(`Node ${index} position y is not a number`)
        }
    }
}

export const graphSchema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "type": "object",
    "description": "Network data",
    "properties": {
        "attributes": {
            "type": "object",
            "properties": {
                "edgeType": {
                    "type": "string"
                }
            },
            "required": [ "edgeType" ]
        },
        "nodes": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "id": {
                        "type": ["string", "integer"]
                    },
                    "attributes": {
                        "type": "object"
                    }
                },
                "required": ["id"]
            },
            "minItems": 1,
            "uniqueItems": true
        },
        "edges": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "source": {
                        "type": ["string", "integer"]
                    },
                    "target": {
                        "type": ["string", "integer"]
                    },
                    "attributes": {
                        "type": "object"
                    },
                    "id": {
                        "type": ["string", "integer"]
                    }
                },
                "required": ["source", "target", "attributes"]
            },
            "uniqueItems": true
        }
    },
    "required": ["attributes", "nodes", "edges"]
}

export function checkGraph(data: object): Graph.BasicGraph | ValidationError[] {
    const vr = validator.validate(data, graphSchema)

    const f = (_newData: object): _newData is Graph.BasicGraph => {
        return vr.valid
    }

    f(data)

    if (!vr.valid) {
        return vr.errors
    }

    return data as Graph.BasicGraph
}
