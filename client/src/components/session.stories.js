"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Primary = void 0;
const react_1 = __importDefault(require("react"));
const session_component_1 = __importDefault(require("./session.component"));
exports.default = {
    title: 'Tabs/Session',
    component: session_component_1.default,
};
const Primary = (args) => react_1.default.createElement(session_component_1.default, null);
exports.Primary = Primary;
exports.Primary.args = {
    userName: 'User0',
    users: ['User1', 'User2'],
    expirationDate: new Date(),
    sid: 'SID',
    graphURL: 'google.com'
};
