"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Default = void 0;
const react_1 = __importDefault(require("react"));
const layout_component_1 = __importDefault(require("./layout.component"));
exports.default = {
    title: 'Layout',
    component: layout_component_1.default,
};
const Default = (args) => react_1.default.createElement(layout_component_1.default, null);
exports.Default = Default;
const defaultCount = 1000;
exports.Default.args = {
    nodes: [...Array(defaultCount).keys()].map((index) => {
        return {
            id: 'n' + index,
            x: 30 + index * 20,
            y: 30 + index * 20,
            attributes: {},
            visualAttributes: {
                fillColour: [0, 0, 0],
                radius: 10,
                alpha: 0.2,
                edgeColour: [0, 0, 0]
            }
        };
    }),
    edges: [...Array(defaultCount).keys()].map((index) => {
        return {
            id: 'e' + index,
            source: 'n' + (index + 100) % defaultCount,
            target: 'n' + (index + 101) % defaultCount,
            attributes: {},
            visualAttributes: {
                fillColour: [0, 0, 0],
                width: 10,
                alpha: 1,
                edgeColour: [0, 0, 0]
            }
        };
    }),
    directed: false
};
