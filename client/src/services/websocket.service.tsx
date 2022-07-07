import {GraphComponent} from '../types/types';
// Handles Websocket communication between client and server.

import queue from 'queue'

export enum MessageType {
    ERROR,
    INITIAL,
    UPDATE,
    SUCCESS,
    CONNECT,
    CLEAR,
    DELETE
}

// Websocket URL.
const URL = process.env.REACT_APP_WSURL + ':' +
    process.env.REACT_APP_WEBSOCKETPORT;

const MAX_QUEUE_LENGTH = 3;

class WebsocketService {
    sessionID: number = -1;
    ws: WebSocket = new WebSocket(URL);
    nodes: GraphComponent.NodeDict = {};
    transform: GraphComponent.Transform = {'k': 1, 'x': 0, 'y': 0};
    graphName: string = "";
    width: number = window.innerWidth;
    height: number = window.innerHeight - 56;

    q = queue({timeout: 30, concurrency: 1});

    constructor() {
        this.q.start();

        let self = this;

        // Handles incoming messages from server.
        this.ws.onmessage = function(msg) {
            let messageData = null;

            // Attempt to parse data sent by a server.
            try {
                messageData = JSON.parse(msg.data);
            } catch (e) {
                console.log(e)

                return;
            }

            if (messageData.type === MessageType.CONNECT) {
                self.sessionID = messageData.id;
            } else if (messageData.type === MessageType.INITIAL) {
                // If the client has not yet selected a graph, send a CLEAR message.
                if (self.nodes === null) {
                    self.sendMessage("", MessageType.CLEAR);

                    return;
                }

                self.sendMessage(JSON.stringify(self.nodes), MessageType.INITIAL);
            }
        };

        // Request a new ID when socket is opened.
        this.ws.onopen = function() {
            this.send(JSON.stringify({
                type: MessageType.CONNECT,
                content: ""
            }));
        };
    }

    deleteNode(id: string) {
        delete this.nodes[id];

        this.sendMessage(id, MessageType.DELETE);
    }

    // Sends messages to server.
    sendMessage(content: string, type: MessageType) {
        if (this.ws.readyState === WebSocket.CLOSED || this.ws.readyState === WebSocket.CONNECTING) {
            // console.log("NOT SENDING");
            return;
        }

        if (this.sessionID === -1 &&
            type !== MessageType.CONNECT) {

            console.log("No session ID from server.");
        }

        // TODO: COPY TYPE DEF TO SERVER
        this.ws.send(JSON.stringify({
            type: type,
            id: this.sessionID,
            content: content,
            graphName: this.graphName,
            width: this.width,
            height: this.height,
            transform: this.transform
        }));
    }


    // Clears the state, sends a clear message to server.
    clearGraphState() {
        this.nodes = {};
        this.graphName = ""

        this.sendMessage("", MessageType.CLEAR);
    }

    updateGraphTransform(transform: GraphComponent.Transform) {
        this.transform = {
            x: transform.x,
            y: transform.y,
            k: transform.k
        };

        this.sendMessage("", MessageType.UPDATE);
    }

    // Updates the local state, sends an update message to server.
    updateGraphState(nodes: GraphComponent.GraphNode[], graphName: string) {
        let type = MessageType.UPDATE;

        if (Object.keys(this.nodes).length === 0) {
            type = MessageType.INITIAL;
        }

        this.graphName = graphName;

        if (this.q.length > MAX_QUEUE_LENGTH) {
            this.q.pop();
        }

        this.q.push(
            () => {
                this.nodes = {};

            nodes.forEach((node) => {
                this.nodes[node.id] = node
            }); this.sendMessage(JSON.stringify(this.nodes), type);}
        )

        this.q.start();
    }

    updateWindowSize(width: number, height: number) {
        this.width = width;
        this.height = height;

        this.sendMessage("", MessageType.UPDATE);
    }
}

export const websocketService = new WebsocketService();
