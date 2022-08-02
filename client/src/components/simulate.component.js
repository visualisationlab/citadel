"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimulatorTab = void 0;
const react_1 = __importDefault(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const api_service_1 = require("../services/api.service");
require("./home.component.css");
function renderOrderButtons(order, simulatorCount) {
    let jsx = [];
    if (simulatorCount === 1) {
        return react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(react_bootstrap_1.Col, { sm: 4 }, jsx));
    }
    if (order !== 0) {
        jsx.push(react_1.default.createElement(react_bootstrap_1.Button, { variant: 'outline-primary' }, "Up"));
    }
    if (order !== simulatorCount - 1) {
        jsx.push(react_1.default.createElement(react_bootstrap_1.Button, { variant: 'outline-primary' }, "Down"));
    }
    return react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Col, { sm: 4 }, jsx));
}
function renderSimulator(simulator, order, simulatorCount) {
    return (react_1.default.createElement(react_bootstrap_1.Row, null,
        renderOrderButtons(order, simulatorCount),
        react_1.default.createElement(react_bootstrap_1.Col, { md: {
                span: 8,
            } },
            react_1.default.createElement(react_bootstrap_1.Card, { bg: 'light' },
                react_1.default.createElement(react_bootstrap_1.Card.Header, null,
                    react_1.default.createElement(react_bootstrap_1.Row, null,
                        react_1.default.createElement(react_bootstrap_1.Col, { sm: 10 }, simulator.id),
                        react_1.default.createElement(react_bootstrap_1.Col, { sm: 2 }, simulator.generating &&
                            react_1.default.createElement(react_bootstrap_1.Spinner, { animation: "border", role: "status" })))),
                react_1.default.createElement(react_bootstrap_1.Card.Text, null,
                    react_1.default.createElement(react_bootstrap_1.ListGroup, { variant: 'flush' },
                        react_1.default.createElement(react_bootstrap_1.ListGroup.Item, null, "IP address: XYZ"),
                        react_1.default.createElement(react_bootstrap_1.ListGroup.Item, null, "Updates: 23"),
                        react_1.default.createElement(react_bootstrap_1.ListGroup.Item, null,
                            react_1.default.createElement(react_bootstrap_1.Row, null,
                                react_1.default.createElement(react_bootstrap_1.Col, { sm: 4 },
                                    react_1.default.createElement(react_bootstrap_1.ButtonGroup, null,
                                        react_1.default.createElement(react_bootstrap_1.ToggleButton, { key: 0, id: 'sim-on', type: 'radio', checked: true, value: 'enable', variant: 'outline-success' }, "On"),
                                        react_1.default.createElement(react_bootstrap_1.ToggleButton, { key: 0, id: 'sim-off', type: 'radio', checked: false, value: 'disable', variant: 'outline-danger' }, "Off"))),
                                react_1.default.createElement(react_bootstrap_1.Col, { sm: 4 },
                                    react_1.default.createElement(react_bootstrap_1.Button, null, "Edit")),
                                order === simulatorCount - 1 &&
                                    react_1.default.createElement(react_bootstrap_1.Col, { sm: 4 },
                                        react_1.default.createElement(react_bootstrap_1.Button, { variant: simulator.generating ? 'outline-danger' : 'outline-success' }, simulator.generating ? 'Stop' : 'Start'))))))))));
}
function SimulatorTab(props) {
    return react_1.default.createElement(react_bootstrap_1.Container, { fluid: true },
        react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement(react_bootstrap_1.Col, { md: {
                    span: 8,
                    offset: 4
                } },
                react_1.default.createElement(react_bootstrap_1.Card, { bg: 'secondary', text: 'white' },
                    react_1.default.createElement(react_bootstrap_1.Card.Header, null, "Server"),
                    react_1.default.createElement(react_bootstrap_1.Card.Text, null, "Some quick example text to build on the card title and make up the bulk of the card's content.")))),
        props.simulators.map((simulator, index) => {
            return renderSimulator(simulator, index, props.simulators.length);
        }),
        react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement(react_bootstrap_1.Col, { sm: 2 },
                react_1.default.createElement(react_bootstrap_1.Button, { variant: 'outline-success' }, "Add"))),
        react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement(react_bootstrap_1.Button, { onClick: () => { api_service_1.API.step(); } }, "Step")));
}
exports.SimulatorTab = SimulatorTab;
