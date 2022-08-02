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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Primary = void 0;
const react_1 = __importDefault(require("react"));
const navigator_component_1 = __importDefault(require("./navigator.component"));
const MappingStories = __importStar(require("./mapping.stories"));
const SessionStories = __importStar(require("./session.stories"));
const SimulateStories = __importStar(require("./simulate.stories"));
const inspectStories = __importStar(require("./inspect.stories"));
exports.default = {
    title: 'Navigator',
    component: navigator_component_1.default
};
const Primary = (args) => react_1.default.createElement(navigator_component_1.default, Object.assign({}, args));
exports.Primary = Primary;
exports.Primary.args = Object.assign(Object.assign(Object.assign(Object.assign({}, MappingStories.Primary.args), SessionStories.Primary.args), SimulateStories.Three.args), inspectStories.Default.args);
