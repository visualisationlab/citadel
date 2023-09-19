interface GraphTemplate {
    nodes: unknown[]
    edges: unknown[]
    attributes?: Record<string, unknown>
}

export function parseBasicGraph(graph: string): GraphTemplate {
    const json = JSON.parse(graph) as GraphTemplate | null

    if (typeof json !== 'object' || json === null) {
        throw new Error('Invalid JSON')
    }

    if (!Array.isArray(json.nodes)) {
        throw new Error('Invalid JSON')
    }

    if (!Array.isArray(json.edges)) {
        throw new Error('Invalid JSON')
    }

    if (json.attributes) {
        if (typeof json.attributes !== 'object') {
            throw new Error('Invalid JSON')
        }

        if (Array.isArray(json.attributes)) {
            throw new Error('Invalid JSON')
        }

        if (Object.keys(json.attributes).length === 0) {
            throw new Error('Invalid JSON')
        }
    }

    return json
}