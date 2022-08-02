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
exports.SelectionDataContext = exports.GraphDataContext = exports.UserDataContext = void 0;
const react_1 = __importStar(require("react"));
require("./home.component.css");
const navigator_component_1 = __importDefault(require("./navigator.component"));
const layout_component_1 = __importDefault(require("./layout.component"));
const sessiondata_reducer_1 = require("../reducers/sessiondata.reducer");
const graphdata_reducer_1 = require("../reducers/graphdata.reducer");
const selection_reducer_1 = require("../reducers/selection.reducer");
const websocket_service_1 = require("../services/websocket.service");
const router_component_1 = require("./router.component");
const api_service_1 = require("../services/api.service");
const inspection_component_1 = __importDefault(require("./inspection.component"));
exports.UserDataContext = (0, react_1.createContext)({
    state: null,
    dispatch: null
});
exports.GraphDataContext = (0, react_1.createContext)({
    graphState: null,
    graphDispatch: null
});
exports.SelectionDataContext = (0, react_1.createContext)({
    selectionState: null,
    selectionDispatch: null
});
function Main() {
    let [sessionData, sessionDataDispatch] = (0, react_1.useReducer)(sessiondata_reducer_1.SessionDataReducer, {
        userName: '',
        users: [],
        expirationDate: new Date(),
        graphURL: '',
        sid: '',
        layouts: []
    });
    let [graphData, graphDataDispatch] = (0, react_1.useReducer)(graphdata_reducer_1.GraphDataReducer, {
        nodes: {
            data: [],
            mapping: {
                generators: {
                    'colour': { fun: 'linearmap', attribute: '', data: {} },
                    'radius': { fun: 'linearmap', attribute: '', data: {} },
                    'alpha': { fun: 'linearmap', attribute: '', data: {} },
                    'shape': { fun: 'linearmap', attribute: '', data: {} },
                },
                settings: {
                    colours: [],
                    minRadius: 16,
                    maxRadius: 32
                }
            }
        },
        edges: {
            data: [],
            mapping: {
                generators: {
                    'colour': { fun: 'linearmap', attribute: '', data: {} },
                    'alpha': { fun: 'linearmap', attribute: '', data: {} },
                    'width': { fun: 'linearmap', attribute: '', data: {} },
                },
                settings: {
                    colours: [],
                    minWidth: 1,
                    maxWidth: 4
                }
            },
        },
        directed: false
    });
    let [selectionData, selectionDataDispatch] = (0, react_1.useReducer)(selection_reducer_1.SelectionDataReducer, {
        selectedNodes: [],
        selectedEdges: [],
        selectionMode: 'single'
    });
    (0, react_1.useEffect)(() => {
        websocket_service_1.websocketService.checkConnection();
        router_component_1.Router.setup({
            sessionDataDispatch: sessionDataDispatch,
            graphDataDispatch: graphDataDispatch
        });
        api_service_1.API.getLayouts();
    }, []);
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(exports.SelectionDataContext.Provider, { value: { selectionState: selectionData, selectionDispatch: selectionDataDispatch } },
            react_1.default.createElement(exports.GraphDataContext.Provider, { value: { graphState: graphData, graphDispatch: graphDataDispatch } },
                react_1.default.createElement(exports.UserDataContext.Provider, { value: { state: sessionData, dispatch: sessionDataDispatch } },
                    react_1.default.createElement(navigator_component_1.default, { simulators: [] }),
                    react_1.default.createElement(inspection_component_1.default, null)),
                react_1.default.createElement(layout_component_1.default, null)))));
}
exports.default = Main;
