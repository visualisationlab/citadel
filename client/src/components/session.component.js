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
require("./home.component.css");
const main_component_1 = require("../components/main.component");
const api_service_1 = require("../services/api.service");
function renderUsers(userName, userList) {
    return (react_1.default.createElement(react_bootstrap_1.ListGroup, { variant: 'flush' },
        react_1.default.createElement(react_bootstrap_1.ListGroup.Item, { variant: 'primary' },
            userName,
            " (Me)"),
        userList.filter((name) => { return name !== userName; }).map((user) => {
            return (react_1.default.createElement(react_bootstrap_1.ListGroup.Item, null, user));
        })));
}
function renderSettings(userName, expirationDate, graphURL, sid, newUserName, setNewUserName) {
    return (react_1.default.createElement(react_bootstrap_1.Container, null,
        react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement(react_bootstrap_1.InputGroup, null,
                react_1.default.createElement(react_bootstrap_1.InputGroup.Text, null, "Username"),
                react_1.default.createElement(react_bootstrap_1.Form.Control, { placeholder: userName, onChange: (e) => {
                        setNewUserName(e.target.value);
                    } }),
                react_1.default.createElement(react_bootstrap_1.Button, { variant: "outline-primary", id: "button-update", onClick: () => { api_service_1.API.updateUsername(newUserName); } }, "Update"))),
        react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement(react_bootstrap_1.InputGroup, null,
                react_1.default.createElement(react_bootstrap_1.InputGroup.Text, null, "Session Expiration Date:"),
                react_1.default.createElement(react_bootstrap_1.Form.Control, { value: expirationDate.toString() })),
            react_1.default.createElement(react_bootstrap_1.InputGroup, null,
                react_1.default.createElement(react_bootstrap_1.InputGroup.Text, null, "Session ID:"),
                react_1.default.createElement(react_bootstrap_1.Form.Control, { value: sid }),
                react_1.default.createElement(react_bootstrap_1.Button, { variant: "outline-secondary", id: "button-copy" }, "Copy")),
            react_1.default.createElement(react_bootstrap_1.InputGroup, null,
                react_1.default.createElement(react_bootstrap_1.InputGroup.Text, null, "Original Graph URL:"),
                react_1.default.createElement(react_bootstrap_1.Form.Control, { value: graphURL }),
                react_1.default.createElement(react_bootstrap_1.Button, { variant: "outline-secondary", id: "button-copy" }, "Copy"))),
        react_1.default.createElement(react_bootstrap_1.Row, { className: 'justify-content-md-center' },
            react_1.default.createElement(react_bootstrap_1.Col, { md: { span: 3 } },
                react_1.default.createElement(react_bootstrap_1.Button, null, "Download Graph")))));
}
function SessionTab() {
    const { state } = (0, react_1.useContext)(main_component_1.UserDataContext);
    const [newUserName, setNewUserName] = (0, react_1.useState)('');
    if (!state) {
        return (react_1.default.createElement(react_1.default.Fragment, null));
    }
    return (react_1.default.createElement(react_bootstrap_1.Container, null,
        react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement("h3", null, "Users"),
            renderUsers(state.userName, state.users)),
        react_1.default.createElement(react_bootstrap_1.Row, null,
            react_1.default.createElement("h3", null, "Settings"),
            renderSettings(state.userName, state.expirationDate, state.graphURL, state.sid, newUserName, setNewUserName))));
}
exports.default = SessionTab;
