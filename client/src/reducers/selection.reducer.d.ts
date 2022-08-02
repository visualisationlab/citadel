declare type SelectionMode = 'single' | 'multi';
export interface SelectionDataState {
    selectedNodes: string[];
    selectedEdges: string[];
    selectionMode: SelectionMode;
}
declare type AttributeType = 'node' | 'edge';
export declare type SelectionDataReducerAction = {
    type: 'set';
    attribute: AttributeType;
    value: string[];
} | {
    type: 'add';
    attribute: AttributeType;
    value: string;
} | {
    type: 'remove';
    attribute: AttributeType;
    value: string;
} | {
    type: 'reset';
} | {
    type: 'shortClick';
    attribute: AttributeType;
    id: string;
} | {
    type: 'longClick';
    attribute: AttributeType;
    id: string;
};
export declare function SelectionDataReducer(state: SelectionDataState, action: SelectionDataReducerAction): SelectionDataState;
export {};
