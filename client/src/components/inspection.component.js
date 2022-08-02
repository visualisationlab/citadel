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
const react_bootstrap_1 = require("react-bootstrap");
const main_component_1 = require("../components/main.component");
const main_component_2 = require("../components/main.component");
const mathjs_1 = require("mathjs");
const chart_js_1 = require("chart.js");
const react_chartjs_2_1 = require("react-chartjs-2");
require("./home.component.css");
chart_js_1.Chart.register(chart_js_1.CategoryScale, chart_js_1.LinearScale, chart_js_1.PointElement, chart_js_1.LineElement, chart_js_1.Title, chart_js_1.Tooltip, chart_js_1.Filler, chart_js_1.Legend);
function ClusterTab(attributeSelectionList, selectionDispatch, clusterAttributes, selectedAttribute, setSelectedAttribute) {
    const attributeList = clusterAttributes.map((attributes) => {
        return parseInt(attributes[selectedAttribute]);
    });
    if (attributeList.length === 0) {
        return react_1.default.createElement(react_1.default.Fragment, null);
    }
    let frequencies = {};
    attributeList.forEach((att) => {
        frequencies[att] = (frequencies[att] || 0) + 1;
    });
    const data = {
        labels: Object.keys(frequencies),
        datasets: [
            {
                fill: true,
                label: selectedAttribute,
                data: Object.values(frequencies),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
        ],
    };
    return (react_1.default.createElement(react_bootstrap_1.Tab, { eventKey: 'Cluster', title: `Cluster (Count: ${attributeList.length})` },
        react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement(react_bootstrap_1.Dropdown, { onSelect: (item) => {
                    if (item === null)
                        return;
                    setSelectedAttribute(item);
                } },
                react_1.default.createElement(react_bootstrap_1.Dropdown.Toggle, null, selectedAttribute === '' ? 'None' : selectedAttribute),
                react_1.default.createElement(react_bootstrap_1.Dropdown.Menu, null, attributeSelectionList.map((att) => {
                    return (react_1.default.createElement(react_bootstrap_1.Dropdown.Item, { key: att, eventKey: att }, att));
                })))),
        react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement("p", null,
                "Min: ",
                (0, mathjs_1.min)(attributeList)),
            react_1.default.createElement("p", null,
                "Max: ",
                (0, mathjs_1.max)(attributeList)),
            react_1.default.createElement("p", null,
                "Mean: ",
                (0, mathjs_1.mean)(attributeList)),
            react_1.default.createElement("p", null,
                "Median: ",
                (0, mathjs_1.median)(attributeList))),
        react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement(react_chartjs_2_1.Line, { data: data })),
        react_1.default.createElement(react_bootstrap_1.Button, { onClick: () => { console.log('here'); selectionDispatch({ type: 'set', attribute: 'node', value: [] }); } }, "Deselect All")));
}
function NodeTab(id, attributes, setAttributes, graphDispatch) {
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement("p", null,
                "Node ID: ",
                id)),
        react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement("p", null, "Attributes"),
            Object.keys(attributes).map((key) => {
                return (react_1.default.createElement(react_bootstrap_1.Row, null,
                    react_1.default.createElement(react_bootstrap_1.Col, null, key),
                    react_1.default.createElement(react_bootstrap_1.Col, null,
                        react_1.default.createElement(react_bootstrap_1.Form.Control, { onChange: (e) => {
                                let newState = Object.assign({}, attributes);
                                newState[key] = e.target.value;
                                setAttributes(newState);
                            }, value: attributes[key], defaultValue: attributes[key], placeholder: attributes[key] }))));
            }),
            react_1.default.createElement(react_bootstrap_1.Row, null,
                react_1.default.createElement(react_bootstrap_1.Col, { md: { offset: 6 } },
                    react_1.default.createElement(react_bootstrap_1.Button, { onClick: () => {
                            graphDispatch({
                                type: 'update',
                                property: 'data',
                                object: 'node',
                                value: {
                                    id: id,
                                    attributes: attributes
                                }
                            });
                        }, type: 'submit' }, "Update"))))));
}
function SelectionTab() {
}
function EdgeTab(id, source, target, attributes, setAttributes, graphDispatch) {
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement("p", null,
                "Edge ID: ",
                id),
            react_1.default.createElement("p", null,
                "Source Node: ",
                source),
            react_1.default.createElement("p", null,
                "Target Node: ",
                target)),
        react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement("p", null, "Attributes"),
            Object.keys(attributes).map((key) => {
                return (react_1.default.createElement(react_bootstrap_1.Row, null,
                    react_1.default.createElement(react_bootstrap_1.Col, null, key),
                    react_1.default.createElement(react_bootstrap_1.Col, null,
                        react_1.default.createElement(react_bootstrap_1.Form.Control, { onChange: (e) => {
                                let newState = Object.assign({}, attributes);
                                newState[key] = e.target.value;
                                setAttributes(newState);
                            }, value: attributes[key], defaultValue: attributes[key], placeholder: attributes[key] }))));
            }),
            react_1.default.createElement(react_bootstrap_1.Row, null,
                react_1.default.createElement(react_bootstrap_1.Col, { md: { offset: 6 } },
                    react_1.default.createElement(react_bootstrap_1.Button, { onClick: () => {
                            graphDispatch({
                                type: 'update',
                                property: 'data',
                                object: 'edge',
                                value: {
                                    id: id,
                                    attributes: attributes
                                }
                            });
                        }, type: 'submit' }, "Update"))))));
}
function InspectionTab() {
    const { state } = (0, react_1.useContext)(main_component_1.UserDataContext);
    const { graphState, graphDispatch } = (0, react_1.useContext)(main_component_2.GraphDataContext);
    const { selectionState, selectionDispatch } = (0, react_1.useContext)(main_component_1.SelectionDataContext);
    const [attributes, setAttributes] = (0, react_1.useState)({});
    const [clusterAttributes, setClusterAttributes] = (0, react_1.useState)([]);
    const [selectedAttribute, setSelectedAttribute] = (0, react_1.useState)('');
    const [attributeSelectionList, setAttributeSelectionList] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        console.log(`Starting useEffect: ${selectionState === null || selectionState === void 0 ? void 0 : selectionState.selectedNodes.length}`);
        if (selectionState === null || graphState === null) {
            return;
        }
        if (selectionState.selectedNodes.length === 1) {
            const id = selectionState.selectedNodes[0];
            const result = graphState.nodes.data.filter((node) => { return node.id === id; });
            if (result.length === 0 || result.length > 1) {
                console.log(`Wrong number of nodes with id ${id}: ${result.length}`);
                return;
            }
            console.log(`1 selected: ${result[0].attributes}`);
            setAttributes(result[0].attributes);
            return;
        }
        else if (selectionState.selectedNodes.length > 1) {
            console.log(`Selected nodes: ${selectionState.selectedNodes}`);
            const filteredResult = graphState.nodes.data
                .filter((node) => { return selectionState.selectedNodes.includes(node.id); });
            if (filteredResult.length !== selectionState.selectedNodes.length) {
                console.log(`Wrong number of nodes for cluster ${selectionState.selectedNodes.length}: ${filteredResult.length}`);
                return;
            }
            setAttributeSelectionList(Object.keys(filteredResult[0].attributes));
            const result = filteredResult.map((node) => { return node.attributes; });
            console.log(result);
            setClusterAttributes(result);
            return;
        }
    }, [graphState, selectionState]);
    if (state === null || graphState == null || graphDispatch == null
        || selectionState == null || selectionDispatch === null) {
        console.log('Something is null!');
        return react_1.default.createElement(react_1.default.Fragment, null);
    }
    if (selectionState.selectedNodes.length === 0) {
        return react_1.default.createElement(react_1.default.Fragment, null);
    }
    else if (selectionState.selectedNodes.length === 1) {
        const id = selectionState.selectedNodes[0];
        const result = graphState.nodes.data.filter((node) => { return node.id === id; });
        if (result.length === 0 || result.length > 1) {
            console.log(`Wrong number of nodes with id ${id}: {result.length}`);
            return react_1.default.createElement(react_1.default.Fragment, null);
        }
        const node = result[0];
        return (react_1.default.createElement(react_bootstrap_1.Container, { className: "shadow bg-white rounded", style: { width: '400px',
                padding: '0px', top: '50px',
                right: '50px',
                position: 'absolute' } },
            react_1.default.createElement(react_bootstrap_1.Tabs, null,
                react_1.default.createElement(react_bootstrap_1.Tab, { eventKey: 'Node', title: 'Node' }, NodeTab(node.id, attributes, setAttributes, graphDispatch)))));
    }
    else if (selectionState.selectedNodes.length > 1) {
        console.log(`Rendering selection: ${selectionState.selectedNodes}`);
        return (react_1.default.createElement(react_bootstrap_1.Container, { className: "shadow bg-white rounded", style: { width: '400px',
                padding: '0px', top: '50px',
                right: '50px',
                position: 'absolute' } },
            react_1.default.createElement(react_bootstrap_1.Tabs, null, ClusterTab(attributeSelectionList, selectionDispatch, clusterAttributes, selectedAttribute, setSelectedAttribute))));
    }
    return react_1.default.createElement(react_1.default.Fragment, null);
}
exports.default = InspectionTab;
