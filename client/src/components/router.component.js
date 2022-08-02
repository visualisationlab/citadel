"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = void 0;
let sessionDataDispatch = null;
let graphDataDispatch = null;
var Router;
(function (Router) {
    function setup(props) {
        sessionDataDispatch = props.sessionDataDispatch;
        graphDataDispatch = props.graphDataDispatch;
    }
    Router.setup = setup;
    function route(message) {
        if (!sessionDataDispatch || !graphDataDispatch) {
            return;
        }
        switch (message.type) {
            case 'data':
                const messageData = message.contents;
                const nodes = messageData.nodes.map((node) => {
                    return {
                        id: node.data.id,
                        x: node.position.x,
                        y: node.position.y,
                        attributes: node.data,
                        visualAttributes: {
                            radius: 16,
                            alpha: 1,
                            fillColour: [0, 1, 0],
                            edgeColour: [0, 1, 0]
                        }
                    };
                });
                if (messageData.edges === undefined) {
                    graphDataDispatch({
                        property: 'data',
                        type: 'set',
                        value: {
                            nodes: [...nodes],
                            edges: [],
                            directed: false
                        }
                    });
                    return;
                }
                const edges = messageData.edges.map((edge) => {
                    return {
                        id: edge.data.id,
                        source: edge.data.source,
                        target: edge.data.target,
                        attributes: edge.data,
                        visualAttributes: {
                            alpha: 1,
                            width: 10,
                            fillColour: [0, 0, 0],
                            edgeColour: [0, 0, 0]
                        }
                    };
                });
                graphDataDispatch({
                    property: 'data',
                    type: 'set',
                    value: {
                        nodes: [...nodes],
                        edges: [...edges],
                        directed: false
                    }
                });
                break;
            case 'info':
                sessionDataDispatch({ attribute: 'all', value: message.contents });
                break;
            case 'layouts':
                sessionDataDispatch({ attribute: 'layouts', value: message.contents });
        }
    }
    Router.route = route;
})(Router = exports.Router || (exports.Router = {}));
