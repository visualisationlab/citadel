

import React, { useState, useEffect, useReducer } from 'react';

// @ts-ignore
import * as jsnx from 'jsnetworkx';
import {utils} from 'pixi.js'
import { isValid, format } from 'date-fns'

import { userService } from '../services/user.service';
import { websocketService } from '../services/websocket.service';
import {ForceGraph} from './forcegraph.component';

import {GraphComponent} from '../types/types';

import './home.component.css'

/**
 * Types: For use.
 */
enum AttributeType {
    LinearMapDate,
    LinearMapScalar,
    Classify,
    None
}

enum Marker {
    FillColour,
    EdgeColour,
    Radius,
    Alpha
}

enum Tabs {
    Analyze,
    Settings
}

type ColourSettings = GraphComponent.ColourSettings;
type GraphState = GraphComponent.GraphState;
type SelectionState = GraphComponent.SelectionState;
type GraphSettings = GraphComponent.GraphSettings;

type MarkerDict = {[name in Marker] : GraphComponent.MarkerObject}
type ColourDict = {[name in Marker] : ColourSettings}

/**
 * Generates a gradient value based on given colour gradient.
 * @param stops Array of colours
 * @param value value between 0-1
 * @returns Colour
 */
function linearGradient(stops: GraphComponent.Colour[], value: number) : GraphComponent.Colour {
    const stopLength = 1 / (stops.length - 1);
    const valueRatio = value / stopLength;
    const stopIndex = Math.floor(valueRatio);

    if (stopIndex === (stops.length - 1)) {
        return stops[stops.length - 1];
    }

    const stopFraction = valueRatio % 1;

    return lerp(stops[stopIndex], stops[stopIndex + 1], stopFraction);
}

/**
 * Lerps between two colours. dev.to/ndesmic/linear-color-gradient
 * @param {Colour} colour0
 * @param {Colour} colour1
 * @param {number} value between 0-1
 * @returns
 */
function lerp(colour0: GraphComponent.Colour, colour1: GraphComponent.Colour, value: number) : GraphComponent.Colour {
    return [
        colour0[0] + (colour1[0] - colour0[0]) * value,
        colour0[1] + (colour1[1] - colour0[1]) * value,
        colour0[2] + (colour1[2] - colour0[2]) * value
    ]
}

/**
 * Generates the home component.
 * @returns JSX element
 */
export default function Home() {
    const [graphDimensions, setGraphDimensions] = useState<GraphComponent.GraphDimensions>({
        width: window.innerWidth,
        height: window.innerHeight - 56
    });

    const [availableGraphs, setAvailableGraphs] = useState<string[]>([]);

    const [selectedTab, setSelectedTab] = useState(Tabs.Analyze);
    const [hideMenu, setHideMenu] = useState(false);
    const [rendering, setRendering] = useState(false);

    function selectionStateReducer(state: SelectionState, action: GraphComponent.SelectionReducerAction) : SelectionState {
        switch (action.type) {
            case "reset":
                return {
                    selectedNodeID: "",
                    highlightedNodeIDs: [],
                    selectedType: state.selectedType,
                    shortestPathSource: "",
                    message: ""
                }
            case "type":
                return {
                    selectedNodeID: "",
                    highlightedNodeIDs: [],
                    selectedType: action.value,
                    shortestPathSource: "",
                    message: ""
                }
            case "select":
                switch (state.selectedType) {
                    case GraphComponent.SelectionType.Neighbours:
                        return {
                            selectedNodeID: action.node,
                            highlightedNodeIDs: action.graphState.nx.neighbors(action.node),
                            selectedType: GraphComponent.SelectionType.Neighbours,
                            shortestPathSource: "",
                            message: "number of neighbors: " + action.graphState.nx.neighbors(action.node).length
                        }
                    case GraphComponent.SelectionType.Delete:

                        break;
                    case GraphComponent.SelectionType.ShortestPath:
                        // Set path source.
                        if (state.shortestPathSource === "") {
                            return {
                                selectedNodeID: action.node,
                                highlightedNodeIDs: [],
                                selectedType: state.selectedType,
                                shortestPathSource: action.node,
                                message: ""
                            }
                        }

                        if (jsnx.hasPath(action.graphState.nx, {source: state.shortestPathSource, target: action.node})) {
                            let shortestPath = jsnx.shortestPath(action.graphState.nx, {source: state.shortestPathSource, target: action.node});
                            let shortestPathLength = jsnx.shortestPathLength(action.graphState.nx, {source: state.shortestPathSource, target: action.node});

                            return {
                                selectedNodeID: action.node,
                                highlightedNodeIDs: shortestPath,
                                selectedType: GraphComponent.SelectionType.ShortestPath,
                                shortestPathSource: "",
                                message: "path length: " + shortestPathLength
                            }
                        }

                        return {
                            selectedNodeID: "",
                            highlightedNodeIDs: [action.node],
                            selectedType: GraphComponent.SelectionType.ShortestPath,
                            shortestPathSource: "",
                            message: "no path from node " + state.shortestPathSource + " to " + action.node,
                        }
                }

            return {
                selectedNodeID: "",
                highlightedNodeIDs: [],
                selectedType: state.selectedType,
                shortestPathSource: "",
                message: ""
            }
        }
    }

    const [selectionState, selectionStateDispatch] = useReducer(selectionStateReducer, {
        selectedNodeID: "",
        highlightedNodeIDs: [],
        selectedType: GraphComponent.SelectionType.Neighbours,
        shortestPathSource: "",
        message: ""
    })

     /**
     * Reducer for GraphSettings state.
     * @param state
     * @param action
     * @returns GraphSettings state
     */
      function graphSettingsReducer(state: GraphSettings, action: GraphComponent.GraphSettingsReducerAction) : GraphSettings {
        switch(action.attribute) {
            case GraphComponent.GraphSettingsAttribute.Charge:
                return {...state, charge: action.value as number};
            case GraphComponent.GraphSettingsAttribute.RadialForce:
                if (action.value < 0) {
                    return state;
                }

                return {...state, radialForce: action.value as number};
            case GraphComponent.GraphSettingsAttribute.MaxLinesDrawn:
                if (action.value < 1 || action.value > 25000) {
                    return state;
                }

                return {...state, maxLinesDrawn: action.value as number};
            case GraphComponent.GraphSettingsAttribute.TickInterval:
                if (action.value < 1 || action.value > 30) {
                    return state;
                }

                return {...state, tickInterval: action.value as number};
            case GraphComponent.GraphSettingsAttribute.ExtremeLineCulling:
                state.extremeLineCulling = action.value as boolean;

                return {...state, extremeLineCulling: action.value as boolean}
            case GraphComponent.GraphSettingsAttribute.SmoothScroll:
                return {...state, smoothScroll: action.value as boolean};
            case GraphComponent.GraphSettingsAttribute.DefaultNodeRadius:
                if (action.value < 8 || action.value > 20) {
                    return state;
                }

                return {...state, defaultNodeRadius: action.value as number};
            case GraphComponent.GraphSettingsAttribute.RenderEdges:
                return {...state, renderEdges: action.value as boolean}
            case GraphComponent.GraphSettingsAttribute.CollideStrength:
                if (action.value < 0 || action.value > 1) {
                    return state;
                }
                return {...state, collideStrength: action.value as number}
            case GraphComponent.GraphSettingsAttribute.LineOpacity:

                if (action.value < 0.01 || action.value > 1) {
                    return state;
                }

                return {...state, lineOpacity: action.value as number}
            default:
                console.log("Unknown graph settings attribute");
        }

        return state;
    }

    const [graphSettings, graphSettingsDispatch] = useReducer(graphSettingsReducer, resetGraphSettings())

    const [serverErrorMessage, setServerErrorMessage] = useState("");

    /**
     * Loads graph from remote with name graphName.
     * @param graphName string
     */
     function loadGraph(graphName : string) {
        websocketService.clearGraphState();

        selectionStateDispatch({type: 'reset'});

        userService.getGraph(graphName).then(
            response => {
                graphStateDispatch({type: 'load', name: graphName, data: response.data})
            },
            error => {
                setServerErrorMessage(error.toString());
            }
        )
    }

    /**
     * Removes ID from node, dict and remote.
     * @param id
     */
     function removeNode(state: GraphState, id: GraphComponent.NodeID) : GraphState {
        const newState = {...state};

        newState.nodes = newState.nodes.filter((node) => {
            return (node.id !== id);
        });

        delete state.nodeDict[id];

        websocketService.deleteNode(id);

        newState.links = state.links.filter((link) => {
            return (link.source.id !== id && link.target.id !== id)
        });

        state.nx.removeNode(id);

        return newState;
    }

    function updateVisualization(   prevMapping : GraphComponent.MarkerObject,
                                    graphState: GraphState,
                                    marker : Marker,
                                    selectedMap : AttributeType,
                                    attributeName : string) : GraphComponent.MarkerObject {
        const mapping = {...prevMapping};

        mapping.name = attributeName;

        if (attributeName === "") {
            mapping.validMaps = [];

            return mapping;
        }

        const supportedMaps = getSupportedMappings(marker).filter(
            e => getValidAttributeTypes(graphState.nodes, attributeName).includes(e));

        if (selectedMap === AttributeType.None && supportedMaps.length > 0) {
            mapping.selectedMap = supportedMaps[0];
        }
        else {
            mapping.selectedMap = selectedMap;
        }

        mapping.validMaps = supportedMaps;

        switch (mapping.selectedMap) {
            case AttributeType.LinearMapDate:
                var minMax = analyzeDate(graphState.nodes, attributeName);

                mapping.min = minMax[0];
                mapping.max = minMax[1];
                break;
            case AttributeType.LinearMapScalar:
                minMax = analyzeScalar(graphState.nodes, attributeName);

                mapping.min = minMax[0];
                mapping.max = minMax[1];
                break;
            case AttributeType.Classify:
                // const colours = visualType.toString() === Marker.FillColour.toString() ? this.state.fillColours : [];
                let colours = colourDict[marker].colours;

                mapping.group = analyzeGroup(graphState.nodes, attributeName, colours);

                break;
        }

        return mapping;
    }

    // CAN HANDLE ALL GRAPH STATE CHANGES (UPDATE, DESTROY ETC.)
    function graphStateReducer(state: GraphState, action: GraphComponent.graphStateReducerAction) : GraphState {
        switch(action.type) {
            case "load":
                // A dict of node information for fast lookup.
                let nodeDict : GraphComponent.NodeDict = {};

                // Stores the data attributes per node.
                let attributeList : string[] = [];

                // Any type because shitty lib doesn't support typescript afaik.
                var nx : any;

                if (action.data.attributes.hasOwnProperty('edgeType')) {
                    if (action.data.attributes.edgeType === "directed") {
                        nx = new jsnx.DiGraph();
                    }
                    else {
                        nx = new jsnx.Graph();
                    }
                }
                else {
                    nx = new jsnx.Graph();
                }

                // A list of node information for simulation.
                const nodeList = action.data.nodes.map((node : GraphComponent.GraphNode) => {
                    nodeDict[node.id] = {
                        x: 0,
                        y: 0,
                        id: node.id,
                        attributes: node.attributes
                    };

                    attributeList = Object.keys(node.attributes);

                    nx.addNode(node.id)

                    return {
                        id: node.id,
                        r: graphSettings.defaultNodeRadius,
                        attributes: node.attributes
                    };
                });

                let links = action.data.edges.map((link : GraphComponent.Link) => {
                    nx.addEdge(link.source, link.target);

                    return {"source": link.source, "target": link.target};
                });

                // Load attributes.
                // For each visual marker, calculate if each attribute is supported.
                let mappings = resetMappings();

                enumKeys(Marker).forEach((marker) => {
                    const supportedMappings = getSupportedMappings(Marker[marker]);

                    const validAttributes = attributeList.filter((attribute) => {
                        return supportedMappings.some(v => getValidAttributeTypes(nodeList, attribute).includes(v))
                    })

                    mappings[Marker[marker]] = {
                        name: "",
                        min: Number.MAX_SAFE_INTEGER,
                        max: Number.MIN_SAFE_INTEGER,
                        validMaps: [],
                        validAttributeNames: validAttributes,
                        selectedMap: AttributeType.None,
                        group: {}
                    };
                })

                return {...state,
                    selectedGraph: action.name,
                    nodes: nodeList,
                    nodeDict: nodeDict,
                    nx: nx,
                    mappings: mappings,
                    links: links,
                    graphType: action.data.attributes.edgeType === "directed" ? GraphComponent.GraphType.Directed : GraphComponent.GraphType.Undirected
                }
            case "remove":
                const newState = removeNode(state, action.id);

                enumKeys(Marker).forEach((marker) => {
                    newState.mappings[Marker[marker]] = updateVisualization(state.mappings[Marker[marker]], newState,
                        Marker[marker], state.mappings[Marker[marker]].selectedMap, state.mappings[Marker[marker]].name);
                })

                return newState;
            case "visualize":
                const newMapping = {...state.mappings};

                newMapping[action.marker] = updateVisualization(state.mappings[action.marker], state, action.marker,
                    action.attributeType, action.attribute);

                return {...state, mappings: newMapping}
            case "update":
                const update = {...state};

                enumKeys(Marker).forEach((marker) => {
                    update.mappings[Marker[marker]] = updateVisualization(state.mappings[Marker[marker]], update,
                        Marker[marker], state.mappings[Marker[marker]].selectedMap, state.mappings[Marker[marker]].name);
                })

                return update;
        }
    }

    const [colourDict, colourDictDispatch] = useReducer(colourDictReducer, resetColourDict());

    const [graphState, graphStateDispatch] = useReducer(graphStateReducer, {
        selectedGraph: "",
        nodes: [],
        nodeDict: {},
        links: [],
        nx: null,
        mappings: resetMappings(),
        graphType: GraphComponent.GraphType.Undirected
    });

    /**
     * Either adds new colour, or changes existing colour.
     */
     function colourDictReducer(state: ColourDict, action : GraphComponent.ColourDictReducerAction) : ColourDict {
        const newState = {...state};

        switch(action.type) {
            case 'setCount':
                if (action.count < 2 || action.count > newState[action.marker].colours.length) {
                    return newState;
                }

                newState[action.marker].count = action.count;

                return newState;
            case 'updateColour':
                if (action.index === newState[action.marker].colours.length) {
                    newState[action.marker].colours.push(action.colour);


                    return newState;
                }

                if (action.index < 0 || action.index > newState[action.marker].colours.length) {
                    return newState;
                }

                newState[action.marker].colours[action.index] = action.colour;


                return newState;
        }
    }

    /**
     * Returns clean mapping dictionary object.
     * @returns mapping dict
     */
     function resetMappings() : MarkerDict {
        return Object.assign({}, ...Object.keys(Marker).map((
            marker) => ({[marker]: {
                name: "",
                min: 0,
                max: 0,
                validMaps: [],
                selectedMap: AttributeType.None,
                group: {},
                validAttributeNames: []
            }})));
    }

    /**
     * Reset colour dict settings.
     * @returns ColourDict
     */
    function resetColourDict() : ColourDict {
        let newColourDict : ColourDict = Object.assign({}, ...Object.keys(Marker).map((
            marker) => ({[marker]: {
                colours: [],
                count: 0
        }})))

        newColourDict[Marker.EdgeColour] = {
            colours: [[0, 0, 1], [0, 1, 0]],
            count: 2
        }

        newColourDict[Marker.FillColour] = {
            colours: [[1, 0, 1], [0, 1, 1]],
            count: 2
        }

        return newColourDict;
    }

    /**
     * Resets graph settings to default.
     * @returns GraphSettings
     */
    function resetGraphSettings() : GraphSettings {
        return {
            charge: -500,
            radialForce: 0,
            collideStrength: 1,
            maxLinesDrawn: 1000,
            maxCirclesDrawn: 1000,
            tickInterval: 1,
            extremeLineCulling: false,
            smoothScroll: true,
            defaultNodeRadius: 8,
            renderEdges: true,
            lineOpacity: 1.0
        }
    }

    /**
     * Runs on startup. Loads new graph.
     */
    useEffect(() => {
        /**
         * Sets window handler.
         */
        window.onresize = () => {
            // Update remote window size.
            websocketService.updateWindowSize(window.innerWidth, window.innerHeight - 56);

            setGraphDimensions({
                width: window.innerWidth,
                height: window.innerHeight - 56
            });
        };

        /**
         * Get graphs from remote, then load graph.
         */
        userService.getGraphs().then(
            response => {
                setAvailableGraphs(response.data);

                loadGraph(response.data[0]);
            },
            error => {
                setServerErrorMessage(error.toString());
            }
        );
    }, []);


    /**
     * Returns min/max values for scalar.
     * @param {GraphComponent.GraphNode[]} nodes
     * @param {string} attributeName
     * @returns [attributeMin, attributeMax]
     */
    function analyzeScalar( nodes : GraphComponent.GraphNode[],
                            attributeName: string) {
        let attributeMin = Number.MAX_SAFE_INTEGER;
        let attributeMax = Number.MIN_SAFE_INTEGER;

        nodes.forEach((node) => {
            const value = node.attributes[attributeName];
            if (attributeMin > value) {
                attributeMin = value;
            }

            if (attributeMax < value) {
                attributeMax = value;
            }
        });

        return [attributeMin, attributeMax];
    }

    function analyzeGroup(  nodes : GraphComponent.GraphNode[],
                            attributeName : string,
                            colourMap : GraphComponent.Colour[]) {
        let attributeGroup : {[group: string] : GraphComponent.Colour} = {};

        let groupIndex = 0;

        nodes.forEach((node) => {
            const value = node.attributes[attributeName];

            if (!Object.keys(attributeGroup).includes(value)) {
                if (value.toString() === "NULL") {
                    attributeGroup[value] = [0, 0, 0];

                    return;
                }

                if (groupIndex < colourMap.length) {
                    attributeGroup[value] = colourMap[groupIndex]
                } else {
                    attributeGroup[value] = [Math.random(),
                        Math.random(), Math.random()];
                }

                groupIndex++;
            }

            return;
        })

        return attributeGroup;
    }

    function analyzeDate(   nodes : GraphComponent.GraphNode[],
                            attributeName : string) {
        let attributeMin = Number.MAX_SAFE_INTEGER;
        let attributeMax = Number.MIN_SAFE_INTEGER;

        nodes.forEach((node) => {
            let dateValue = Date.parse(node.attributes[attributeName])

            if (isNaN(dateValue)) {
                return;
            }

            if (attributeMin === null || attributeMin > dateValue) {
                attributeMin = dateValue;
            }

            if (attributeMax === null || attributeMax < dateValue) {
                attributeMax = dateValue;
            }
        });

        return [attributeMin, attributeMax];
    }

    /**
     * Generates a gradient based on state analyze colours slice.
     * @returns Gradient string
     */
    function generateCSSGradient(   colours : GraphComponent.Colour[],
                                    colourCount : number) {
        const rgbas = colours.slice(0, colourCount).map((colour) => {
            return `rgba(${colour[0] * 255}, ${colour[1]*255},${colour[2]*255})`
        })

        return `linear-gradient(90deg,${rgbas.join(",")})`
    }

    /**
     * Makes the background clickable.
     */
    function onClickBackground() {
        selectionStateDispatch({type: "reset"});
    }

    /**
     * Handles node on click behavior.
     * @param {string} id
     * @returns
     */
    const onNodeClick = function(id : GraphComponent.NodeID) {
        if (selectionState.selectedType === GraphComponent.SelectionType.Delete) {
            graphStateDispatch({type: 'remove', id:id});
        }
        selectionStateDispatch({type: "select", node: id, graphState: graphState});
    }

    /**
     * Gets the node colour for selection.
     * @param {string} id
     * @returns Colour
     */
    function getSelectionColour(id : GraphComponent.NodeID,
                                selectionState : GraphComponent.SelectionState) {
        // If the node is selected.
        if (selectionState.selectedNodeID === id) {
            return 0xFF0000;
        }

        // If the node is highlighted.
        if (selectionState.highlightedNodeIDs.includes(id)) {
            return 0x00FF00;
        }

        return null;
    }

    /**
     * Returns colour based on ID.
     * @param {string} id
     * @returns colour
     */
    function getAnalyzeColour(  id : GraphComponent.NodeID,
                                markerObject : GraphComponent.MarkerObject,
                                colourSettings : ColourSettings) {
        // If id is not in nodeinfo (due to race conditions).
        if (!(id in graphState.nodeDict)) {
            return 0x000000;
        }

        let value = graphState.nodeDict[id].attributes[markerObject.name];

        switch(markerObject.selectedMap) {
            case AttributeType.Classify:
                return utils.rgb2hex(markerObject.group[value as string]);
            case AttributeType.LinearMapDate:
                value = Date.parse(value as string);
            case AttributeType.LinearMapScalar: //eslint-disable-line
                if (isNaN(value as number)) {
                    return 0x000000;
                }

                let min = markerObject.min;
                let max = markerObject.max;

                let finalValue = (value as number - min) / (max - min)

                if (Object.keys(graphState.nodeDict).length < 2) {
                    return 0;
                }

                return utils.rgb2hex(linearGradient(colourSettings.colours.slice(0, Math.min(colourSettings.count, Object.keys(graphState.nodeDict).length)), finalValue));
            default:
                console.log(markerObject.selectedMap)
                console.log("Unknown colour mapping")
                return 0x000000;
        }
    }

    /**
     * Returns the colour based on the node ID and marker type.
     * @param {string} id
     * @returns Color code 0xRRGGBB
     */
    function getColour( id : GraphComponent.NodeID,
                        colourMap : GraphComponent.MarkerObject,
                        colourSettings : ColourSettings) {


        if (colourMap.name === "" ||
            (colourMap.selectedMap === AttributeType.None && colourMap.validMaps.length > 0)) {

            return 0x000000;
        }

        return getAnalyzeColour(id, colourMap, colourSettings);
    }

    function getAlpha(id : GraphComponent.NodeID) {
        const alphaMap = graphState.mappings[Marker.Alpha];

        if (alphaMap.name === "" || !(id in graphState.nodeDict)) {
            return 0.8;
        }

        let value = graphState.nodeDict[id].attributes[alphaMap.name];

        // THIS DOESNT WORK YET
        if (alphaMap.selectedMap === AttributeType.LinearMapDate) {
            let dateValue = Date.parse(value as string);

            if (isNaN(dateValue as number)) {
                dateValue = alphaMap.min;
            }
        }

        let min = alphaMap.min;
        let max = alphaMap.max;

        return (value as number - min) / (max - min)
    }

    function getRadius(id : GraphComponent.NodeID) {
        const radiusMap = graphState.mappings[Marker.Radius];

        const radius = graphSettings.defaultNodeRadius;

        if (radiusMap.name === "" || !(id in graphState.nodeDict)) {
            return radius;
        }

        let value = graphState.nodeDict[id].attributes[radiusMap.name];

        if (radiusMap.selectedMap === AttributeType.LinearMapDate) {
            value = Date.parse(value as string);

            if (isNaN(value as number)) {
                value = radiusMap.min;
            }
        }

        let min = radiusMap.min;
        let max = radiusMap.max;

        return radius + (value as number - min) / (max - min) * 12
    }

    function getLineWidth(id : GraphComponent.NodeID) {
        return 4.0;
    }

    function getLineAlpha(link : GraphComponent.Link, selectionState: SelectionState) {
        if (selectionState.highlightedNodeIDs.length === 0) {
            return 0.4;
        }

        if (selectionState.highlightedNodeIDs.includes(link.source.id) &&
            link.target.id === selectionState.selectedNodeID) {

            return 1.0
        }

        if (selectionState.highlightedNodeIDs.includes(link.target.id) &&
            link.source.id === selectionState.selectedNodeID) {

            return 1.0
        }

        if (selectionState.selectedType === GraphComponent.SelectionType.ShortestPath &&
            selectionState.highlightedNodeIDs.includes(link.source.id) &&
            selectionState.highlightedNodeIDs.includes(link.target.id)) {

            return 1.0
        }

        return 0.1
    }

    function getLineColour(link: GraphComponent.Link, selectionState: SelectionState) {
        if (selectionState.highlightedNodeIDs.length === 0) {
            return 0;
        }

        if (selectionState.highlightedNodeIDs.includes(link.source.id) &&
            link.target.id === selectionState.selectedNodeID) {
            return utils.rgb2hex([0.8, 0.2, 0.0]);
        }

        if (selectionState.highlightedNodeIDs.includes(link.target.id) &&
            link.source.id === selectionState.selectedNodeID) {
            return utils.rgb2hex([0.8, 0.2, 0.0]);
        }

        if (selectionState.selectedType === GraphComponent.SelectionType.ShortestPath &&
            selectionState.highlightedNodeIDs.includes(link.source.id) &&
            selectionState.highlightedNodeIDs.includes(link.target.id)) {

            return utils.rgb2hex([0.8, 0.2, 0.0]);
        }
        return 0;
    }

    /**
     * Gets JSX info about selected node.
     * @returns JSX
     */
    function renderNodeSelected() {
        if (selectionState.selectedNodeID === "" || !Object.keys(graphState.nodeDict).includes(selectionState.selectedNodeID))
            return;

        return (
            <div id="nodeSelected">
                <p>Node ID</p>
                <i>{selectionState.selectedNodeID}</i>
                <hr></hr>
                <p>Node Attributes</p>
                <table>
                    <tbody>
                        {Object.keys(graphState.nodeDict[selectionState.selectedNodeID].attributes).map((key) => {
                            return <tr key={key}><td>{key}</td><td>{graphState.nodeDict[selectionState.selectedNodeID].attributes[key]}</td></tr>
                        })
                        }
                    </tbody>
                </table>
            </div>
        )
    }

    /**
     * Returns an object of valid attribute types.
     * @param {array of nodes} nodes
     * @param {string} attributeName
     * @returns list of valid mappings
     */
     function getValidAttributeTypes(nodes : GraphComponent.GraphNode[], attributeName : string) : AttributeType[] {
        let isDate = false;
        let isGroup = true;
        let isScalar = true;

        let types = [];

        nodes.forEach((node) => {
            let value = node.attributes[attributeName];

            if (isNaN(value)) {
                isScalar = false;
            }

            if (isNaN(value) && isValid(new Date(value))) {
                isDate = true;
            }
        })

        if (isDate) {
            types.push(AttributeType.LinearMapDate);
        }

        if (isGroup) {
            types.push(AttributeType.Classify);
        }

        if (isScalar) {
            types.push(AttributeType.LinearMapScalar);
        }

        return types;
    }

    /**
     * Gets supported AttributeType list.
     * @param {Marker} type
     * @returns list of supported AttributeTypes
     */
    function getSupportedMappings(type : Marker) {
        switch (type) {
            case Marker.Alpha:
                return [AttributeType.LinearMapDate, AttributeType.LinearMapScalar];
            case Marker.EdgeColour:
                return [AttributeType.LinearMapDate, AttributeType.LinearMapScalar, AttributeType.Classify];
            case Marker.FillColour:
                return [AttributeType.LinearMapDate, AttributeType.LinearMapScalar, AttributeType.Classify];
            case Marker.Radius:
                return [AttributeType.LinearMapDate, AttributeType.LinearMapScalar];
            default:
                console.log(`Unsupported mapping ${type}, no attributes available`)
                return []
        }
    }

    // https://stackoverflow.com/questions/56878552/how-to-loop-over-enum-without-values-on-typescript
    /**
     * Returns a list of enum keys.
     * @param obj Enum
     * @returns keys
     */
    function enumKeys<O extends object, K extends keyof O = keyof O>(obj: O): K [] {
        return Object.keys(obj).filter(k => Number.isNaN(+k)) as K[];
    }

    /**
     * Renders a dynamic colour picker.
     * @param colours Colour[]
     * @param marker Marker
     * @returns JSX
     */
    function renderColourPicker(colours : GraphComponent.Colour[],
                                marker : Marker) {
        const colourList = colours.map((colour, i) => {
            return (<div key={'color' + i} className="floatColours">
                Colour {i}
                <input key={'color' + i} type='color' defaultValue={
                    "#" + (Math.floor(colour[0] * 255)).toString(16).padStart(2, '0') +
                    (Math.floor(colour[1] * 255)).toString(16).padStart(2, '0') +
                    (Math.floor(colour[2] * 255)).toString(16).padStart(2, '0')
                } onChange={(e) => {
                    const hexString = e.target.value;

                    const R = parseInt(hexString.slice(1, 3), 16);
                    const G = parseInt(hexString.slice(3, 5), 16);
                    const B = parseInt(hexString.slice(5, 7), 16);

                    switch (marker) {
                        case Marker.FillColour:
                            colourDictDispatch({type: 'updateColour', colour: [R / 255, G / 255, B / 255], index: i, marker: GraphComponent.Marker.FillColour});
                            return;
                        case Marker.EdgeColour:
                            colourDictDispatch({type: 'updateColour', colour: [R / 255, G / 255, B / 255], index: i, marker: GraphComponent.Marker.EdgeColour});
                            return;
                    }
                }}/>
            </div>)
        });

        return (
            <div>
                <p>Colours: </p>
                {colourList}
                <button type='button' onClick={() => {
                    switch (marker) {
                        case Marker.FillColour:
                            colourDictDispatch({type: 'updateColour', colour: [Math.random(),
                                Math.random(), Math.random()], index: colourDict[marker].colours.length, marker: GraphComponent.Marker.FillColour});
                            return;
                        case Marker.EdgeColour:
                            colourDictDispatch({type: 'updateColour', colour: [Math.random(),
                                Math.random(), Math.random()], index: colourDict[marker].colours.length, marker: GraphComponent.Marker.EdgeColour});
                            return;
                    }

                }}>Add new colour</button>
            </div>
        )
    }

    /**
     * Renders settings menu.
     * @returns JSX
     */
    function renderSettingsContents() {
        return (
            <div className="menuContents">
                <p>Center Force</p>
                <div className="d-flex flex-row justify-content-between numericalSetting">
                    <button type="button"
                            className="btn btn-light"
                            onClick={
                                () => graphSettingsDispatch({attribute: GraphComponent.GraphSettingsAttribute.Charge,
                                    value: graphSettings.charge - 100})
                            }>-100</button>
                    <input type="number"
                            size={4}
                            value={graphSettings.charge + 400}
                            onChange={
                                (e) => graphSettingsDispatch({attribute: GraphComponent.GraphSettingsAttribute.Charge,
                                    value: parseInt(e.target.value) - 400})
                        }/>
                    <button type="button"
                            className="btn btn-light"
                            onClick={
                                () => graphSettingsDispatch({attribute: GraphComponent.GraphSettingsAttribute.Charge,
                                    value: graphSettings.charge + 100})}>+100</button>
                </div>
                <hr></hr>
                <p>Collide Strength</p>
                <div className="d-flex flex-row justify-content-between numericalSetting">
                    <button type="button"
                            className="btn btn-light"
                            onClick={() => graphSettingsDispatch({attribute: GraphComponent.GraphSettingsAttribute.CollideStrength,
                                value: graphSettings.collideStrength - 0.1})
                        }>-0.1</button>
                    <input  type="number"
                            min={0}
                            max={1}
                            size={4}
                            value={graphSettings.collideStrength}
                            onChange={(e) => graphSettingsDispatch({attribute: GraphComponent.GraphSettingsAttribute.CollideStrength,
                                value: parseInt(e.target.value)})
                    }/>
                    <button type="button"
                            className="btn btn-light"
                            onClick={() => graphSettingsDispatch({attribute: GraphComponent.GraphSettingsAttribute.CollideStrength,
                                value: graphSettings.collideStrength + 0.1})
                            }>+0.1</button>
                </div>
                <hr></hr>
                <p>Radial Force</p>
                <div className="d-flex flex-row justify-content-between numericalSetting">
                    <button type="button"
                            className="btn btn-light"
                            onClick={() => graphSettingsDispatch({attribute: GraphComponent.GraphSettingsAttribute.RadialForce,
                                value: graphSettings.radialForce - 500})}>-500</button>
                    <input  type="number"
                            min={0}
                            max={1000}
                            size={4}
                            value={graphSettings.radialForce}
                            onChange={(e) => graphSettingsDispatch({attribute: GraphComponent.GraphSettingsAttribute.RadialForce,
                                value: parseInt(e.target.value)})
                    }>
                    </input>
                    <button type="button"
                            className="btn btn-light"
                            onClick={() => graphSettingsDispatch({attribute: GraphComponent.GraphSettingsAttribute.RadialForce,
                                value: graphSettings.radialForce + 500})}>+500</button>

                </div>
                <hr></hr>
                <p>Node Radius</p>
                <div className="d-flex flex-row justify-content-between numericalSetting">
                    <button type="button"
                            className="btn btn-light"
                            onClick={() => graphSettingsDispatch({attribute: GraphComponent.GraphSettingsAttribute.DefaultNodeRadius,
                                value: graphSettings.defaultNodeRadius - 1})}>-1</button>
                    <input type="range" min="3" max="20" className="slider" size={4} value={graphSettings.defaultNodeRadius}
                    onChange={(e) => graphSettingsDispatch({attribute: GraphComponent.GraphSettingsAttribute.DefaultNodeRadius,
                        value: parseInt(e.target.value)})
                    }>
                    </input>
                    <button type="button" className="btn btn-light" onClick={() => graphSettingsDispatch({attribute: GraphComponent.GraphSettingsAttribute.DefaultNodeRadius,
                                value: graphSettings.defaultNodeRadius + 1})}>+1</button>
                </div>
                <p>Line Opacity</p>
                <div className="d-flex flex-row justify-content-between numericalSetting">
                    <button type="button"
                            className="btn btn-light"
                            onClick={() => graphSettingsDispatch({attribute: GraphComponent.GraphSettingsAttribute.LineOpacity,
                                value: graphSettings.lineOpacity - 0.05})}>-0.05</button>
                    <input type="range" min={0.01} step={0.1} max={1} className="slider" value={graphSettings.lineOpacity}
                    onChange={(e) => graphSettingsDispatch({attribute: GraphComponent.GraphSettingsAttribute.LineOpacity,
                        value: parseFloat(e.target.value)})
                    }>
                    </input>
                    <button type="button" className="btn btn-light" onClick={() => graphSettingsDispatch({attribute: GraphComponent.GraphSettingsAttribute.LineOpacity,
                                value: graphSettings.lineOpacity + 0.05})}>+0.05</button>
                </div>
                <hr></hr>
                <p>Selected Graph</p>
                <select value={graphState.selectedGraph}
                    onChange={(e) => {loadGraph(e.target.value)}}>
                    {availableGraphs.map((item) => {
                    return (
                        <option key={item + "option"} value={item}>{item} </option>
                    )
                    })}
                </select>
                <button type="button" className="btn btn-light" onClick={() => loadGraph(graphState.selectedGraph)}>Reload</button>
                <hr></hr>
                <p>Headset Connection</p>
                <p><i>session ID: {websocketService.sessionID}</i></p>
                <hr></hr>
                <p>Render Settings</p>
                <p>Number of Nodes: {graphState.nodes.length}</p>
                <p>Number of Edges: {graphState.links.length}</p>
                <p>Fancy Scroll: <input type="checkbox" checked={graphSettings.smoothScroll}
                    onChange={() =>
                        graphSettingsDispatch({attribute: GraphComponent.GraphSettingsAttribute.SmoothScroll,
                                value: !graphSettings.smoothScroll})}></input></p>
                <p>Tick interval: <input type="number" min="1" max="10" size={1} value={graphSettings.tickInterval}
                    onChange={(e) =>
                        graphSettingsDispatch({attribute: GraphComponent.GraphSettingsAttribute.TickInterval,
                                value: parseInt(e.target.value)})
                    }></input></p>
                <div className="d-flex flex-row justify-content-between numericalSetting">
                    Max Lines Drawn: <input type="number" min="50" max="25000" size={5} value={graphSettings.maxLinesDrawn}
                    onChange={(e) => graphSettingsDispatch({attribute: GraphComponent.GraphSettingsAttribute.MaxLinesDrawn,
                        value: parseInt(e.target.value)})
                    }></input>
                    Max Nodes Drawn: <input type="number" min="10" max="25000" size={5} value={graphSettings.maxCirclesDrawn}
                    onChange={(e) => graphSettingsDispatch({attribute: GraphComponent.GraphSettingsAttribute.MaxCirclesDrawn,
                        value: parseInt(e.target.value)})
                    }></input>

                </div>
                Extreme Edge Culling: <input type="checkbox"
                    defaultChecked={graphSettings.extremeLineCulling}
                    onChange={() => graphSettingsDispatch({attribute: GraphComponent.GraphSettingsAttribute.ExtremeLineCulling,
                        value: !graphSettings.extremeLineCulling})
                    }></input>
                <hr></hr>
                Render Edges: <input type="checkbox" defaultChecked={graphSettings.renderEdges}
                    onChange={() => graphSettingsDispatch({attribute: GraphComponent.GraphSettingsAttribute.RenderEdges,
                            value: !graphSettings.renderEdges})
                    }></input>
                <hr></hr>
                <hr></hr>
                <p>Window width: {graphDimensions.width}</p>
                <p>Window height: {graphDimensions.height}</p>
            </div>
        )
    }

    function renderInfoContents() {
        return (
            <div className="infoContents">
                <div className="float">
                    Selection Mode

                    <select value={selectionState.selectedType}
                        onChange={(e) => {
                            selectionStateDispatch({type: "type", value: +e.target.value})
                        }}>
                        <option value={GraphComponent.SelectionType.Neighbours}>Neighbors</option>
                        <option value={GraphComponent.SelectionType.ShortestPath}>Shortest path</option>

                        <option value={GraphComponent.SelectionType.Delete}>Delete</option>
                    </select>
                </div>
                <div>
                    <hr></hr>
                    {renderNodeSelected()}
                </div>
            </div>
        )
    }

    function renderMenuContents() {
        if (serverErrorMessage !== "") {
            return (
                <div>

                <div id="errorInfo">
                    <p>{serverErrorMessage}</p>
                    <hr></hr>
                </div>
                </div>
            )
        }

        switch (selectedTab) {
            case Tabs.Settings:
                return renderSettingsContents();
            case Tabs.Analyze:
                return renderAnalyzeContents();
        }
    }

    function renderMappingList() {
        return enumKeys(Marker).map((marker) => {
            const mapping = graphState.mappings[Marker[marker]]

            return (
                <td>
                    {mapping.validMaps.length > 0 &&
                        <select key={marker + "select"}
                            style={{width:'100%'}}
                            value={mapping.selectedMap}
                            onChange={(e) => graphStateDispatch({type: 'visualize', marker: Marker[marker],
                                attributeType: +e.target.value, attribute: mapping.name})}>
                                {mapping.validMaps.map((map) => {
                                    return <option key={AttributeType[map]} value={map}>{AttributeType[map]}</option>
                                })}
                        </select>
                    }
                </td>
            )
        })
    }

    function renderAnalysisDropdown() {
        return enumKeys(Marker).map((type) => {
            return (
                <td>
                    <select key={type}
                        value={graphState.mappings[Marker[type]].name}
                        onChange={(e) => graphStateDispatch({type: 'visualize', marker: Marker[type],
                                attributeType: AttributeType.None, attribute: e.target.value})}
                        >
                        {graphState.mappings[Marker[type]].validAttributeNames.map((value) => {
                            return <option key={value} value={value}>{value}</option>
                        })}
                        <option key="none" value="">none</option>
                    </select>
                </td>
            )
        });
    }

    function renderAnalysisMatrix() {
        return (
            <div>
                <table className="analysisMatrix">
                    <tbody>
                        <tr>
                            <th></th>
                            {enumKeys(Marker).map((type) => {

                                return (
                                    <th>{type}</th>
                                )
                            })}
                        </tr>
                        <tr>
                            <td>Node mapping: </td>
                            {renderAnalysisDropdown()}
                        </tr>
                        <tr>
                            <td>Visual Mapping:</td>
                            {renderMappingList()}
                        </tr>
                        <tr>
                        <td>

                        <hr></hr>
                        </td>
                        </tr>
                        <tr>
                            <td>Edge Mapping:</td>
                        </tr>
                    </tbody>
                </table>
                <hr></hr>
            </div>
        )
    }

    function renderColourSettings(marker : Marker) {
        const mapInfo = graphState.mappings[marker];

        if (mapInfo.name === "") {
            return <div></div>
        }

        const gradientComponent = (
            <div style={{
                borderRadius: "4px",
                width:"100%",
                height:"1em",
                background: generateCSSGradient(colourDict[marker].colours,
                    colourDict[marker].count)
            }}></div>
        )

        let visComponent = <div/>

        switch (mapInfo.selectedMap) {
            case AttributeType.LinearMapDate:
            case AttributeType.LinearMapScalar:
                visComponent = (
                    <div>
                        {gradientComponent}
                        {mapInfo.selectedMap === AttributeType.LinearMapDate && isValid(new Date(mapInfo.min))
                            ? format(new Date(mapInfo.min), 'MM/dd/yyyy') : mapInfo.min}
                        <div style={{
                            float:"right"
                        }}>

                        {mapInfo.selectedMap === AttributeType.LinearMapDate && isValid(new Date(mapInfo.max))
                            ? format(new Date(mapInfo.max), 'MM/dd/yyyy') : mapInfo.max}
                        </div>
                    </div>
                )
                break;
            case AttributeType.Classify:
                visComponent = (
                    <div>
                        {Object.keys(mapInfo.group).map((key) => {
                            let value = mapInfo.group[key]

                            return (
                                <div key={key + "divstyle"} style={{
                                    display:"flex"
                                }}>
                                    {key}:<div style={{
                                        marginLeft:"1em",
                                        marginTop:"3px",
                                        borderRadius: "4px",
                                        display:"flex",
                                        width:"1em",
                                        height:"1em",
                                        backgroundColor: "rgba(" + value[0] * 255
                                            + "," + value[1] * 255 + "," + value[2] * 255 + ")"
                                    }}>

                                    </div>
                                </div>
                            )
                        })}
                        <button type='button' onClick={() => {
                            graphStateDispatch({type: 'update'})
                        }}>Update Group Colouring</button>
                    </div>
                )
                break;
            default:
                break;
        }

        const colourSettingsRender = (
            <div>
                {renderColourPicker(colourDict[marker].colours, marker)}
                Gradient colour count:
                <input type="number" min="2" max={colourDict[marker].colours.length}
                    value={colourDict[marker].count}
                    onChange={(e) => {

                    const value = parseInt(e.target.value)

                    switch (marker) {
                        case Marker.FillColour:
                            colourDictDispatch({type: 'setCount', marker: Marker.FillColour, count: value})
                            break;
                        case Marker.EdgeColour:
                            colourDictDispatch({type: 'setCount', marker: Marker.EdgeColour, count: value})
                            break;
                    }
                }}></input>
                <button type="button" onClick={() => {
                    const value = colourDict[marker].count + 1;

                    switch (marker) {
                        case Marker.FillColour:
                            colourDictDispatch({type: 'setCount', marker: Marker.FillColour, count: value})
                            break;
                        case Marker.EdgeColour:
                            colourDictDispatch({type: 'setCount', marker: Marker.EdgeColour, count: value})
                            break;
                    }
                }}>+1</button>
                <button type="button" onClick={(e) => {
                    const value = colourDict[marker].count - 1;

                    switch (marker) {
                        case Marker.FillColour:
                            colourDictDispatch({type: 'setCount', marker: Marker.FillColour, count: value})
                            break;
                        case Marker.EdgeColour:
                            colourDictDispatch({type: 'setCount', marker: Marker.EdgeColour, count: value})
                            break;
                    }
                }}>-1</button>
            </div>
        )

        return (
        <div>
            <p>Fill Colour Settings</p>
            {visComponent}
            {colourSettingsRender}
            <hr></hr>
        </div>
    )
    }

    function renderRadiusSettings() {
        const radiusMap = graphState.mappings[Marker.Radius];

        if (radiusMap.name === "") {
            return <div></div>
        }

        const minValue = radiusMap.selectedMap === AttributeType.LinearMapDate && isValid(new Date(radiusMap.min))
            ? new Date(radiusMap.min) : radiusMap.min

        const maxValue = radiusMap.selectedMap === AttributeType.LinearMapDate && isValid(new Date(radiusMap.max))
            ? new Date(radiusMap.max) : radiusMap.max

        const minDot = (
            <span style={{
                width: graphSettings.defaultNodeRadius + (0) / (maxValue as number - (minValue as number)) * 12 + 4,
                height: graphSettings.defaultNodeRadius + (0) / ((maxValue as number) - (minValue as number)) * 12 + 4,
                borderRadius: '50%',
                display: 'inline-block',
                backgroundColor: 'black'
            }}></span>
        )

        const maxDot = (
            <span style={{
                width: graphSettings.defaultNodeRadius + (maxValue as number) / (maxValue as number - (minValue as number)) * 12 + 4,
                height: graphSettings.defaultNodeRadius + (maxValue as number) / (maxValue as number - (minValue as number)) * 12 + 4,
                borderRadius: '50%',
                display: 'inline-block',
                backgroundColor: 'black'
            }}></span>
        )

        const minMaxComponent = (
            <div>
                {minDot}:
                {radiusMap.selectedMap === AttributeType.LinearMapDate && isValid(new Date(radiusMap.min))
                    ? format(new Date(radiusMap.min), 'MM/dd/yyyy') : radiusMap.min}

                <p></p>
                {maxDot}:
                {radiusMap.selectedMap === AttributeType.LinearMapDate && isValid(new Date(radiusMap.max))
                    ? format(new Date(radiusMap.max), 'MM/dd/yyyy') : radiusMap.max}
            </div>
        )



        return (
        <div>
            <p>Radius Settings</p>
            {minMaxComponent}
            <hr></hr>
        </div>
    )
    }

    function renderAlphaSettings() {
        const alphaMap = graphState.mappings[Marker.Alpha];

        if (alphaMap.name === "") {
            return <div></div>
        }

        const gradientComponent = (
            <div style={{
                borderRadius: "4px",
                width:"100%",
                height:"1em",
                background: generateCSSGradient([[1,1,1], [0,0,0]], 2)
            }}></div>
        )

        const minMaxComponent = alphaMap.selectedMap === AttributeType.Classify ? <div></div> : (
            <div>
                {gradientComponent}
                {alphaMap.selectedMap === AttributeType.LinearMapDate && isValid(new Date(alphaMap.min))
                    ? format(new Date(alphaMap.min), 'MM/dd/yyyy') : alphaMap.min}
                <div style={{
                    float:"right"
                }}>

                {alphaMap.selectedMap === AttributeType.LinearMapDate && isValid(new Date(alphaMap.max))
                    ? format(new Date(alphaMap.max), 'MM/dd/yyyy') : alphaMap.max}
                </div>
            </div>
        )


        return (
        <div>
            <p>Alpha Settings</p>
            {minMaxComponent}
            <hr></hr>
        </div>
    )
    }

    /**
     * Renders analyze tab contents.
     * @returns JSX
     */
    function renderAnalyzeContents() {
        return (
            <div className="menuContents">
                <p>Graph type: {GraphComponent.GraphType[graphState.graphType]}</p>
                <hr></hr>
                {renderAnalysisMatrix()}
                {renderColourSettings(Marker.FillColour)}
                {renderColourSettings(Marker.EdgeColour)}
                {renderRadiusSettings()}
                {renderAlphaSettings()}
            </div>
        )
    }

    /**
     * Renders tab.
     * @param tab Tabs
     * @returns JSX
     */
    function renderTab(tab : Tabs) {
        return (
            <li className={"nav-item " + (selectedTab === tab ? "tabsActive" : "tabsInactive")}>
                <div className="nav-link" onClick={() => {
                    setSelectedTab(tab);
                }}>{Tabs[tab]}</div>
            </li>
        )
    }

    /**
     * Renders the hide button.
     * @returns JSX
     */
    function renderHideButton() {
        return (
            <li className={"nav-item " + (!hideMenu ? "tabsActive" : "tabsInactive")}>
                <div className="nav-link" onClick={() => {
                    setHideMenu(!hideMenu);
                }}>{hideMenu ? "show" : "hide"}</div>
            </li>
        )
    }

    /**
     * Renders the menu.
     * @returns JSX
     */
    function renderMenu() {
        return  (
            <div id="menu">
                <div id="tabs">
                    <ul className="nav">
                    {renderTab(Tabs.Analyze)}
                    {renderTab(Tabs.Settings)}
                    {renderHideButton()}
                    </ul>
                </div>
                <div className="graphState">
                    {!hideMenu && renderMenuContents()}
                    {rendering &&
                        <div>
                            <hr></hr>
                            <p>Rendering...</p>
                        </div>
                    }
                    {selectionState.message !== "" &&
                        <div>
                            <hr></hr>
                            <p><i>{selectionState.message !== "" ? selectionState.message : "no message"}</i></p>
                        </div>
                    }
                </div>
            </div>
        )
    }

    return (
        <div className="heightClass">
            <header className="jumbotron">
                {/* <div id="cy"></div> */}
                {renderMenu()}
                {renderInfoContents()}
                    <div className="heightClass">
                        {graphState.nodes.length > 0 &&
                        <ForceGraph
                            key="forceGraph"
                            graphState = {graphState}
                            graphSettings = {graphSettings}
                            onClickHandler = {onNodeClick}
                            getFillColour = {getColour}
                            getRadius = {getRadius}
                            getAlpha = {getAlpha}
                            getLineWidth = {getLineWidth}
                            getLineAlpha = {getLineAlpha}
                            getEdgeColour = {(id : GraphComponent.NodeID) => {return getColour(id, graphState.mappings[Marker.EdgeColour], colourDict[Marker.EdgeColour])}}
                            getLineColour = {getLineColour}
                            onClickBackground = {onClickBackground}
                            setParentRendering = {setRendering}
                            rendering = {rendering}
                            selectionState = {selectionState}
                            colourDict = {colourDict}
                            />
                        }
                    </div>
            </header>
        </div>
    );
}
