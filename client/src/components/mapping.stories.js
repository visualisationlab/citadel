"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Primary = void 0;
const react_1 = __importDefault(require("react"));
const mapping_component_1 = __importDefault(require("./mapping.component"));
exports.default = {
    title: 'Tabs/Mapping',
    component: mapping_component_1.default
};
const Primary = () => react_1.default.createElement(mapping_component_1.default, null);
exports.Primary = Primary;
