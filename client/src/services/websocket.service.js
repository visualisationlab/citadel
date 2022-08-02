"use strict";
// Handles Websocket communication between client and server.
Object.defineProperty(exports, "__esModule", { value: true });
exports.websocketService = void 0;
const router_component_1 = require("../components/router.component");
const api_service_1 = require("../services/api.service");
// Websocket WSURL.
const WSURL = process.env.REACT_APP_WSURL + ':' +
    process.env.REACT_APP_WEBSOCKETPORT;
class WebsocketService {
    constructor() {
        this.ws = null;
    }
    // transform: VisGraph.Transform = {'k': 1, 'x': 0, 'y': 0}
    // width: number = window.innerWidth
    // height: number = window.innerHeight
    // sid: string | null = null
    // updateFunction: ((nodes: VisGraph.GraphNode[], edges: VisGraph.Edge[]) => void) | null = null
    // sidUpdateFunction: ((sid: string) => (void)) | null = null
    // setGraphUpdateFunction(fun: (nodes: VisGraph.GraphNode[], edges: VisGraph.Edge[]) => void) {
    //     this.updateFunction = fun
    //     this.ws?.close()
    //     this.ws = null
    //     this.checkConnection()
    // }
    // setSidUpdateFunction(fun: (sid: string) => (void)) {
    //     this.sidUpdateFunction = fun
    //     if (this.sid === null) {
    //         return
    //     }
    //     this.requestInfo({
    //         type: 'request',
    //         contents: {
    //             type: 'info'
    //         },
    //         sid: this.sid
    //     })
    // }
    checkConnection() {
        const currentURL = new URL(window.location.href);
        const splitString = currentURL.pathname.split('/');
        if (splitString.length !== 3) {
            return;
        }
        if (splitString[1] !== 'sessions' || (splitString[2].length === 0)) {
            return;
        }
        this.connect(splitString[2]);
    }
    parseServerMessage(message) {
        router_component_1.Router.route(message);
    }
    connect(sid) {
        if (this.ws !== null) {
            this.ws.close();
        }
        this.ws = new WebSocket(`${WSURL}?sid=${sid}`);
        // Handles incoming messages from server.
        this.ws.onmessage = (msg) => {
            // console.log(msg.data)
            var _a;
            try {
                const messageData = JSON.parse(msg.data);
                api_service_1.API.setSID(sid);
                this.parseServerMessage(messageData);
            }
            catch (e) {
                console.log(e);
                (_a = this.ws) === null || _a === void 0 ? void 0 : _a.close();
                return;
            }
            // (msg.data).then((buffer) => {
            //     console.log(buffer)
            //     // const decompressedData = unpack(new Uint8Array(buffer))
            //     // Attempt to parse data sent by a server.
            // })
        };
    }
    // Sends messages to server.
    sendMessage(message) {
        if (this.ws === null) {
            return;
        }
        if (this.ws.readyState === WebSocket.CLOSED
            || this.ws.readyState === WebSocket.CLOSING
            || this.ws.readyState === WebSocket.CONNECTING) {
            return;
        }
        console.log('sending');
        this.ws.send(JSON.stringify(message));
    }
    requestInfo(message) {
        this.sendMessage(message);
    }
    updateTransform(message) {
        this.sendMessage(message);
    }
}
exports.websocketService = new WebsocketService();
