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
const react_router_dom_1 = require("react-router-dom");
const react_bootstrap_1 = require("react-bootstrap");
const user_service_1 = require("../services/user.service");
require("./home.component.css");
function Home() {
    const [url, setURL] = (0, react_1.useState)('');
    let history = (0, react_router_dom_1.useHistory)();
    function joinSession() {
        history.push(`/sessions/${sid}`);
    }
    function startSession(url) {
        user_service_1.userService.genSession(url).then(response => {
            history.push(`/sessions/${response.data}`);
        }, error => {
            console.log(error);
        });
    }
    const [sid, setSid] = (0, react_1.useState)('');
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Container, { className: "shadow p-3 bg-white rounded", style: { width: '50%', marginTop: '30px' } },
            react_1.default.createElement(react_bootstrap_1.Row, null,
                react_1.default.createElement(react_bootstrap_1.Col, { md: { span: 2 } },
                    react_1.default.createElement("img", { width: '100%', src: "http://visualisationlab.science.uva.nl/wp-content/uploads/2022/02/VisLablogo-cropped-notitle.svg", className: "custom-logo", alt: "Visualisation Lab" })),
                react_1.default.createElement(react_bootstrap_1.Col, { md: { span: 10 } },
                    react_1.default.createElement("h1", null, "Graph-Vis"),
                    react_1.default.createElement("p", { className: 'text-secondary' }, " Graph Visualisation Software. Create a new session or join an existing one below.")))),
        react_1.default.createElement(react_bootstrap_1.Container, { className: "shadow p-3 bg-white rounded", style: { width: '50%', marginTop: '20px' } },
            react_1.default.createElement(react_bootstrap_1.Row, null,
                react_1.default.createElement(react_bootstrap_1.Col, { md: { span: 8 } },
                    react_1.default.createElement(react_bootstrap_1.Row, null,
                        react_1.default.createElement(react_bootstrap_1.Form.Group, null,
                            react_1.default.createElement(react_bootstrap_1.Form.Label, { htmlFor: "url" }, "Graph URL"),
                            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", id: "url", "aria-describedby": "urlBlock", onChange: (e) => {
                                    setURL(e.target.value);
                                } }),
                            react_1.default.createElement(react_bootstrap_1.Form.Text, { id: "urlBlock", muted: true }, "Enter a URL pointing to a graph in JSON format."))),
                    react_1.default.createElement(react_bootstrap_1.Row, { style: {
                            marginTop: '10px'
                        } },
                        react_1.default.createElement(react_bootstrap_1.Col, { md: { span: 4 } },
                            react_1.default.createElement(react_bootstrap_1.Button, { variant: 'primary', type: 'submit', onClick: () => startSession(url), disabled: url === '' }, "Start session")))),
                react_1.default.createElement(react_bootstrap_1.Col, { md: { span: 4, offset: 0 } },
                    react_1.default.createElement(react_bootstrap_1.Row, null,
                        react_1.default.createElement(react_bootstrap_1.Col, null,
                            react_1.default.createElement(react_bootstrap_1.Form.Group, null,
                                react_1.default.createElement(react_bootstrap_1.Form.Label, { htmlFor: "sid" }, "Session ID"),
                                react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "text", id: "sid", "aria-describedby": "sidBlock", onChange: (e) => setSid(e.target.value) }),
                                react_1.default.createElement(react_bootstrap_1.Form.Text, { id: "sid" }, "Enter an existing session ID."))),
                        react_1.default.createElement(react_bootstrap_1.Row, null)),
                    react_1.default.createElement(react_bootstrap_1.Row, { style: {
                            marginTop: '20px'
                        } },
                        react_1.default.createElement(react_bootstrap_1.Col, null,
                            react_1.default.createElement(react_bootstrap_1.Button, { variant: 'primary', type: 'submit', disabled: sid === '', onClick: joinSession }, "Join Session"))))))));
}
exports.default = Home;
