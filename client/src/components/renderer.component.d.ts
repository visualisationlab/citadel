/// <reference types="react" />
import * as PIXI from "pixi.js";
import { SelectionDataReducerAction, SelectionDataState } from "../reducers/selection.reducer";
import { ExtendedNode, ExtendedEdge } from "./preprocess.component";
export interface RenderedEdge extends ExtendedEdge {
    sourceNode: ExtendedNode;
    targetNode: ExtendedNode;
    gfx: PIXI.Sprite | null;
}
interface RendererProps {
    container: Node;
    nodes: ExtendedNode[];
    edges: ExtendedEdge[];
    directed: boolean;
    selectionState: SelectionDataState | null;
    selectionDispatch: React.Dispatch<SelectionDataReducerAction> | null;
}
export declare type EdgeCallback = (edge: ExtendedEdge, selectionState: SelectionDataState) => number;
export declare function Renderer({ container, nodes, edges, directed, selectionState, selectionDispatch }: RendererProps): {
    destroy: () => void;
};
export {};
