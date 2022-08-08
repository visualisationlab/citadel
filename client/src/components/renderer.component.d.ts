/// <reference types="react" />
import { VisGraph } from '../types';
import { SelectionDataReducerAction, SelectionDataState } from "../reducers/selection.reducer";
interface RendererProps {
    container: Node;
    nodes: VisGraph.HashedGraphNode[];
    edges: VisGraph.HashedEdge[];
    directed: boolean;
    selectionState: SelectionDataState | null;
    selectionDispatch: React.Dispatch<SelectionDataReducerAction> | null;
}
export declare function Renderer({ container, nodes, edges, directed, selectionState, selectionDispatch }: RendererProps): {
    destroy: () => void;
};
export {};
