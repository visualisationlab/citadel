/**
 * Miles van der Lely (12206970), 2022.
 *
 * Declares and exports TS types used in project.
 */

import * as PIXI from 'pixi.js'

export module VisGraph {
    export type Shape =
        | 'circle'
        | 'square'
        | 'triangle'
        | 'star'
        | 'line'

    export type Colour = [number, number, number]

    export const attributeType = ['LinearMapDate', 'LinearMapScalar', 'Classify', 'None'] as const
    export type AttributeType = typeof attributeType[number]

    export const marker = ['FillColour', 'EdgeColour', 'Radius', 'Alpha'] as const
    export type Marker = typeof marker[number]

    export const selectionType = ['Neighbours', 'ShortestPath', 'Group', 'Delete'] as const
    export type SelectionType = typeof selectionType[number]

    export interface AttributeGetters {
        getFillColour: (id: string, type: 'node' | 'edge') => VisGraph.Colour,
        getEdgeColour: (id: string, type: 'node' | 'edge') => VisGraph.Colour,
        getRadius: (id: string) => number,
        getAlpha: (id: string, type: 'node' | 'edge') => number,
        getLineWidth: (id: string) => number,
    }

    export type MarkerObject = {
        name: string,
        min: number,
        max: number,
        validMaps: AttributeType[],
        selectedMap: AttributeType,
        group: {[name: string]: Colour},
        validAttributeNames: string[]
    }

    export type NodeDict = { [id: string]: GraphNode}
    export type MarkerDict = {[name in Marker] : MarkerObject}
    export type ColourDict = {[name in Marker] : ColourSettings}

    export type RenderedNode = {
        id: string,
        x: number,
        y: number,
        attributes: { [id: string] : any},
        gfx: PIXI.Sprite | null,
        fillColour: number,
        alpha: number,
        radius: number,
        lineWidth: number,
        edgeColour: number,
        selectionState: SelectionState
    }

    export interface Edge {
        source: string,
        target: string,
        id: string,
        attributes: {[id: string]: any},
        visualAttributes: {
            hue: number,
            saturation: number,
            lightness: number,
            text: string,
            width: number,
            alpha: number,
        }
    }

    export interface HashedEdge extends Edge {
        hash: string
    }

    export interface RenderedEdge extends HashedEdge  {
        sourceNode: GraphNode,
        targetNode: GraphNode,
        gfx: PIXI.Sprite | null,
    }

    export type GraphSettingsReducerAction = {
        attribute: GraphSettingsAttribute,
        value: number | boolean
    }

    export type ColourDictReducerAction =
        | {type: 'updateColour', marker: 'FillColour' | 'EdgeColour', colour: Colour, index: number}
        | {type: 'setCount', marker: 'FillColour' | 'EdgeColour', count: number}

        export type SelectionReducerAction =
        | {type: 'reset'}
        | {type: 'type', value: SelectionType }
        | {type: 'select', node: string, graphState: GraphState}

    export type GraphStateReducerAction =
        | {type: 'load', name: string, data: any}
        | {type: 'remove', id: string}
        | {type: 'visualize', marker: Marker, attributeType: AttributeType, attribute: string}
        | {type: 'update'}

    enum GraphSettingsAttribute {
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

    export type GraphDimensions = {
        width: number,
        height: number
    }

    export type GraphState = {
        selectedGraph: string,
        nodes: GraphNode[],
        nodeDict: NodeDict,
        edges: Edge[],
        nx: any,
        mappings: MarkerDict,
        directed: boolean
    }

    export type SelectionState = {
        selectedNodeID: string,
        highlightedNodeIDs: string[],
        selectedType: SelectionType,
        shortestPathSource: string,
        message: string
    }

    export type ColourSettings = {
        colours: Colour[],
        count: number
    }

    export type AttributeCallback = (id: string) => number

    export type FillColourCallback = (id: string, colourMap: MarkerObject, colourSettings: ColourSettings) => number
    export type EdgeCallback = (edge: Edge, selectionState: SelectionState) => number

    export type AttributeFunctions = {
        getFillColour: FillColourCallback,
        getRadius: AttributeCallback,
        getAlpha: AttributeCallback,
        getLineWidth: AttributeCallback,
        getLineAlpha: EdgeCallback,
        getEdgeColour: AttributeCallback,
        getLineColour: EdgeCallback,
    }

    export type ForceGraphProps = {
        graphState: GraphState,
        graphSettings: GraphSettings,
        onClickHandler: (id: string, selectionState : SelectionState) => void,
        onClickBackground: () => void,
        attributeFunctions: AttributeFunctions,
        setParentRendering: (rendering: boolean) => void,
        rendering: boolean,
        selectionState: SelectionState,
        colourDict: ColourDict
    }

    export type PixiProps = {
        container: Node,
        nodes: GraphNode[],
        edges: Edge[],
        graphSettings: GraphSettings,
        isDirected: boolean,
        onClickHandler: (id: string, selectionState: SelectionState) => void,
        onClickBackground: () => void,
        getFillColour: FillColourCallback,
        attributeFunctions: AttributeFunctions,
        selectionState: SelectionState,
        mappings: MarkerDict,
        colourDict: ColourDict
    }

    export interface GraphNode {
        id: string,
        x: number,
        y: number,
        attributes: { [id: string] : any},
        visualAttributes: {
            hue: number,
            saturation: number,
            lightness: number,
            shape: Shape,
            prevShape: Shape,
            radius: number,
            alpha: number,
            text: string,
            textScale: number,
        }
    }

    export interface HashedGraphNode extends GraphNode {
        hash: string
    }

    export type CytoNode = {
        data: {id: string, [key: string] : any},
        position: {x: number, y: number}
    }

    export type CytoEdge = {
        data: {
            id: string,
            source: string,
            target: string,
            attributes: {
                [key: string] : any
            }
        }
    }

    export type Transform = {
        x: number,
        y: number,
        k: number
    }
}
