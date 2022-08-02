"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const mapping_component_1 = __importDefault(require("./mapping.component"));
const session_component_1 = __importDefault(require("./session.component"));
const simulate_component_1 = require("./simulate.component");
const inspect_component_1 = __importDefault(require("./inspect.component"));
require("./home.component.css");
function Navigator(props) {
    return (react_1.default.createElement(react_bootstrap_1.Container, { className: "shadow bg-white rounded", style: { width: '600px',
            padding: '0px', top: '50px',
            left: '50px',
            position: 'absolute' } },
        react_1.default.createElement(react_bootstrap_1.Tabs, { defaultActiveKey: 'Mapping', id: "navigator", 
            // @ts-ignore
            justify: true },
            react_1.default.createElement(react_bootstrap_1.Tab, { eventKey: 'Mapping', title: 'Mapping' },
                react_1.default.createElement(mapping_component_1.default, null)),
            react_1.default.createElement(react_bootstrap_1.Tab, { eventKey: 'Simulate', title: 'Simulate' },
                react_1.default.createElement(simulate_component_1.SimulatorTab, { simulators: props.simulators })),
            react_1.default.createElement(react_bootstrap_1.Tab, { eventKey: 'Search', title: 'Search' },
                react_1.default.createElement(inspect_component_1.default, null)),
            react_1.default.createElement(react_bootstrap_1.Tab, { eventKey: 'Session', title: 'Session' },
                react_1.default.createElement(session_component_1.default, null)))));
}
exports.default = Navigator;
