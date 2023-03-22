/**
 * @author Miles van der Lely <m.vanderlely@uva.nl>
 *
 * This file contains the graph data reducer, which is used to store the graph data.
 */
import { VisGraph } from '../types';
export declare type MetadataType = {
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
        data: VisGraph.GraphNode[];
        metadata: {
            [key: string]: MetadataType;
        };
    };
    edges: {
        data: VisGraph.Edge[];
        metadata: {
            [key: string]: MetadataType;
        };
    };
    directed: boolean;
}
export declare type GraphDataReducerAction = {
    type: 'set';
    property: 'data';
    value: {
        nodes: VisGraph.GraphNode[];
        edges: VisGraph.Edge[];
        directed: boolean;
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
