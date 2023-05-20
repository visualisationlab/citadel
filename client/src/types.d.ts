/**
 * Miles van der Lely (12206970), 2022.
 *
 * Declares and exports TS types used in project.
 */
import * as PIXI from 'pixi.js';
export declare module VisGraph {
    export type Colour = [number, number, number];
    export const attributeType: readonly ["LinearMapDate", "LinearMapScalar", "Classify", "None"];
    export type AttributeType = typeof attributeType[number];
    export const marker: readonly ["FillColour", "EdgeColour", "Radius", "Alpha"];
    export type Marker = typeof marker[number];
    export const selectionType: readonly ["Neighbours", "ShortestPath", "Group", "Delete"];
    export type SelectionType = typeof selectionType[number];
    export interface AttributeGetters {
        getFillColour: (id: string, type: 'node' | 'edge') => VisGraph.Colour;
        getEdgeColour: (id: string, type: 'node' | 'edge') => VisGraph.Colour;
        getRadius: (id: string) => number;
        getAlpha: (id: string, type: 'node' | 'edge') => number;
        getLineWidth: (id: string) => number;
    }
    export type MarkerObject = {
        name: string;
        min: number;
        max: number;
        validMaps: AttributeType[];
        selectedMap: AttributeType;
        group: {
            [name: string]: Colour;
        };
        validAttributeNames: string[];
    };
    export type MarkerDict = {
        [name in Marker]: MarkerObject;
    };
    export type ColourDict = {
        [name in Marker]: ColourSettings;
    };
    export type RenderedNode = {
        id: string;
        x: number;
        y: number;
        attributes: {
            [id: string]: any;
        };
        gfx: PIXI.Sprite | null;
        fillColour: number;
        alpha: number;
        radius: number;
        lineWidth: number;
        edgeColour: number;
        selectionState: SelectionState;
    };
    export type GraphSettingsReducerAction = {
        attribute: GraphSettingsAttribute;
        value: number | boolean;
    };
    export type GraphStateReducerAction = {
        type: 'load';
        name: string;
        data: any;
    } | {
        type: 'remove';
        id: string;
    } | {
        type: 'visualize';
        marker: Marker;
        attributeType: AttributeType;
        attribute: string;
    } | {
        type: 'update';
    };
    enum GraphSettingsAttribute {
        Charge = 0,
        RadialForce = 1,
        MaxLinesDrawn = 2,
        MaxCirclesDrawn = 3,
        TickInterval = 4,
        ExtremeLineCulling = 5,
        SmoothScroll = 6,
        DefaultNodeRadius = 7,
        RenderEdges = 8,
        CollideStrength = 9,
        LineOpacity = 10
    }
    export type GraphSettings = {
        charge: number;
        radialForce: number;
        collideStrength: number;
        maxLinesDrawn: number;
        maxCirclesDrawn: number;
        tickInterval: number;
        extremeLineCulling: boolean;
        smoothScroll: boolean;
        defaultNodeRadius: number;
        renderEdges: boolean;
        lineOpacity: number;
    };
    export type GraphDimensions = {
        width: number;
        height: number;
    };
    export type SelectionState = {
        selectedNodeID: string;
        highlightedNodeIDs: string[];
        selectedType: SelectionType;
        shortestPathSource: string;
        message: string;
    };
    export type ColourSettings = {
        colours: Colour[];
        count: number;
    };
    export type AttributeCallback = (id: string) => number;
    export type FillColourCallback = (id: string, colourMap: MarkerObject, colourSettings: ColourSettings) => number;
    export type Transform = {
        x: number;
        y: number;
        k: number;
    };
    export {};
}
