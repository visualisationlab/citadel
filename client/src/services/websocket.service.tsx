// Handles Websocket communication between client and server.

import { VisGraph } from '../types'
import { Router } from '../components/router.component'
import { API } from '../services/api.service'

export type LayoutSetting =
    |   {
            name: string,
            description: string,
            type: 'number',
            defaultValue: number
        }
    |   {
            name: string,
            description: string,
            type: 'boolean',
            defaultValue: boolean
        }

export interface LayoutInfo {
    name: string,
    description: string,
    link: string,
    settings: LayoutSetting[]
}

type Simulator = {
    readonly apikey: string | null,
    readonly userID: string,
    socket: WebSocket,
    params: any,
    state: 'disconnected' | 'idle' | 'generating'
}

export module MessageTypes {
    type SessionState = 'idle' | 'busy'

    export type CloseReason =
        | {code: 1001, reason: 'Session end'}
        | {code: 1002, reason: 'Protocol error'}
        | {code: 1003, reason: 'Unsupported data'}
        | {code: 1004, reason: 'Session timeout'}

    export interface OutMessage {
        sessionID: string,
        sessionState: SessionState,
        type: 'data' | 'session' | 'uid'
    }

    export interface InMessage {
        sessionID: string,
        userID: string,
        messageSource: 'simulator' | 'user'
        messageType: 'get' | 'set'
        apiKey?: string
        data?: any
        dataType?: any
    }

    export interface SimulatorMessage {
        sessionID: string,
        apiKey: string,
        messageSource: 'simulator',
        data: {
            nodes: any,
            edges: any,
            params: any
        }
    }

    export type GetType = 'graphState' | 'sessionState' | 'layouts' | 'apiKey' | 'QR'
    export type SetType = 'graphState' | 'simulator' | 'simulatorInstance' | 'layout' | 'username' | 'graphIndex'

    export interface GetMessage extends InMessage {
        messageSource: 'user'
        messageType: 'get'
        userID: string,
        dataType: GetType
    }

    export interface SetMessage extends InMessage {
        messageSource: 'user'
        messageType: 'set'
        userID: string,
        dataType: SetType
        params: any
    }

    export interface SetSimulatorMessage extends InMessage {
        messageSource: 'user'
        messageType: 'set'
        userID: string,
        dataType: 'simulator'
        params: {
            stepCount: number,
            apikey: string
        }
    }

    export interface SetSimulatorInstanceMessage extends InMessage {
        messageSource: 'user'
        messageType: 'set'
        userID: string,
        dataType: 'simulatorInstance'
    }

    export interface SessionStateMessage extends OutMessage {
        userID: string,
        type: 'session',
        data: {
            url: string,
            users: {

            },
            simulators: Simulator[],
            layoutInfo: LayoutInfo[]
        }
    }

    export interface DataStateMessage extends OutMessage {
        type: 'data',
        data: {
            nodes: any
            edges: any
        }
    }

    export interface UIDMessage extends OutMessage {
        type: 'uid',
        data: string
    }
}

// Websocket WSURL.
const WSURL = process.env.REACT_APP_WSURL + ':' +
    process.env.REACT_APP_WEBSOCKETPORT

class WebsocketService {
    ws: WebSocket | null = null

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

    parseServerMessage(message: MessageTypes.OutMessage) {
        Router.route(message)
    }

    connect(sid: string) {
        if (this.ws !== null) {
            this.ws.close()
        }

        this.ws = new WebSocket(`${WSURL}?sid=${sid}`)

        // Handles incoming messages from server.
        this.ws.onmessage = (msg) => {

            try {
                const messageData: MessageTypes.OutMessage = JSON.parse(msg.data)

                API.setSID(sid)

                this.parseServerMessage(messageData)
            } catch (e) {
                console.log(e)

                this.ws?.close()

                return
            }
        }

        this.ws.onclose = (() => {
            Router.setState('disconnected')
        })
    }

    // Sends messages to server.
    sendSetMessage(message: MessageTypes.SetMessage) {
        if (this.ws === null) {
            return
        }

        if (this.ws.readyState === WebSocket.CLOSED
            || this.ws.readyState === WebSocket.CLOSING
            || this.ws.readyState === WebSocket.CONNECTING) {
            return
        }

        console.log('here')

        this.ws.send(JSON.stringify(message))
    }

    sendGetMessage(message: MessageTypes.GetMessage) {
        if (this.ws === null) {
            return
        }

        if (this.ws.readyState === WebSocket.CLOSED
            || this.ws.readyState === WebSocket.CLOSING
            || this.ws.readyState === WebSocket.CONNECTING) {
            return
        }

        this.ws.send(JSON.stringify(message))
    }
}

export const websocketService = new WebsocketService()
