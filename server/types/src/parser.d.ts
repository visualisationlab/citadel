import { ValidationError } from 'jsonschema';
import { Graph } from 'shared';
export declare const graphSchema: {
    $schema: string;
    type: string;
    description: string;
    properties: {
        attributes: {
            type: string;
            properties: {
                edgeType: {
                    type: string;
                };
            };
            required: string[];
        };
        nodes: {
            type: string;
            items: {
                type: string;
                properties: {
                    id: {
                        type: string[];
                    };
                    attributes: {
                        type: string;
                    };
                };
                required: string[];
            };
            minItems: number;
            uniqueItems: boolean;
        };
        edges: {
            type: string;
            items: {
                type: string;
                properties: {
                    source: {
                        type: string[];
                    };
                    target: {
                        type: string[];
                    };
                    attributes: {
                        type: string;
                    };
                    id: {
                        type: string[];
                    };
                };
                required: string[];
            };
            uniqueItems: boolean;
        };
    };
    required: string[];
};
export declare function checkGraph(data: object): Graph.BasicGraph | ValidationError[];
//# sourceMappingURL=parser.d.ts.map