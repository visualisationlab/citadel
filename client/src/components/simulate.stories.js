"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Three = exports.Two = exports.One = exports.Empty = void 0;
const react_1 = __importDefault(require("react"));
const simulate_component_1 = require("./simulate.component");
exports.default = {
    title: 'Tabs/Simulate',
    component: simulate_component_1.SimulatorTab
};
const Empty = (args) => react_1.default.createElement(simulate_component_1.SimulatorTab, Object.assign({}, args));
exports.Empty = Empty;
const One = (args) => react_1.default.createElement(simulate_component_1.SimulatorTab, Object.assign({}, args));
exports.One = One;
const Two = (args) => react_1.default.createElement(simulate_component_1.SimulatorTab, Object.assign({}, args));
exports.Two = Two;
const Three = (args) => react_1.default.createElement(simulate_component_1.SimulatorTab, Object.assign({}, args));
exports.Three = Three;
exports.Empty.args = {
    simulators: []
};
exports.One.args = {
    simulators: [
        {
            id: 'pc0',
            generating: false,
            options: {}
        }
    ]
};
exports.Two.args = {
    simulators: [
        {
            id: 'pc0',
            generating: false,
            options: {}
        },
        {
            id: 'pc1',
            generating: false,
            options: {}
        }
    ]
};
exports.Three.args = {
    simulators: [
        {
            id: 'pc0',
            generating: false,
            options: {}
        },
        {
            id: 'pc1',
            generating: false,
            options: {}
        },
        {
            id: 'pc2',
            generating: false,
            options: {}
        }
    ]
};
