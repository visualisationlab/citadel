"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.API = void 0;
const websocket_service_1 = require("./websocket.service");
var API;
(function (API) {
    let sid = null;
    function setSID(newSID) {
        sid = newSID;
    }
    API.setSID = setSID;
    function step() {
        if (sid === null) {
            return;
        }
        websocket_service_1.websocketService.sendMessage({
            type: 'set',
            contents: {
                attribute: 'sim',
                value: 1
            },
            sid: sid
        });
    }
    API.step = step;
    function updateGraph(graphState) {
        if (sid === null) {
            return;
        }
        const nodes = graphState.nodes.data.map((node) => {
            return {
                position: {
                    x: node.x,
                    y: node.y,
                },
                data: Object.assign(Object.assign({}, node.attributes), { id: node.id }),
            };
        });
        const edges = graphState.edges.data.map((edge) => {
            return {
                data: Object.assign(Object.assign({}, edge.attributes), { source: edge.source, target: edge.target, id: edge.attributes.id })
            };
        });
        websocket_service_1.websocketService.sendMessage({
            type: 'set',
            contents: {
                attribute: 'data',
                value: {
                    nodes: nodes,
                    edges: edges
                }
            },
            sid: sid
        });
    }
    API.updateGraph = updateGraph;
    function updateUsername(name) {
        if (sid === null) {
            return;
        }
        if (name === '') {
            return;
        }
        console.log(`Updating username`);
        websocket_service_1.websocketService.sendMessage({
            type: 'set',
            contents: {
                attribute: 'username',
                value: name
            },
            sid: sid
        });
    }
    API.updateUsername = updateUsername;
    function getInfo() {
        if (sid === null) {
            return;
        }
        console.log(`Getting info`);
        websocket_service_1.websocketService.sendMessage({
            type: 'get',
            contents: {
                attribute: 'info'
            },
            sid: sid
        });
    }
    API.getInfo = getInfo;
    function getLayouts() {
        if (sid === null) {
            return;
        }
        console.log(`Getting layout`);
        websocket_service_1.websocketService.sendMessage({
            type: 'get',
            contents: {
                attribute: 'layouts'
            },
            sid: sid
        });
    }
    API.getLayouts = getLayouts;
    function setLayout(layout) {
        if (sid === null) {
            return;
        }
        console.log(`Setting layout`);
        let res = {};
        layout.settings.forEach((setting) => {
            if (setting.type === 'number' && setting.value === 0) {
                return;
            }
            res[setting.name] = setting.value;
        });
        websocket_service_1.websocketService.sendMessage({
            type: 'set',
            contents: {
                attribute: 'layout',
                value: {
                    settings: { name: layout.name, settings: res }
                }
            },
            sid: sid
        });
    }
    API.setLayout = setLayout;
})(API = exports.API || (exports.API = {}));
