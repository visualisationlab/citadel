// Handles Websocket communication between client and server.

import { Server } from 'http'
import { unpack, pack } from 'msgpackr'
import { VisGraph } from '../types'
import { Router } from '../components/router.component'
import { API } from '../services/api.service'

type Request =
    | 'info'

interface ClientMessage {
    type:   | 'transform'
            | 'get'
            | 'set',
    sid: string,
    contents: Object
}

export interface ServerMessage {
    type:   | 'data'
            | 'info'
            | 'layouts',
    contents: Object
}

interface TransformMessage extends ClientMessage {
    type: 'transform',
    contents: {
        x: number,
        y: number,
        k: number
    }
}

interface RequestMessage extends ClientMessage {
    type: 'get',
    contents: {
        type: Request
    }
}

interface DataMessage extends ServerMessage {
    type: 'data',
    contents: {
        nodes: VisGraph.CytoNode[]
        edges: VisGraph.CytoEdge[]
    }
}

interface InfoMessage extends ServerMessage {
    type: 'info',
    contents: {
        sid: string,
        expirationDate: Date,
        users: string[],
        graphURL: string
    }
}

// Websocket WSURL.
const WSURL = process.env.REACT_APP_WSURL + ':' +
    process.env.REACT_APP_WEBSOCKETPORT

class WebsocketService {
    ws: WebSocket | null = null
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
        const currentURL = new URL(window.location.href)

        const splitString = currentURL.pathname.split('/')

        if (splitString.length !== 3) {
            return
        }

        if (splitString[1] !== 'sessions' || (splitString[2].length === 0)) {
            return
        }

        this.connect(splitString[2])
    }

    parseServerMessage(message: ServerMessage) {
        Router.route(message)
    }

    connect(sid: string) {
        if (this.ws !== null) {
            this.ws.close()
        }

        this.ws = new WebSocket(`${WSURL}?sid=${sid}`)

        // Handles incoming messages from server.
        this.ws.onmessage = (msg) => {
            // console.log(msg.data)

            try {
                const messageData: ServerMessage = JSON.parse(msg.data)

                API.setSID(sid)

                this.parseServerMessage(messageData)
            } catch (e) {
                console.log(e)

                this.ws?.close()

                return
            }
            // (msg.data).then((buffer) => {
            //     console.log(buffer)
            //     // const decompressedData = unpack(new Uint8Array(buffer))

            //     // Attempt to parse data sent by a server.
            // })
        }
    }

    // Sends messages to server.
    sendMessage(message: ClientMessage) {
        if (this.ws === null) {
            return
        }

        if (this.ws.readyState === WebSocket.CLOSED
            || this.ws.readyState === WebSocket.CLOSING
            || this.ws.readyState === WebSocket.CONNECTING) {
            return
        }

        console.log('sending')
        this.ws.send(JSON.stringify(message))
    }

    requestInfo(message: RequestMessage) {
        this.sendMessage(message)
    }

    updateTransform(message: TransformMessage) {
        this.sendMessage(message);
    }
}

export const websocketService = new WebsocketService()
