"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hardcore = exports.NodeSelected = exports.EdgeSelected = exports.Default = void 0;
const react_1 = __importDefault(require("react"));
const inspect_component_1 = __importDefault(require("./inspect.component"));
exports.default = {
    title: 'Tabs/Inspect',
    component: inspect_component_1.default,
};
const Default = (args) => react_1.default.createElement(inspect_component_1.default, Object.assign({}, args));
exports.Default = Default;
const EdgeSelected = (args) => react_1.default.createElement(inspect_component_1.default, Object.assign({}, args));
exports.EdgeSelected = EdgeSelected;
const NodeSelected = (args) => react_1.default.createElement(inspect_component_1.default, Object.assign({}, args));
exports.NodeSelected = NodeSelected;
const Hardcore = (args) => react_1.default.createElement(inspect_component_1.default, Object.assign({}, args));
exports.Hardcore = Hardcore;
let defaultCount = 100;
let hardcoreCount = 1000;
exports.Default.args = {
    // nodes: [...Array(defaultCount).keys()].map((index) => {
    //     return {
    //         id: 'n' + index,
    //         x: 0,
    //         y: 0,
    //         attributes: {},
    //         visualAttributes: {
    //             fillColour: [0, 0, 0],
    //             radius: 10,
    //             alpha: 1,
    //             edgeColour: [0, 0, 0]
    //         }
    //     }
    // }),
    // edges: [...Array(defaultCount).keys()].map((index) => {
    //     return {
    //         id: 'e' + index,
    //         source: 'n' + (index + 100) % defaultCount,
    //         target: 'n' + (index + 101) % defaultCount,
    //         attributes: {},
    //         visualAttributes: {
    //             fillColour: [0, 0, 0],
    //             width: 10,
    //             alpha: 1,
    //             edgeColour: [0, 0, 0]
    //         }
    //     }}),
    // directed: false,
    selectedEdgeID: '',
    selectedNodeID: ''
};
exports.Hardcore.args = {
    // nodes: [...Array(hardcoreCount).keys()].map((index) => {
    //     return {
    //         id: 'n' + index,
    //         x: 0,
    //         y: 0,
    //         attributes: {},
    //         visualAttributes: {
    //             fillColour: [0, 0, 0],
    //             radius: 10,
    //             alpha: 1,
    //             edgeColour: [0, 0, 0]
    //         }
    //     }
    // }),
    // edges: [...Array(hardcoreCount).keys()].map((index) => {
    //     return {
    //         id: 'e' + index,
    //         source: 'n' + (index + 100) % hardcoreCount,
    //         target: 'n' + (index + 101) % hardcoreCount,
    //         attributes: {},
    //         visualAttributes: {
    //             fillColour: [0, 0, 0],
    //             width: 10,
    //             alpha: 1,
    //             edgeColour: [0, 0, 0]
    //         }
    //     }}),
    // directed: false,
    selectedEdgeID: '',
    selectedNodeID: ''
};
