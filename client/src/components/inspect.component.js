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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const fuse_js_1 = __importDefault(require("fuse.js"));
const main_component_1 = require("../components/main.component");
const main_component_2 = require("../components/main.component");
require("./home.component.css");
function renderListContent(source, edges, selectedEdges, selectedNodes, selectionDispatch) {
    if (edges.length === 0) {
        return (react_1.default.createElement(react_1.default.Fragment, null));
    }
    return (react_1.default.createElement(react_bootstrap_1.Accordion.Body, null,
        react_1.default.createElement(react_bootstrap_1.Table, { striped: true },
            react_1.default.createElement("thead", null,
                react_1.default.createElement("tr", null,
                    react_1.default.createElement("th", null, "Edge ID"),
                    react_1.default.createElement("th", null, "Source Node ID"),
                    react_1.default.createElement("th", null, "Target Node ID"))),
            react_1.default.createElement("tbody", null, edges.map((edge) => {
                return (react_1.default.createElement("tr", { key: edge.id, className: selectedEdges.includes(edge.id) ? 'table-primary' : '' },
                    react_1.default.createElement("td", { onClick: (e) => {
                            selectionDispatch({
                                'attribute': 'edge',
                                'type': 'set',
                                'value': [edge.id]
                            });
                        } }, edge.id),
                    react_1.default.createElement("td", { className: selectedNodes.includes(source) ? 'table-primary' : '', onClick: (e) => {
                            selectionDispatch({
                                'attribute': 'node',
                                'type': 'set',
                                'value': [source]
                            });
                        } }, source),
                    react_1.default.createElement("td", { className: selectedNodes.includes(edge.nodeID) ? 'table-primary' : '', onClick: (e) => {
                            selectionDispatch({
                                'attribute': 'node',
                                'type': 'set',
                                'value': [edge.nodeID]
                            });
                        } }, edge.nodeID)));
            })))));
}
function renderMainList(nodes, selectedEdges, selectedNodes, selectionDispatch) {
    return (react_1.default.createElement(react_bootstrap_1.Container, { style: {
            overflowY: 'scroll',
            height: '400px',
            paddingRight: '0px'
        } },
        react_1.default.createElement(react_bootstrap_1.Accordion, { alwaysOpen: true }, Object.keys(nodes).map((id) => {
            return (react_1.default.createElement(react_bootstrap_1.Accordion.Item, { key: id, eventKey: id },
                react_1.default.createElement(react_bootstrap_1.Accordion.Header, null,
                    "Node ",
                    id,
                    " (edge count: ",
                    nodes[id].length,
                    ")"),
                renderListContent(id, nodes[id], selectedEdges, selectedNodes, selectionDispatch)));
        }))));
}
// TRY MINISEARCH
// PAGINATION
function InspectTab(props) {
    let [nodes, setNodes] = (0, react_1.useState)({});
    let [query, setQuery] = (0, react_1.useState)('');
    const { graphState } = (0, react_1.useContext)(main_component_1.GraphDataContext);
    const { selectionState, selectionDispatch } = (0, react_1.useContext)(main_component_2.SelectionDataContext);
    (0, react_1.useEffect)(() => {
        if (graphState === null) {
            return;
        }
        let tmpNodes = {};
        if (query !== '') {
            console.log('searching');
            const options = {
                keys: ['id'],
                shouldSort: false,
                threshold: 0.4
            };
            const fuse = new fuse_js_1.default(graphState.nodes.data, options);
            fuse.search(query).forEach((result) => {
                tmpNodes[result.item.id] = [];
            });
        }
        else {
            graphState.nodes.data.forEach((node) => {
                tmpNodes[node.id] = [];
            });
        }
        graphState.edges.data.forEach((edge, index) => {
            let id = 'id' in edge.attributes ? edge.attributes.id : index.toString();
            if (query !== '') {
                if (!(Object.keys(tmpNodes).includes(edge.source.toString()))) {
                    if (graphState.directed) {
                        return;
                    }
                    if (!(Object.keys(tmpNodes).includes(edge.target.toString()))) {
                        return;
                    }
                    tmpNodes[edge.target].push({ id: id, nodeID: edge.source });
                    return;
                }
            }
            tmpNodes[edge.source].push({ id: id, nodeID: edge.target });
            if (graphState.directed) {
                return;
            }
            if (!(Object.keys(tmpNodes).includes(edge.target.toString()))) {
                return;
            }
            tmpNodes[edge.target].push({ id: id, nodeID: edge.source });
        });
        setNodes(tmpNodes);
    }, [graphState, query]);
    if (selectionState === null || selectionDispatch === null) {
        return react_1.default.createElement(react_1.default.Fragment, null);
    }
    return (react_1.default.createElement(react_bootstrap_1.Container, { style: {
            paddingLeft: '0px'
        } },
        react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement(react_bootstrap_1.InputGroup, { style: {
                    paddingRight: '0px'
                } },
                react_1.default.createElement(react_bootstrap_1.Form.Control, { placeholder: 'Search', "aria-label": 'search', onChange: (e) => {
                        setQuery(e.target.value);
                    } }))),
        react_1.default.createElement(react_bootstrap_1.Row, null, renderMainList(nodes, selectionState.selectedEdges, selectionState.selectedNodes, selectionDispatch))));
}
exports.default = InspectTab;
