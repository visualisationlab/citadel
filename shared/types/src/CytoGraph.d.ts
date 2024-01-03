/// <reference types="cytoscape" />
export interface CytoGraph {
    elements: {
        nodes: cytoscape.NodeDefinition[];
        edges: cytoscape.EdgeDefinition[];
    };
    data: Record<string, string | number | object>;
}
//# sourceMappingURL=CytoGraph.d.ts.map