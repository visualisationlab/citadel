import { VisGraph } from '../types';
import { Mappings } from '../mappings/module.mappings';
export declare type NodeMapping = 'colour' | 'radius' | 'alpha' | 'shape';
export declare type EdgeMapping = 'colour' | 'width' | 'alpha';
export interface GraphDataState {
    nodes: {
        data: VisGraph.GraphNode[];
        mapping: {
            generators: {
                'colour': {
                    attribute: string;
                    fun: Mappings.MappingFunction;
                    data: Object;
                };
                'radius': {
                    attribute: string;
                    fun: Mappings.MappingFunction;
                    data: Object;
                };
                'alpha': {
                    attribute: string;
                    fun: Mappings.MappingFunction;
                    data: Object;
                };
                'shape': {
                    attribute: string;
                    fun: Mappings.MappingFunction;
                    data: Object;
                };
            };
            settings: {
                'colours': VisGraph.Colour[];
                'minRadius': number;
                'maxRadius': number;
            };
        };
    };
    edges: {
        data: VisGraph.Edge[];
        mapping: {
            generators: {
                'colour': {
                    attribute: string;
                    fun: Mappings.MappingFunction;
                    data: Object;
                };
                'width': {
                    attribute: string;
                    fun: Mappings.MappingFunction;
                    data: Object;
                };
                'alpha': {
                    attribute: string;
                    fun: Mappings.MappingFunction;
                    data: Object;
                };
            };
            settings: {
                'colours': VisGraph.Colour[];
                'minWidth': number;
                'maxWidth': number;
            };
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
    property: 'mapping';
    object: 'node';
    map: NodeMapping;
    fun: Mappings.MappingFunction;
    key: string;
} | {
    type: 'set';
    property: 'mapping';
    object: 'edge';
    map: EdgeMapping;
    fun: Mappings.MappingFunction;
    key: string;
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
