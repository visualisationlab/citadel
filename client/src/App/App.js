"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_router_dom_1 = require("react-router-dom");
require("./App.css");
require("bootstrap/dist/css/bootstrap.min.css");
// import Home from '../components/home.component'
const upload_component_1 = __importDefault(require("../components/upload.component"));
const main_component_1 = __importDefault(require("../components/main.component"));
function App() {
    return (react_1.default.createElement("div", null,
        react_1.default.createElement("div", null,
            react_1.default.createElement(react_router_dom_1.Switch, null,
                react_1.default.createElement(react_router_dom_1.Route, { exact: true, path: "/", component: upload_component_1.default }),
                react_1.default.createElement(react_router_dom_1.Route, { exact: true, path: "/upload", component: upload_component_1.default }),
                react_1.default.createElement(react_router_dom_1.Route, { exact: true, path: "/sessions/:sid", component: main_component_1.default }),
                react_1.default.createElement(react_router_dom_1.Route, { path: '*' },
                    react_1.default.createElement(react_router_dom_1.Redirect, { to: '/' }))))));
}
exports.default = App;
