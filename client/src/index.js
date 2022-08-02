"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const client_1 = require("react-dom/client");
// import reportWebVitals from './reportWebVitals';
const react_router_dom_1 = require("react-router-dom");
require("./index.css");
const App_1 = __importDefault(require("./App/App"));
// require('dotenv').config()
// import * as serviceWorker from "./serviceWorker";
const rootElement = document.getElementById('root');
const root = (0, client_1.createRoot)(rootElement);
root.render(react_1.default.createElement(react_router_dom_1.BrowserRouter, null,
    react_1.default.createElement(App_1.default, null)));
// serviceWorker.unregister();
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
