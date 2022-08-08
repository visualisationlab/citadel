import cytoscape from 'cytoscape';
import { Session } from './sessions';
export declare module Cyto {
    type AvailableLayout = 'null' | 'random' | 'cose' | 'grid' | 'circle' | 'breadthfirst' | 'cose' | 'fcose' | 'cola' | 'cise' | 'spread' | 'd3-force';
    export type LayoutSetting = {
        name: string;
        description: string;
        type: 'number';
        defaultValue: number;
    } | {
        name: string;
        description: string;
        type: 'boolean';
        defaultValue: boolean;
    };
    export interface LayoutInfo {
        name: AvailableLayout;
        description: string;
        link: string;
        settings: LayoutSetting[];
    }
    export function loadJson(cy: cytoscape.Core | null, nodes: {
        [key: string]: any;
    }[], edges: {
        [key: string]: any;
    }[]): void;
    export function setLayout(cy: cytoscape.Core, settings: Session.LayoutSettings): Promise<unknown>;
    export function getAvailableLayouts(): LayoutInfo[];
    export function addNode(cy: cytoscape.Core, id: string, data: {
        [key: string]: any;
    }, position: {
        x: number;
        y: number;
    } | undefined): void;
    export function addEdge(cy: cytoscape.Core, id: string, source: string, target: string, data: {
        [key: string]: any;
    }): void;
    export function removeElement(cy: cytoscape.Core, id: string): void;
    export function destroyGraph(cy: cytoscape.Core): void;
    export {};
}
