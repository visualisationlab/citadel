/**
 * Miles van der Lely (12206970), 2022.
 *
 * Declares and exports TS types used in project.
 */

import * as PIXI from 'pixi.js'

export module GraphComponent {
    export enum AttributeType {
        LinearMapDate,
        LinearMapScalar,
        Classify,
        None
    }

    export type MarkerObject = {
        name: string,
        min: number,
        max: number,
        validMaps: AttributeType[],
        selectedMap: AttributeType,
        group: {[name: string] : GraphComponent.Colour},
        validAttributeNames: string[]
    }

    export type MarkerDict = {[name in Marker] : MarkerObject}

    export type PixiNode = {
        id: string,
        x: number,
        y: number,
        attributes: { [id: string] : any},
        gfx: PIXI.Graphics | null,
        fillColour: number,
        alpha: number,
        radius: number,
        lineWidth: number,
        edgeColour: number,
        selectionState: SelectionState
    }

    export type Link = {
        source: GraphNode,
        target: GraphNode,
        attributes: Object
    }

    export type GraphSettingsReducerAction = {
        attribute: GraphSettingsAttribute,
        value: number | boolean
    }

    export enum GraphSettingsAttribute {
        Charge,
        RadialForce,
        MaxLinesDrawn,
        MaxCirclesDrawn,
        TickInterval,
        ExtremeLineCulling,
        SmoothScroll,
        DefaultNodeRadius,
        RenderEdges,
        CollideStrength,
        LineOpacity
    }

    export type GraphSettings = {
        charge: number,
        radialForce: number,
        collideStrength: number,
        maxLinesDrawn: number,
        maxCirclesDrawn: number,
        tickInterval: number,
        extremeLineCulling: boolean,
        smoothScroll: boolean,
        defaultNodeRadius: number,
        renderEdges: boolean,
        lineOpacity: number
    }

    export type ColourDict = {[name in Marker] : ColourSettings}

    export type GraphDimensions = {
        width: number,
        height: number
    }

    export type ColourDictReducerAction =
        | {type: 'updateColour', marker: Marker.FillColour | Marker.EdgeColour, colour: Colour, index: number}
        | {type: 'setCount', marker: Marker.FillColour | Marker.EdgeColour, count: number }

    export type SelectionReducerAction =
        | {type: 'reset'}
        | {type: 'type', value: SelectionType }
        | {type: 'select', node: NodeID, graphState: GraphState}

    export type graphStateReducerAction =
        | {type: 'load', name: string, data: any}
        | {type: 'remove', id: NodeID}
        | {type: 'visualize', marker: Marker, attributeType: AttributeType, attribute: string}
        | {type: 'update'}

    export type GraphState = {
        selectedGraph: string,
        nodes: GraphNode[],
        nodeDict: NodeDict,
        links: Link[],
        nx: any,
        mappings: MarkerDict,
        graphType: GraphType
    }

    export enum Marker {
        FillColour,
        EdgeColour,
        Radius,
        Alpha,
    }

    export enum GraphType {
        Directed,
        Undirected
    }

    export type SelectionState = {
        selectedNodeID: GraphComponent.NodeID,
        highlightedNodeIDs: GraphComponent.NodeID[],
        selectedType: SelectionType,
        shortestPathSource: GraphComponent.NodeID,
        message: string
    }

    export type ColourSettings = {
        colours: GraphComponent.Colour[],
        count: number
    }

    export const enum SelectionType {
        Neighbours,
        ShortestPath,
        Group,
        Delete
    }

    export type attributeCallback = (id: NodeID) => number;

    export type fillColourCallback = (id: GraphComponent.NodeID, colourMap: GraphComponent.MarkerObject, colourSettings: GraphComponent.ColourSettings) => number;
    export type linkCallback = (link: Link, selectionState: SelectionState) => number;

    export type ForceGraphProps = {
        graphState: GraphState,
        graphSettings: GraphSettings,
        onClickHandler: (id: NodeID, selectionState : SelectionState) => void,
        onClickBackground: () => void,
        getFillColour: fillColourCallback,
        getRadius: attributeCallback,
        getAlpha: attributeCallback,
        getLineWidth: attributeCallback,
        getLineAlpha: linkCallback,
        getEdgeColour: attributeCallback,
        getLineColour: linkCallback,
        setParentRendering: (rendering: boolean) => void,
        rendering: boolean,
        selectionState: SelectionState,
        colourDict: ColourDict
    }

    export type PixiProps = {
        container: Node,
        nodes: GraphNode[],
        links: Link[],
        graphSettings: GraphSettings,
        isDirected: boolean,
        onClickHandler: (id: NodeID, selectionState: SelectionState) => void,
        onClickBackground: () => void,
        getFillColour: fillColourCallback,
        getRadius: attributeCallback,
        getAlpha: attributeCallback,
        getLineWidth: attributeCallback,
        getLineAlpha: linkCallback,
        getEdgeColour: attributeCallback,
        getLineColour: linkCallback,
        rendering: boolean,
        selectionState: SelectionState,
        mappings: MarkerDict,
        colourDict: ColourDict,
        generating: boolean
    }

    // Called GraphNode because 'Node' refers to 'DOM' Node. Fun bug this was.
    export type GraphNode = {
        id: string,
        x: number,
        y: number,
        attributes: { [id: string] : any}
    }

    export type Transform = {
        x: number,
        y: number,
        k: number
    }

    export type NodeDict = { [id: string]: GraphComponent.GraphNode};

    export type Colour = [number, number, number];

    export type NodeID = string;
}
