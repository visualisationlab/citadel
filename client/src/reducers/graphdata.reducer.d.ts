import { BasicEdge, BasicNode } from '../components/router.component';
export type MetadataType = {
    type: 'ordered';
    dataType: 'number';
    min: number;
    max: number;
    average: number;
    count: number;
    frequencies: [string, number][];
    frequencyDict: {
        [key: string]: number;
    };
} | {
    type: 'categorical';
    frequencies: [string, number][];
    frequencyDict: {
        [key: string]: number;
    };
};
export interface GraphDataState {
    nodes: {
        data: BasicNode[];
        metadata: {
            [key: string]: MetadataType;
        };
    };
    edges: {
        data: BasicEdge[];
        metadata: {
            [key: string]: MetadataType;
        };
    };
    metadata: {
        [key: string]: any;
    };
    directed: boolean;
}
export type GraphDataReducerAction = {
    type: 'set';
    property: 'data';
    value: {
        nodes: BasicNode[];
        edges: BasicEdge[];
        metadata: {
            [key: string]: any;
        };
    };
} | {
    type: 'set';
    property: 'directed';
    value: boolean;
} | {
    type: 'update';
    object: 'node' | 'edge';
    value: {
        id: string;
        attributes: {
            [key: string]: string;
        };
    };
};
export declare function GraphDataReducer(state: GraphDataState, action: GraphDataReducerAction): GraphDataState;
