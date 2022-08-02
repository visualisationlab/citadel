"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
// @ts-ignore
const jsnx = __importStar(require("jsnetworkx"));
const pixi_js_1 = require("pixi.js");
const date_fns_1 = require("date-fns");
const user_service_1 = require("../services/user.service");
const websocket_service_1 = require("../services/websocket.service");
const forcegraph_component_1 = require("./forcegraph.component");
const types_1 = require("../types/types");
require("./home.component.css");
/**
 * Types: For use.
 */
var AttributeType;
(function (AttributeType) {
    AttributeType[AttributeType["LinearMapDate"] = 0] = "LinearMapDate";
    AttributeType[AttributeType["LinearMapScalar"] = 1] = "LinearMapScalar";
    AttributeType[AttributeType["Classify"] = 2] = "Classify";
    AttributeType[AttributeType["None"] = 3] = "None";
})(AttributeType || (AttributeType = {}));
var Marker;
(function (Marker) {
    Marker[Marker["FillColour"] = 0] = "FillColour";
    Marker[Marker["Radius"] = 1] = "Radius";
    Marker[Marker["Alpha"] = 2] = "Alpha";
    Marker[Marker["EdgeColour"] = 3] = "EdgeColour";
})(Marker || (Marker = {}));
var Tabs;
(function (Tabs) {
    Tabs[Tabs["Analyze"] = 0] = "Analyze";
    Tabs[Tabs["Settings"] = 1] = "Settings";
})(Tabs || (Tabs = {}));
/**
 * Generates a gradient value based on given colour gradient.
 * @param stops Array of colours
 * @param value value between 0-1
 * @returns Colour
 */
function linearGradient(stops, value) {
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
function lerp(colour0, colour1, value) {
    return [
        colour0[0] + (colour1[0] - colour0[0]) * value,
        colour0[1] + (colour1[1] - colour0[1]) * value,
        colour0[2] + (colour1[2] - colour0[2]) * value
    ];
}
/**
 * Generates the home component.
 * @returns JSX element
 */
function Home() {
    const [graphDimensions, setGraphDimensions] = (0, react_1.useState)({
        width: window.innerWidth,
        height: window.innerHeight - 56
    });
    const [availableGraphs, setAvailableGraphs] = (0, react_1.useState)([]);
    const [selectedTab, setSelectedTab] = (0, react_1.useState)(Tabs.Analyze);
    const [hideMenu, setHideMenu] = (0, react_1.useState)(false);
    const [rendering, setRendering] = (0, react_1.useState)(false);
    const [selectionState, setSelectionState] = (0, react_1.useState)(resetSelectionState());
    /**
    * Reducer for GraphSettings state.
    * @param state
    * @param action
    * @returns GraphSettings state
    */
    function graphSettingsReducer(state, action) {
        switch (action.attribute) {
            case types_1.GraphComponent.GraphSettingsAttribute.Charge:
                return Object.assign(Object.assign({}, state), { charge: action.value });
            case types_1.GraphComponent.GraphSettingsAttribute.RadialForce:
                if (action.value < 0) {
                    return state;
                }
                return Object.assign(Object.assign({}, state), { radialForce: action.value });
            case types_1.GraphComponent.GraphSettingsAttribute.MaxLinesDrawn:
                if (action.value < 1 || action.value > 25000) {
                    return state;
                }
                return Object.assign(Object.assign({}, state), { maxLinesDrawn: action.value });
            case types_1.GraphComponent.GraphSettingsAttribute.TickInterval:
                if (action.value < 1 || action.value > 30) {
                    return state;
                }
                return Object.assign(Object.assign({}, state), { tickInterval: action.value });
            case types_1.GraphComponent.GraphSettingsAttribute.ExtremeLineCulling:
                state.extremeLineCulling = action.value;
                return Object.assign(Object.assign({}, state), { extremeLineCulling: action.value });
            case types_1.GraphComponent.GraphSettingsAttribute.SmoothScroll:
                return Object.assign(Object.assign({}, state), { smoothScroll: action.value });
            case types_1.GraphComponent.GraphSettingsAttribute.DefaultNodeRadius:
                if (action.value < 8 || action.value > 20) {
                    return state;
                }
                return Object.assign(Object.assign({}, state), { defaultNodeRadius: action.value });
            case types_1.GraphComponent.GraphSettingsAttribute.RenderEdges:
                return Object.assign(Object.assign({}, state), { renderEdges: action.value });
            case types_1.GraphComponent.GraphSettingsAttribute.CollideStrength:
                if (action.value < 0 || action.value > 1) {
                    return state;
                }
                return Object.assign(Object.assign({}, state), { collideStrength: action.value });
            default:
                console.log("Unknown graph settings attribute");
        }
        return state;
    }
    const [graphSettings, graphSettingsDispatch] = (0, react_1.useReducer)(graphSettingsReducer, resetGraphSettings());
    const [serverErrorMessage, setServerErrorMessage] = (0, react_1.useState)("");
    /**
     * Loads graph from remote with name graphName.
     * @param graphName string
     */
    function loadGraph(graphName) {
        websocket_service_1.websocketService.clearGraphState();
        user_service_1.userService.getGraph(graphName).then(response => {
            graphStateDispatch({ type: 'load', name: graphName, data: response.data });
        }, error => {
            setServerErrorMessage(error.toString());
        });
    }
    /**
     * Removes ID from node, dict and remote.
     * @param id
     */
    function removeNode(state, id) {
        const newState = Object.assign({}, state);
        newState.nodes = newState.nodes.filter((node) => {
            return (node.id !== id);
        });
        delete state.nodeDict[id];
        websocket_service_1.websocketService.deleteNode(id);
        newState.links = state.links.filter((link) => {
            return (link.source.id !== id && link.target.id !== id);
        });
        state.nx.removeNode(id);
        return newState;
    }
    function updateVisualization(prevMapping, graphState, marker, selectedMap, attributeName) {
        const mapping = Object.assign({}, prevMapping);
        mapping.name = attributeName;
        if (attributeName === "") {
            mapping.validMaps = [];
            return mapping;
        }
        const supportedMaps = getSupportedMappings(marker).filter(e => getValidAttributeTypes(graphState.nodes, attributeName).includes(e));
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
    function graphStateReducer(state, action) {
        switch (action.type) {
            case "load":
                // A dict of node information for fast lookup.
                let nodeDict = {};
                // Stores the data attributes per node.
                let attributeList = [];
                // Any type because shitty lib doesn't support typescript afaik.
                var nx;
                if (action.data.attributes.edgeType === "directed") {
                    nx = new jsnx.DiGraph();
                }
                else {
                    nx = new jsnx.Graph();
                }
                // A list of node information for simulation.
                const nodeList = action.data.nodes.map((node) => {
                    nodeDict[node.id] = {
                        x: 0,
                        y: 0,
                        id: node.id,
                        attributes: node.attributes
                    };
                    attributeList = Object.keys(node.attributes);
                    nx.addNode(node.id);
                    return {
                        id: node.id,
                        r: graphSettings.defaultNodeRadius,
                        attributes: node.attributes
                    };
                });
                let links = action.data.edges.map((link) => {
                    nx.addEdge(link.source, link.target);
                    return { "source": link.source, "target": link.target };
                });
                // Load attributes.
                // For each visual marker, calculate if each attribute is supported.
                let mappings = resetMappings();
                enumKeys(Marker).forEach((marker) => {
                    const supportedMappings = getSupportedMappings(Marker[marker]);
                    const validAttributes = attributeList.filter((attribute) => {
                        return supportedMappings.some(v => getValidAttributeTypes(nodeList, attribute).includes(v));
                    });
                    mappings[Marker[marker]] = {
                        name: "",
                        min: Number.MAX_SAFE_INTEGER,
                        max: Number.MIN_SAFE_INTEGER,
                        validMaps: [],
                        validAttributeNames: validAttributes,
                        selectedMap: AttributeType.None,
                        group: {}
                    };
                });
                setSelectionState(resetSelectionState());
                return Object.assign(Object.assign({}, state), { selectedGraph: action.name, nodes: nodeList, nodeDict: nodeDict, nx: nx, mappings: mappings, links: links, graphType: action.data.attributes.edgeType === "directed" ? types_1.GraphComponent.GraphType.Directed : types_1.GraphComponent.GraphType.Undirected });
            case "remove":
                const newState = removeNode(state, action.id);
                enumKeys(Marker).forEach((marker) => {
                    newState.mappings[Marker[marker]] = updateVisualization(state.mappings[Marker[marker]], newState, Marker[marker], state.mappings[Marker[marker]].selectedMap, state.mappings[Marker[marker]].name);
                });
                return newState;
            case "visualize":
                const newMapping = Object.assign({}, state.mappings);
                newMapping[action.marker] = updateVisualization(state.mappings[action.marker], state, action.marker, action.attributeType, action.attribute);
                return Object.assign(Object.assign({}, state), { mappings: newMapping });
            case "update":
                const update = Object.assign({}, state);
                enumKeys(Marker).forEach((marker) => {
                    update.mappings[Marker[marker]] = updateVisualization(state.mappings[Marker[marker]], update, Marker[marker], state.mappings[Marker[marker]].selectedMap, state.mappings[Marker[marker]].name);
                });
                return update;
        }
    }
    const [colourDict, colourDictDispatch] = (0, react_1.useReducer)(colourDictReducer, resetColourDict());
    const [graphState, graphStateDispatch] = (0, react_1.useReducer)(graphStateReducer, {
        selectedGraph: "",
        nodes: [],
        nodeDict: {},
        links: [],
        nx: null,
        mappings: resetMappings(),
        graphType: types_1.GraphComponent.GraphType.Undirected
    });
    /**
     * Either adds new colour, or changes existing colour.
     */
    function colourDictReducer(state, action) {
        const newState = Object.assign({}, state);
        switch (action.type) {
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
    function resetMappings() {
        return Object.assign({}, ...Object.keys(Marker).map((marker) => ({ [marker]: {
                name: "",
                min: 0,
                max: 0,
                validMaps: [],
                selectedMap: AttributeType.None,
                group: {},
                validAttributeNames: []
            } })));
    }
    /**
     * Reset colour dict settings.
     * @returns ColourDict
     */
    function resetColourDict() {
        let newColourDict = Object.assign({}, ...Object.keys(Marker).map((marker) => ({ [marker]: {
                colours: [],
                count: 0
            } })));
        newColourDict[Marker.EdgeColour] = {
            colours: [[0, 0, 1], [0, 1, 0]],
            count: 2
        };
        newColourDict[Marker.FillColour] = {
            colours: [[1, 0, 1], [0, 1, 1]],
            count: 2
        };
        return newColourDict;
    }
    /**
     * Resets selection state.
     * @returns SelectionState
     */
    function resetSelectionState() {
        return {
            selectedNodeID: "",
            highlightedNodeIDs: [],
            selectedType: 4 /* None */,
            shortestPathSource: "",
            message: ""
        };
    }
    /**
     * Resets graph settings to default.
     * @returns GraphSettings
     */
    function resetGraphSettings() {
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
            renderEdges: true
        };
    }
    /**
     * Runs on startup. Loads new graph.
     */
    (0, react_1.useEffect)(() => {
        /**
         * Sets window handler.
         */
        window.onresize = () => {
            // Update remote window size.
            websocket_service_1.websocketService.updateWindowSize(window.innerWidth, window.innerHeight - 56);
            setGraphDimensions({
                width: window.innerWidth,
                height: window.innerHeight - 56
            });
        };
        /**
         * Get graphs from remote, then load graph.
         */
        user_service_1.userService.getGraphs().then(response => {
            setAvailableGraphs(response.data);
            loadGraph(response.data[0]);
        }, error => {
            setServerErrorMessage(error.toString());
        });
    }, []);
    /**
     * Returns min/max values for scalar.
     * @param {GraphComponent.GraphNode[]} nodes
     * @param {string} attributeName
     * @returns [attributeMin, attributeMax]
     */
    function analyzeScalar(nodes, attributeName) {
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
    function analyzeGroup(nodes, attributeName, colourMap) {
        let attributeGroup = {};
        let groupIndex = 0;
        nodes.forEach((node) => {
            const value = node.attributes[attributeName];
            if (!Object.keys(attributeGroup).includes(value)) {
                if (value.toString() === "NULL") {
                    attributeGroup[value] = [0, 0, 0];
                    return;
                }
                if (groupIndex < colourMap.length) {
                    attributeGroup[value] = colourMap[groupIndex];
                }
                else {
                    attributeGroup[value] = [Math.random(),
                        Math.random(), Math.random()];
                }
                groupIndex++;
            }
            return;
        });
        return attributeGroup;
    }
    function analyzeDate(nodes, attributeName) {
        let attributeMin = Number.MAX_SAFE_INTEGER;
        let attributeMax = Number.MIN_SAFE_INTEGER;
        nodes.forEach((node) => {
            let dateValue = Date.parse(node.attributes[attributeName]);
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
    function generateCSSGradient(colours, colourCount) {
        const rgbas = colours.slice(0, colourCount).map((colour) => {
            return `rgba(${colour[0] * 255}, ${colour[1] * 255},${colour[2] * 255})`;
        });
        return `linear-gradient(90deg,${rgbas.join(",")})`;
    }
    /**
     * Makes the background clickable.
     */
    function onClickBackground() {
        setSelectionState(resetSelectionState());
    }
    /**
     * Handles node on click behavior. Takes node id.
     * @param {string} id
     * @returns
     */
    const onNodeClick = function (id, selectionState) {
        switch (selectionState.selectedType) {
            case 0 /* Neighbours */:
                setSelectionState({
                    selectedNodeID: id,
                    highlightedNodeIDs: graphState.nx.neighbors(id),
                    selectedType: 0 /* Neighbours */,
                    shortestPathSource: "",
                    message: "number of neighbors: " + graphState.nx.neighbors(id).length
                });
                break;
            case 3 /* Delete */:
                graphStateDispatch({ type: 'remove', id: id });
                break;
            case 1 /* ShortestPath */:
                // Set path source.
                if (selectionState.shortestPathSource === "") {
                    setSelectionState(resetSelectionState());
                    return;
                }
                if (jsnx.hasPath(graphState.nx, { source: selectionState.shortestPathSource, target: id })) {
                    setSelectionState({
                        selectedNodeID: "",
                        highlightedNodeIDs: jsnx.shortestPath(graphState.nx, { source: selectionState.shortestPathSource, target: id }),
                        selectedType: 1 /* ShortestPath */,
                        shortestPathSource: "",
                        message: "path length: " + jsnx.shortestPathLength(graphState.nx, { source: selectionState.shortestPathSource, target: id })
                    });
                    return;
                }
                setSelectionState({
                    selectedNodeID: "",
                    highlightedNodeIDs: [id],
                    selectedType: 1 /* ShortestPath */,
                    shortestPathSource: "",
                    message: "no path from node " + selectionState.shortestPathSource + " to " + id,
                });
                break;
            default:
                console.log("Unknown selection type");
        }
    };
    /**
     * Gets the node colour for selection.
     * @param {string} id
     * @returns Colour
     */
    function getSelectionColour(id, selectionState) {
        // If the node is selected.
        if (selectionState.selectedNodeID === id) {
            return 0xFF0000;
        }
        // If selection type is none.
        if (selectionState.selectedType === 4 /* None */) {
            return 0xFFFFFF;
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
    function getAnalyzeColour(id, markerObject, colourSettings) {
        // If id is not in nodeinfo (due to race conditions).
        if (!(id in graphState.nodeDict)) {
            return 0x000000;
        }
        let value = graphState.nodeDict[id].attributes[markerObject.name];
        switch (markerObject.selectedMap) {
            case AttributeType.Classify:
                return pixi_js_1.utils.rgb2hex(markerObject.group[value]);
            case AttributeType.LinearMapDate:
                value = Date.parse(value);
            case AttributeType.LinearMapScalar: //eslint-disable-line
                if (isNaN(value)) {
                    return 0x000000;
                }
                let min = markerObject.min;
                let max = markerObject.max;
                let finalValue = (value - min) / (max - min);
                return pixi_js_1.utils.rgb2hex(linearGradient(colourSettings.colours.slice(0, colourSettings.count), finalValue));
            default:
                console.log(markerObject.selectedMap);
                console.log("Unknown colour mapping");
                return 0x000000;
        }
    }
    /**
     * Returns the colour based on the node ID and marker type.
     * @param {string} id
     * @returns Color code 0xRRGGBB
     */
    function getColour(id, colourMap, colourSettings) {
        if (colourMap.name === "" ||
            (colourMap.selectedMap === AttributeType.None && colourMap.validMaps.length > 0)) {
            return 0x000000;
        }
        return getAnalyzeColour(id, colourMap, colourSettings);
    }
    function getAlpha(id) {
        const alphaMap = graphState.mappings[Marker.Alpha];
        if (alphaMap.name === "" || !(id in graphState.nodeDict)) {
            return 0.8;
        }
        let value = graphState.nodeDict[id].attributes[alphaMap.name];
        // THIS DOESNT WORK YET
        if (alphaMap.selectedMap === AttributeType.LinearMapDate) {
            let dateValue = Date.parse(value);
            if (isNaN(dateValue)) {
                dateValue = alphaMap.min;
            }
        }
        let min = alphaMap.min;
        let max = alphaMap.max;
        return (value - min) / (max - min);
    }
    function getRadius(id) {
        const radiusMap = graphState.mappings[Marker.Radius];
        const radius = graphSettings.defaultNodeRadius;
        if (radiusMap.name === "" || !(id in graphState.nodeDict)) {
            return radius;
        }
        let value = graphState.nodeDict[id].attributes[radiusMap.name];
        if (radiusMap.selectedMap === AttributeType.LinearMapDate) {
            value = Date.parse(value);
            if (isNaN(value)) {
                value = radiusMap.min;
            }
        }
        let min = radiusMap.min;
        let max = radiusMap.max;
        return radius + (value - min) / (max - min) * 12;
    }
    function getLineWidth(id) {
        return 4.0;
    }
    function getLineAlpha(link) {
        if (selectionState.highlightedNodeIDs.length === 0) {
            return 0.4;
        }
        if (selectionState.highlightedNodeIDs.includes(link.source.id) &&
            link.target.id === selectionState.selectedNodeID) {
            return 0.4;
        }
        if (selectionState.highlightedNodeIDs.includes(link.target.id) &&
            link.source.id === selectionState.selectedNodeID) {
            return 0.4;
        }
        if (selectionState.highlightedNodeIDs.includes(link.source.id) &&
            selectionState.highlightedNodeIDs.includes(link.target.id)) {
            return 0.4;
        }
        return 0.1;
    }
    /**
     * Gets JSX info about selected node.
     * @returns JSX
     */
    function renderNodeSelected() {
        if (selectionState.selectedNodeID === "")
            return;
        return (<div id="nodeSelected">
                <p>Node ID</p>
                <i>{selectionState.selectedNodeID}</i>
                <hr></hr>
                <p>Node Attributes</p>
                <table>
                    <tbody>
                        {Object.keys(graphState.nodeDict[selectionState.selectedNodeID].attributes).map((key) => {
                return <tr key={key}><td>{key}</td><td>{graphState.nodeDict[selectionState.selectedNodeID].attributes[key]}</td></tr>;
            })}
                    </tbody>
                </table>
            </div>);
    }
    /**
     * Returns an object of valid attribute types.
     * @param {array of nodes} nodes
     * @param {string} attributeName
     * @returns list of valid mappings
     */
    function getValidAttributeTypes(nodes, attributeName) {
        let isDate = false;
        let isGroup = true;
        let isScalar = true;
        let types = [];
        nodes.forEach((node) => {
            let value = node.attributes[attributeName];
            if (isNaN(value)) {
                isScalar = false;
            }
            if (isNaN(value) && (0, date_fns_1.isValid)(new Date(value))) {
                isDate = true;
            }
        });
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
    function getSupportedMappings(type) {
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
                console.log(`Unsupported mapping ${type}, no attributes available`);
                return [];
        }
    }
    // https://stackoverflow.com/questions/56878552/how-to-loop-over-enum-without-values-on-typescript
    /**
     * Returns a list of enum keys.
     * @param obj Enum
     * @returns keys
     */
    function enumKeys(obj) {
        return Object.keys(obj).filter(k => Number.isNaN(+k));
    }
    /**
     * Renders a dynamic colour picker.
     * @param colours Colour[]
     * @param marker Marker
     * @returns JSX
     */
    function renderColourPicker(colours, marker) {
        const colourList = colours.map((colour, i) => {
            return (<div key={'color' + i} className="floatColours">
                Colour {i}
                <input key={'color' + i} type='color' defaultValue={"#" + (Math.floor(colour[0] * 255)).toString(16).padStart(2, '0') +
                    (Math.floor(colour[1] * 255)).toString(16).padStart(2, '0') +
                    (Math.floor(colour[2] * 255)).toString(16).padStart(2, '0')} onChange={(e) => {
                    const hexString = e.target.value;
                    const R = parseInt(hexString.slice(1, 3), 16);
                    const G = parseInt(hexString.slice(3, 5), 16);
                    const B = parseInt(hexString.slice(5, 7), 16);
                    switch (marker) {
                        case Marker.FillColour:
                            colourDictDispatch({ type: 'updateColour', colour: [R / 255, G / 255, B / 255], index: i, marker: types_1.GraphComponent.Marker.FillColour });
                            return;
                        case Marker.EdgeColour:
                            colourDictDispatch({ type: 'updateColour', colour: [R, G, B], index: i, marker: types_1.GraphComponent.Marker.EdgeColour });
                            return;
                    }
                }}/>
            </div>);
        });
        return (<div>
                <p>Colours: </p>
                {colourList}
                <button type='button' onClick={() => {
                switch (marker) {
                    case Marker.FillColour:
                        colourDictDispatch({ type: 'updateColour', colour: [Math.random(),
                                Math.random(), Math.random()], index: colourDict[marker].colours.length, marker: types_1.GraphComponent.Marker.FillColour });
                        return;
                    case Marker.EdgeColour:
                        colourDictDispatch({ type: 'updateColour', colour: [Math.random(),
                                Math.random(), Math.random()], index: colourDict[marker].colours.length, marker: types_1.GraphComponent.Marker.EdgeColour });
                        return;
                }
            }}>Add new colour</button>
            </div>);
    }
    /**
     * Renders settings menu.
     * @returns JSX
     */
    function renderSettingsContents() {
        return (<div className="menuContents">
                <p>Center Force</p>
                <div className="d-flex flex-row justify-content-between numericalSetting">
                    <button type="button" className="btn btn-light" onClick={() => graphSettingsDispatch({ attribute: types_1.GraphComponent.GraphSettingsAttribute.Charge,
                value: graphSettings.charge - 100 })}>-100</button>
                    <input type="number" size={4} value={graphSettings.charge + 400} onChange={(e) => graphSettingsDispatch({ attribute: types_1.GraphComponent.GraphSettingsAttribute.Charge,
                value: parseInt(e.target.value) - 400 })}/>
                    <button type="button" className="btn btn-light" onClick={() => graphSettingsDispatch({ attribute: types_1.GraphComponent.GraphSettingsAttribute.Charge,
                value: graphSettings.charge + 100 })}>+100</button>
                </div>
                <hr></hr>
                <p>Collide Strength</p>
                <div className="d-flex flex-row justify-content-between numericalSetting">
                    <button type="button" className="btn btn-light" onClick={() => graphSettingsDispatch({ attribute: types_1.GraphComponent.GraphSettingsAttribute.CollideStrength,
                value: graphSettings.collideStrength - 0.1 })}>-0.1</button>
                    <input type="number" min={0} max={1} size={4} value={graphSettings.collideStrength} onChange={(e) => graphSettingsDispatch({ attribute: types_1.GraphComponent.GraphSettingsAttribute.CollideStrength,
                value: parseInt(e.target.value) })}/>
                    <button type="button" className="btn btn-light" onClick={() => graphSettingsDispatch({ attribute: types_1.GraphComponent.GraphSettingsAttribute.CollideStrength,
                value: graphSettings.collideStrength + 0.1 })}>+0.1</button>
                </div>
                <hr></hr>
                <p>Radial Force</p>
                <div className="d-flex flex-row justify-content-between numericalSetting">
                    <button type="button" className="btn btn-light" onClick={() => graphSettingsDispatch({ attribute: types_1.GraphComponent.GraphSettingsAttribute.RadialForce,
                value: graphSettings.radialForce - 500 })}>-500</button>
                    <input type="number" min={0} max={1000} size={4} value={graphSettings.radialForce} onChange={(e) => graphSettingsDispatch({ attribute: types_1.GraphComponent.GraphSettingsAttribute.RadialForce,
                value: parseInt(e.target.value) })}>
                    </input>
                    <button type="button" className="btn btn-light" onClick={() => graphSettingsDispatch({ attribute: types_1.GraphComponent.GraphSettingsAttribute.RadialForce,
                value: graphSettings.radialForce + 500 })}>+500</button>

                </div>
                <hr></hr>
                <p>Node Radius</p>
                <div className="d-flex flex-row justify-content-between numericalSetting">
                    <button type="button" className="btn btn-light" onClick={() => graphSettingsDispatch({ attribute: types_1.GraphComponent.GraphSettingsAttribute.DefaultNodeRadius,
                value: graphSettings.defaultNodeRadius - 1 })}>-1</button>
                    <input type="range" min="3" max="20" className="slider" size={4} value={graphSettings.defaultNodeRadius} onChange={(e) => graphSettingsDispatch({ attribute: types_1.GraphComponent.GraphSettingsAttribute.DefaultNodeRadius,
                value: parseInt(e.target.value) })}>
                    </input>
                    <button type="button" className="btn btn-light" onClick={() => graphSettingsDispatch({ attribute: types_1.GraphComponent.GraphSettingsAttribute.DefaultNodeRadius,
                value: graphSettings.defaultNodeRadius + 1 })}>+1</button>
                </div>
                <hr></hr>
                <p>Selected Graph</p>
                <select value={graphState.selectedGraph} onChange={(e) => { loadGraph(e.target.value); }}>
                    {availableGraphs.map((item) => {
                return (<option key={item + "option"} value={item}>{item} </option>);
            })}
                </select>
                <button type="button" className="btn btn-light" onClick={() => loadGraph(graphState.selectedGraph)}>Reload</button>
                <hr></hr>
                {/* <p>Headset Connection</p>
            <p><i>{this.state.headsetStatus}, session ID: {websocketService.sessionID}</i></p>
            <hr></hr> */}
                <p>Render Settings</p>
                <p>Number of Nodes: {graphState.nodes.length}</p>
                <p>Number of Edges: {graphState.links.length}</p>
                <p>Fancy Scroll: <input type="checkbox" checked={graphSettings.smoothScroll} onChange={() => graphSettingsDispatch({ attribute: types_1.GraphComponent.GraphSettingsAttribute.SmoothScroll,
                value: !graphSettings.smoothScroll })}></input></p>
                <p>Tick interval: <input type="number" min="1" max="10" size={1} value={graphSettings.tickInterval} onChange={(e) => graphSettingsDispatch({ attribute: types_1.GraphComponent.GraphSettingsAttribute.TickInterval,
                value: parseInt(e.target.value) })}></input></p>
                <div className="d-flex flex-row justify-content-between numericalSetting">
                    Max Lines Drawn: <input type="number" min="50" max="25000" size={5} value={graphSettings.maxLinesDrawn} onChange={(e) => graphSettingsDispatch({ attribute: types_1.GraphComponent.GraphSettingsAttribute.MaxLinesDrawn,
                value: parseInt(e.target.value) })}></input>
                    Max Nodes Drawn: <input type="number" min="10" max="25000" size={5} value={graphSettings.maxCirclesDrawn} onChange={(e) => graphSettingsDispatch({ attribute: types_1.GraphComponent.GraphSettingsAttribute.MaxCirclesDrawn,
                value: parseInt(e.target.value) })}></input>

                </div>
                Extreme Edge Culling: <input type="checkbox" defaultChecked={graphSettings.extremeLineCulling} onChange={() => graphSettingsDispatch({ attribute: types_1.GraphComponent.GraphSettingsAttribute.ExtremeLineCulling,
                value: !graphSettings.extremeLineCulling })}></input>
                <hr></hr>
                Render Edges: <input type="checkbox" defaultChecked={graphSettings.renderEdges} onChange={() => graphSettingsDispatch({ attribute: types_1.GraphComponent.GraphSettingsAttribute.RenderEdges,
                value: !graphSettings.renderEdges })}></input>
                <hr></hr>
                <hr></hr>
                <p>Window width: {graphDimensions.width}</p>
                <p>Window height: {graphDimensions.height}</p>
            </div>);
    }
    function renderInfoContents() {
        return (<div className="infoContents">
                <div className="float">
                    Selection Mode

                    <select value={selectionState.selectedType} onChange={(e) => {
                const newState = resetSelectionState();
                newState.selectedType = +e.target.value;
                setSelectionState(newState);
            }}>
                        <option value={0 /* Neighbours */}>Neighbors</option>
                        <option value={1 /* ShortestPath */}>Shortest path</option>
                        <option value={2 /* Group */}>Group</option>
                        <option value={3 /* Delete */}>Delete</option>
                        <option value={4 /* None */}>None</option>
                    </select>
                </div>

                {selectionState.selectedType !== 4 /* None */ &&
                <div>
                        <hr></hr>
                        {renderNodeSelected()}
                    </div>}
            </div>);
    }
    function renderMenuContents() {
        if (serverErrorMessage !== "") {
            return (<div>

                <div id="errorInfo">
                    <p>{serverErrorMessage}</p>
                    <hr></hr>
                </div>
                </div>);
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
            const mapping = graphState.mappings[Marker[marker]];
            return (<td>
                    {mapping.validMaps.length > 0 &&
                    <select key={marker + "select"} style={{ width: '100%' }} value={mapping.selectedMap} onChange={(e) => graphStateDispatch({ type: 'visualize', marker: Marker[marker],
                            attributeType: +e.target.value, attribute: mapping.name })}>
                                {mapping.validMaps.map((map) => {
                            return <option key={AttributeType[map]} value={map}>{AttributeType[map]}</option>;
                        })}
                        </select>}
                </td>);
        });
    }
    function renderAnalysisDropdown() {
        return enumKeys(Marker).map((type) => {
            return (<td>
                    <select key={type} value={graphState.mappings[Marker[type]].name} onChange={(e) => graphStateDispatch({ type: 'visualize', marker: Marker[type],
                    attributeType: AttributeType.None, attribute: e.target.value })}>
                        {graphState.mappings[Marker[type]].validAttributeNames.map((value) => {
                    return <option key={value} value={value}>{value}</option>;
                })}
                        <option key="none" value="">none</option>
                    </select>
                </td>);
        });
    }
    function renderAnalysisMatrix() {
        return (<div>
                <table className="analysisMatrix">
                    <tbody>
                        <tr>
                            <th></th>
                            {enumKeys(Marker).map((type) => {
                return (<th>{type}</th>);
            })}
                        </tr>
                        <tr>
                            <td>Attribute: </td>
                            {renderAnalysisDropdown()}
                        </tr>
                        <tr>
                            <td>Visual Mapping:</td>
                            {renderMappingList()}
                        </tr>
                    </tbody>
                </table>
                <hr></hr>
            </div>);
    }
    function renderColourSettings(marker) {
        const mapInfo = graphState.mappings[marker];
        if (mapInfo.name === "") {
            return <div></div>;
        }
        const gradientComponent = (<div style={{
                borderRadius: "4px",
                width: "100%",
                height: "1em",
                background: generateCSSGradient(colourDict[marker].colours, colourDict[marker].count)
            }}></div>);
        let visComponent = <div />;
        switch (mapInfo.selectedMap) {
            case AttributeType.LinearMapDate:
            case AttributeType.LinearMapScalar:
                visComponent = (<div>
                        {gradientComponent}
                        {mapInfo.selectedMap === AttributeType.LinearMapDate && (0, date_fns_1.isValid)(new Date(mapInfo.min))
                        ? (0, date_fns_1.format)(new Date(mapInfo.min), 'MM/dd/yyyy') : mapInfo.min}
                        <div style={{
                        float: "right"
                    }}>

                        {mapInfo.selectedMap === AttributeType.LinearMapDate && (0, date_fns_1.isValid)(new Date(mapInfo.max))
                        ? (0, date_fns_1.format)(new Date(mapInfo.max), 'MM/dd/yyyy') : mapInfo.max}
                        </div>
                    </div>);
                break;
            case AttributeType.Classify:
                visComponent = (<div>
                        {Object.keys(mapInfo.group).map((key) => {
                        let value = mapInfo.group[key];
                        return (<div key={key + "divstyle"} style={{
                                display: "flex"
                            }}>
                                    {key}:<div style={{
                                marginLeft: "1em",
                                marginTop: "3px",
                                borderRadius: "4px",
                                display: "flex",
                                width: "1em",
                                height: "1em",
                                backgroundColor: "rgba(" + value[0] * 255
                                    + "," + value[1] * 255 + "," + value[2] * 255 + ")"
                            }}>

                                    </div>
                                </div>);
                    })}
                        <button type='button' onClick={() => {
                        graphStateDispatch({ type: 'update' });
                    }}>Update Group Colouring</button>
                    </div>);
                break;
            default:
                break;
        }
        const colourSettingsRender = (<div>
                {renderColourPicker(colourDict[marker].colours, marker)}
                Gradient colour count:
                <input type="number" min="2" max={colourDict[marker].colours.length} value={colourDict[marker].count} onChange={(e) => {
                const value = parseInt(e.target.value);
                switch (marker) {
                    case Marker.FillColour:
                        colourDictDispatch({ type: 'setCount', marker: Marker.FillColour, count: value });
                        break;
                    case Marker.EdgeColour:
                        colourDictDispatch({ type: 'setCount', marker: Marker.EdgeColour, count: value });
                        break;
                }
            }}></input>
                <button type="button" onClick={() => {
                const value = colourDict[marker].count + 1;
                switch (marker) {
                    case Marker.FillColour:
                        colourDictDispatch({ type: 'setCount', marker: Marker.FillColour, count: value });
                        break;
                    case Marker.EdgeColour:
                        colourDictDispatch({ type: 'setCount', marker: Marker.EdgeColour, count: value });
                        break;
                }
            }}>+1</button>
                <button type="button" onClick={(e) => {
                const value = colourDict[marker].count - 1;
                switch (marker) {
                    case Marker.FillColour:
                        colourDictDispatch({ type: 'setCount', marker: Marker.FillColour, count: value });
                        break;
                    case Marker.EdgeColour:
                        colourDictDispatch({ type: 'setCount', marker: Marker.EdgeColour, count: value });
                        break;
                }
            }}>-1</button>
            </div>);
        return (<div>
            <p>Fill Colour Settings</p>
            {visComponent}
            {colourSettingsRender}
            <hr></hr>
        </div>);
    }
    // function renderRadiusSettings() {
    //     const radiusMap = this.state.mappings[Marker.Radius];
    //     if (radiusMap.name === "") {
    //         return <div></div>
    //     }
    //     // const gradientComponent = (
    //     //     <div style={{
    //     //         borderRadius: "4px",
    //     //         width:"100%",
    //     //         height:"1em",
    //     //         background: this.generateCSSGradient(this.state.fillColours, this.state.fillColourCount)
    //     //     }}></div>
    //     // )
    //     const minValue = radiusMap.selectedMap === AttributeType.Date && isValid(new Date(radiusMap.min))
    //         ? new Date(radiusMap.min) : radiusMap.min
    //     const maxValue = radiusMap.selectedMap === AttributeType.Date && isValid(new Date(radiusMap.max))
    //         ? new Date(radiusMap.max) : radiusMap.max
    //     const minDot = (
    //         <span style={{
    //             width: this.state.nodeRadius + (0) / (maxValue - minValue) * 12 + 4,
    //             height: this.state.nodeRadius + (0) / (maxValue - minValue) * 12 + 4,
    //             borderRadius: '50%',
    //             display: 'inline-block',
    //             backgroundColor: 'black'
    //         }}></span>
    //     )
    //     const maxDot = (
    //         <span style={{
    //             width: this.state.nodeRadius + (maxValue) / (maxValue - minValue) * 12 + 4,
    //             height: this.state.nodeRadius + (maxValue) / (maxValue - minValue) * 12 + 4,
    //             borderRadius: '50%',
    //             display: 'inline-block',
    //             backgroundColor: 'black'
    //         }}></span>
    //     )
    //     const minMaxComponent = (
    //         <div>
    //             {minDot}:
    //             {radiusMap.selectedMap === AttributeType.Date && isValid(new Date(radiusMap.min))
    //                 ? format(new Date(radiusMap.min), 'MM/dd/yyyy') : radiusMap.min}
    //             <p></p>
    //             {maxDot}:
    //             {radiusMap.selectedMap === AttributeType.Date && isValid(new Date(radiusMap.max))
    //                 ? format(new Date(radiusMap.max), 'MM/dd/yyyy') : radiusMap.max}
    //         </div>
    //     )
    //     return (
    //     <div>
    //         <p>Radius Settings</p>
    //         {minMaxComponent}
    //         <hr></hr>
    //     </div>
    // )
    // }
    // function renderAlphaSettings() {
    //     const alphaMap = this.state.mappings[Marker.Alpha];
    //     if (alphaMap.name === "") {
    //         return <div></div>
    //     }
    //     const gradientComponent = (
    //         <div style={{
    //             borderRadius: "4px",
    //             width:"100%",
    //             height:"1em",
    //             background: this.generateCSSGradient([[1,1,1], [0,0,0]], 2)
    //         }}></div>
    //     )
    //     const minMaxComponent = alphaMap.selectedMap === AttributeType.Group ? <div></div> : (
    //         <div>
    //             {gradientComponent}
    //             {alphaMap.selectedMap === AttributeType.Date && isValid(new Date(alphaMap.min))
    //                 ? format(new Date(alphaMap.min), 'MM/dd/yyyy') : alphaMap.min}
    //             <div style={{
    //                 float:"right"
    //             }}>
    //             {alphaMap.selectedMap === AttributeType.Date && isValid(new Date(alphaMap.max))
    //                 ? format(new Date(alphaMap.max), 'MM/dd/yyyy') : alphaMap.max}
    //             </div>
    //         </div>
    //     )
    //     return (
    //     <div>
    //         <p>Alpha Settings</p>
    //         {minMaxComponent}
    //         <hr></hr>
    //     </div>
    // )
    // }
    /**
     * Renders analyze tab contents.
     * @returns JSX
     */
    function renderAnalyzeContents() {
        return (<div className="menuContents">
                <p>Graph type: {types_1.GraphComponent.GraphType[graphState.graphType]}</p>
                <hr></hr>
                {renderAnalysisMatrix()}
                {renderColourSettings(Marker.FillColour)}
                {/*{renderRadiusSettings()}
            {renderAlphaSettings()}
            {renderColourSettings(Marker.EdgeColour)} */}
            </div>);
    }
    /**
     * Renders tab.
     * @param tab Tabs
     * @returns JSX
     */
    function renderTab(tab) {
        return (<li className={"nav-item " + (selectedTab === tab ? "tabsActive" : "tabsInactive")}>
                <div className="nav-link" onClick={() => {
                setSelectedTab(tab);
            }}>{Tabs[tab]}</div>
            </li>);
    }
    /**
     * Renders the hide button.
     * @returns JSX
     */
    function renderHideButton() {
        return (<li className={"nav-item " + (!hideMenu ? "tabsActive" : "tabsInactive")}>
                <div className="nav-link" onClick={() => {
                setHideMenu(!hideMenu);
            }}>{hideMenu ? "show" : "hide"}</div>
            </li>);
    }
    /**
     * Renders the menu.
     * @returns JSX
     */
    function renderMenu() {
        return (<div id="menu">
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
                        </div>}
                    {selectionState.message !== "" &&
                <div>
                            <hr></hr>
                            <p><i>{selectionState.message !== "" ? selectionState.message : "no message"}</i></p>
                        </div>}
                </div>
            </div>);
    }
    return (<div className="heightClass">
            <header className="jumbotron">
                {renderMenu()}
                {renderInfoContents()}
                    <div className="heightClass">
                        {graphState.nodes.length > 0 &&
            <forcegraph_component_1.ForceGraph key="forceGraph" graphState={graphState} graphSettings={graphSettings} onClickHandler={onNodeClick} getFillColour={getColour} getRadius={getRadius} getAlpha={getAlpha} getLineWidth={getLineWidth} getLineAlpha={getLineAlpha} getEdgeColour={(id) => { return getColour(id, graphState.mappings[Marker.EdgeColour], colourDict[Marker.EdgeColour]); }} onClickBackground={onClickBackground} setParentRendering={setRendering} rendering={rendering} selectionState={selectionState} colourDict={colourDict}/>}
                    </div>
            </header>
        </div>);
}
exports.default = Home;
