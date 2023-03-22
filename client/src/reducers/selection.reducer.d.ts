type SelectionMode = 'single' | 'multi';
export interface SelectionDataState {
    selectedNodes: string[];
    selectedEdges: string[];
    selectionMode: SelectionMode;
}
type AttributeType = 'node' | 'edge';
export type SelectionDataReducerAction = {
    type: 'selection/set';
    payload: {
        attribute: AttributeType;
        value: string[];
    };
} | {
    type: 'selection/added';
    payload: {
        attribute: AttributeType;
        value: string;
    };
} | {
    type: 'selection/removed';
    payload: {
        attribute: AttributeType;
        value: string;
    };
} | {
    type: 'selection/reset';
} | {
    type: 'selection/shortClick';
    payload: {
        attribute: AttributeType;
        id: string;
    };
} | {
    type: 'selection/longClick';
    payload: {
        attribute: AttributeType;
        id: string;
    };
};
export declare function SelectionDataReducer(state: SelectionDataState, action: SelectionDataReducerAction): SelectionDataState;
export {};
