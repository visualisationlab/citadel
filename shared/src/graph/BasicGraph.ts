import { BasicNode } from "./BasicNode";
import { BasicEdge } from "./BasicEdge";

export interface BasicGraph {
    nodes: BasicNode[],
    edges: BasicEdge[],
    globals: Record<string, string | number | object>
}