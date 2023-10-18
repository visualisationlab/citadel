export interface CytoGraph {
    elements: {
        nodes: cytoscape.NodeDefinition[],
        edges: cytoscape.EdgeDefinition[]
    },
    data: Record<string, string | number | object>
}