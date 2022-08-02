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
const main_component_1 = require("../components/main.component");
const main_component_2 = require("../components/main.component");
const layoutsettings_reducer_1 = require("../reducers/layoutsettings.reducer");
const api_service_1 = require("../services/api.service");
require("./home.component.css");
const nodeMappingTitles = {
    'colour': { img: 'colourImg', title: 'Fill Colour', description: 'Maps a node attribute to its colour.' },
    'radius': { img: 'radiusImg', title: 'Radius', description: 'Maps a node attribute to its radius.' },
    'alpha': { img: 'alphaImg', title: 'Alpha', description: 'Maps a node attribute to its alpha channel (transparency).' },
    'shape': { img: 'colourImg', title: 'Shape', description: 'Maps a node attribute to its shape.' },
};
const edgeMappingTitles = {
    'colour': 'Colour',
    'alpha': 'Alpha',
    'width': 'Width'
};
function nodeMapping(graphState, dispatch) {
    const content = Object.entries(nodeMappingTitles).map(([key, value], index) => {
        var _a;
        const title = graphState.nodes.mapping.generators[key].attribute;
        return (react_1.default.createElement(react_bootstrap_1.Col, { md: { span: 6 } },
            react_1.default.createElement(react_bootstrap_1.Card, { border: title !== '' ? 'primary' : '' },
                react_1.default.createElement(react_bootstrap_1.Card.Header, null, value.title),
                react_1.default.createElement(react_bootstrap_1.Card.Body, null,
                    react_1.default.createElement(react_bootstrap_1.Card.Text, null, value.description)),
                react_1.default.createElement(react_bootstrap_1.ListGroup, { className: "list-group-flush" },
                    react_1.default.createElement(react_bootstrap_1.ListGroup.Item, null,
                        react_1.default.createElement(react_bootstrap_1.ButtonGroup, null,
                            react_1.default.createElement(react_bootstrap_1.Button, null, "Settings"),
                            react_1.default.createElement(react_bootstrap_1.DropdownButton, { as: react_bootstrap_1.ButtonGroup, title: title === '' ? 'none' : title, onSelect: (item) => {
                                    if (item === null) {
                                        return;
                                    }
                                    dispatch({
                                        type: 'set',
                                        property: 'mapping',
                                        object: 'node',
                                        map: key,
                                        fun: 'linearmap',
                                        key: item
                                    });
                                } },
                                react_1.default.createElement(react_bootstrap_1.Dropdown.Item, { eventKey: '' }, "none"),
                                Object.keys((_a = graphState.nodes.data[0]) === null || _a === void 0 ? void 0 : _a.attributes).map((attribute) => {
                                    return (react_1.default.createElement(react_bootstrap_1.Dropdown.Item, { key: attribute, eventKey: attribute }, attribute));
                                }))))))));
    });
    let rows = [];
    for (let i = 0; i < content.length; i += 2) {
        rows.push(react_1.default.createElement(react_bootstrap_1.Row, null,
            content[i],
            content[i + 1]));
    }
    return (react_1.default.createElement(react_bootstrap_1.Accordion.Item, { eventKey: 'nodemap' },
        react_1.default.createElement(react_bootstrap_1.Accordion.Header, null, "Node Mapping"),
        react_1.default.createElement(react_bootstrap_1.Accordion.Body, { style: {
                overflowY: 'scroll',
                height: '400px'
            } },
            react_1.default.createElement(react_bootstrap_1.Container, null, rows))));
}
function edgeMapping(graphState, dispatch) {
    if (graphState.edges.data.length === 0) {
        return react_1.default.createElement(react_1.default.Fragment, null);
    }
    return (react_1.default.createElement(react_bootstrap_1.Accordion.Item, { eventKey: 'edgemap' },
        react_1.default.createElement(react_bootstrap_1.Accordion.Header, null, "Edge Mapping"),
        react_1.default.createElement(react_bootstrap_1.Accordion.Body, null,
            react_1.default.createElement(react_bootstrap_1.Row, null, Object.entries(edgeMappingTitles).map(([key, value]) => {
                var _a;
                const title = graphState.edges.mapping.generators[key].attribute;
                return (react_1.default.createElement(react_bootstrap_1.Col, { md: { span: 3 } },
                    react_1.default.createElement(react_bootstrap_1.Row, null,
                        react_1.default.createElement("p", null, value)),
                    react_1.default.createElement(react_bootstrap_1.Row, null,
                        react_1.default.createElement(react_bootstrap_1.Dropdown, { onSelect: (item) => {
                                if (item === null) {
                                    return;
                                }
                                dispatch({
                                    type: 'set',
                                    property: 'mapping',
                                    object: 'edge',
                                    map: key,
                                    fun: 'linearmap',
                                    key: item
                                });
                            } },
                            react_1.default.createElement(react_bootstrap_1.Dropdown.Toggle, null, title === '' ? 'none' : title),
                            react_1.default.createElement(react_bootstrap_1.Dropdown.Menu, null,
                                react_1.default.createElement(react_bootstrap_1.Dropdown.Item, { eventKey: '' }, "none"),
                                Object.keys((_a = graphState.edges.data[0]) === null || _a === void 0 ? void 0 : _a.attributes).map((attribute) => {
                                    return (react_1.default.createElement(react_bootstrap_1.Dropdown.Item, { key: attribute + 'abc', eventKey: attribute }, attribute));
                                }))))));
            })))));
}
function layoutMapping(layouts, layoutInfo, layoutSettingsDispatch) {
    const selectedLayout = layoutInfo === null || layoutInfo === void 0 ? void 0 : layoutInfo.layouts.filter((layout) => {
        return (layout.name === layoutInfo.selectedLayout);
    });
    if (selectedLayout === undefined || selectedLayout.length === 0) {
        return (react_1.default.createElement(react_bootstrap_1.Accordion.Item, { eventKey: 'layoutmap' },
            react_1.default.createElement(react_bootstrap_1.Accordion.Header, null, "Layout Mapping"),
            react_1.default.createElement(react_bootstrap_1.Accordion.Body, null,
                react_1.default.createElement(react_bootstrap_1.ListGroup, { variant: 'flush' },
                    react_1.default.createElement(react_bootstrap_1.ListGroup.Item, null,
                        react_1.default.createElement(react_bootstrap_1.Row, null,
                            react_1.default.createElement(react_bootstrap_1.Col, { md: { span: 4 } },
                                react_1.default.createElement("p", null, "Layout Algorithm:")),
                            react_1.default.createElement(react_bootstrap_1.Col, { md: { span: 4 } },
                                react_1.default.createElement(react_bootstrap_1.Dropdown, { onSelect: (item) => {
                                        if (item === null) {
                                            return;
                                        }
                                        layoutSettingsDispatch({
                                            attribute: 'selectedLayout',
                                            value: item
                                        });
                                    } },
                                    react_1.default.createElement(react_bootstrap_1.Dropdown.Toggle, null, (layoutInfo === null || layoutInfo === void 0 ? void 0 : layoutInfo.selectedLayout) === '' ? 'none' : layoutInfo === null || layoutInfo === void 0 ? void 0 : layoutInfo.selectedLayout),
                                    react_1.default.createElement(react_bootstrap_1.Dropdown.Menu, null,
                                        react_1.default.createElement(react_bootstrap_1.Dropdown.Item, { key: 'None', eventKey: '' }, "none"),
                                        layouts.map((layout) => {
                                            return react_1.default.createElement(react_bootstrap_1.Dropdown.Item, { key: layout, eventKey: layout }, layout);
                                        }))))))))));
    }
    let res = selectedLayout[0];
    return (react_1.default.createElement(react_bootstrap_1.Accordion.Item, { eventKey: 'layoutmap' },
        react_1.default.createElement(react_bootstrap_1.Accordion.Header, null, "Layout Mapping"),
        react_1.default.createElement(react_bootstrap_1.Accordion.Body, null,
            react_1.default.createElement(react_bootstrap_1.ListGroup, { variant: 'flush' },
                react_1.default.createElement(react_bootstrap_1.ListGroup.Item, null,
                    react_1.default.createElement(react_bootstrap_1.Row, null,
                        react_1.default.createElement(react_bootstrap_1.Col, { md: { span: 4 } },
                            react_1.default.createElement("p", null, "Layout Algorithm:")),
                        react_1.default.createElement(react_bootstrap_1.Col, { md: { span: 4 } },
                            react_1.default.createElement(react_bootstrap_1.Dropdown, { onSelect: (item) => {
                                    if (item === null) {
                                        return;
                                    }
                                    layoutSettingsDispatch({
                                        attribute: 'selectedLayout',
                                        value: item
                                    });
                                } },
                                react_1.default.createElement(react_bootstrap_1.Dropdown.Toggle, null, (layoutInfo === null || layoutInfo === void 0 ? void 0 : layoutInfo.selectedLayout) === '' ? 'none' : layoutInfo === null || layoutInfo === void 0 ? void 0 : layoutInfo.selectedLayout),
                                react_1.default.createElement(react_bootstrap_1.Dropdown.Menu, null,
                                    react_1.default.createElement(react_bootstrap_1.Dropdown.Item, { key: 'None', eventKey: '' }, "none"),
                                    layouts.map((layout) => {
                                        return react_1.default.createElement(react_bootstrap_1.Dropdown.Item, { key: layout, eventKey: layout }, layout);
                                    })))),
                        react_1.default.createElement(react_bootstrap_1.Col, { md: { span: 4 } },
                            react_1.default.createElement(react_bootstrap_1.OverlayTrigger, { key: 'title', placement: 'top', overlay: react_1.default.createElement(react_bootstrap_1.Tooltip, { id: `tooltip-title` }, res.description) },
                                react_1.default.createElement(react_bootstrap_1.Button, { variant: 'outline-secondary' }, "Info")))),
                    res.settings.map((setting) => {
                        return (react_1.default.createElement(react_bootstrap_1.Row, null,
                            react_1.default.createElement(react_bootstrap_1.Col, null,
                                react_1.default.createElement("p", null, setting.name)),
                            react_1.default.createElement(react_bootstrap_1.Col, null,
                                setting.type === 'number' &&
                                    react_1.default.createElement(react_bootstrap_1.Form.Control, { type: 'number', onChange: (e) => {
                                            layoutSettingsDispatch({
                                                attribute: 'property',
                                                key: setting.name,
                                                value: parseFloat(e.target.value)
                                            });
                                        }, value: setting.value, defaultValue: setting.defaultValue, placeholder: setting.defaultValue.toString() }),
                                setting.type === 'boolean' &&
                                    react_1.default.createElement(react_bootstrap_1.Dropdown, { onSelect: (item) => {
                                            if (item === null) {
                                                return;
                                            }
                                            layoutSettingsDispatch({
                                                attribute: 'property',
                                                key: setting.name,
                                                value: item === 'true'
                                            });
                                        } },
                                        react_1.default.createElement(react_bootstrap_1.Dropdown.Toggle, null, setting.value ? 'true' : 'false'),
                                        react_1.default.createElement(react_bootstrap_1.Dropdown.Menu, null,
                                            react_1.default.createElement(react_bootstrap_1.Dropdown.Item, { key: 'True', eventKey: 'true' }, "true"),
                                            react_1.default.createElement(react_bootstrap_1.Dropdown.Item, { key: 'False', eventKey: 'false' }, "false"))))));
                    }),
                    react_1.default.createElement(react_bootstrap_1.Row, null,
                        react_1.default.createElement(react_bootstrap_1.Col, { md: { offset: 8, span: 4 } },
                            react_1.default.createElement(react_bootstrap_1.Button, { variant: 'outline-primary', onClick: () => {
                                    api_service_1.API.setLayout(res);
                                } }, "Apply"))))))));
}
function MappingTab() {
    const { state } = (0, react_1.useContext)(main_component_1.UserDataContext);
    const { graphState, graphDispatch } = (0, react_1.useContext)(main_component_2.GraphDataContext);
    const [layoutSettingsState, layoutSettingsReducer] = (0, react_1.useReducer)(layoutsettings_reducer_1.LayoutSettingsReducer, null);
    (0, react_1.useEffect)(() => {
        if ((state === null || state === void 0 ? void 0 : state.layouts) === undefined) {
            return;
        }
        layoutSettingsReducer({
            attribute: 'layouts',
            value: state.layouts
        });
    }, [state === null || state === void 0 ? void 0 : state.layouts]);
    if (state === null || graphState == null || graphDispatch == null) {
        console.log('Something is null!');
        return react_1.default.createElement(react_1.default.Fragment, null);
    }
    if (state.layouts.length === 0) {
        api_service_1.API.getLayouts();
        return react_1.default.createElement(react_1.default.Fragment, null);
    }
    return (react_1.default.createElement(react_bootstrap_1.Accordion, { defaultActiveKey: 'nodemap', alwaysOpen: true },
        nodeMapping(graphState, graphDispatch),
        edgeMapping(graphState, graphDispatch),
        layoutMapping(state.layouts.map((layout) => { return layout.name; }), layoutSettingsState, layoutSettingsReducer)));
}
exports.default = MappingTab;
