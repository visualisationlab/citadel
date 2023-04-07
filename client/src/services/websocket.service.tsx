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

export type SimulatorState = 'disconnected' | 'idle' | 'generating' | 'connecting'


export type Simulator = {
    readonly apikey: string | null,
    readonly userID: string,
    socket: WebSocket,
    params: any,
    state: SimulatorState,
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
        type: 'data' | 'session' | 'uid' | 'headset'
    }

    export interface InMessage {
        sessionID: string,
        userID: string,
        messageSource: 'simulator' | 'user'
        messageType: 'get' | 'set' | 'remove'
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
    export type SetType = 'graphState' | 'simulator' | 'simulatorInstance' | 'playstate' | 'stopSimulator'
        | 'layout' | 'username' | 'graphIndex' | 'headset' | 'windowSize' | 'pan' | 'validate'

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

    export interface RemoveMessage extends InMessage {
        messageSource: 'user'
        messageType: 'remove'
        userID: string,
        dataType: 'simulator'
        params: {
            apikey: string
        }
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
        data: string,
        keys: (string | null)[]
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

        if (splitString.length < 3) {
            return
        }

        if (splitString[1] !== 'sessions' || (splitString[2].length === 0)) {
            return
        }

        const keyString = currentURL.searchParams.get('keys')

        const keys = keyString ? parseInt(keyString) : null

        console.log(keys)

        // Store session ID in localstorage.
        let prevSessionsString = localStorage.getItem('prevSessions')
        let prevSessions: [string, Date][] = []

        if (prevSessionsString !== null) {
            prevSessions = JSON.parse(prevSessionsString)
        }

        if (!prevSessions.map(([val, _]) => {return val}).includes(splitString[2])) {
            prevSessions.unshift([splitString[2], new Date()])
        }

        localStorage.setItem('prevSessions', JSON.stringify(prevSessions.slice(0, 5)))

        // Get username from localstorage.
        const username = localStorage.getItem('username')

        this.connect(splitString[2], username, keys)
    }

    parseServerMessage(message: MessageTypes.OutMessage) {
        Router.route(message)
    }

    connect(sid: string, username: string | null, keys: number | null) {
        if (this.ws !== null) {
            this.ws.close()
        }

        console.log(`${WSURL}?sid=${sid}${(username ? '&username=' + username : '') + '&keys=' + keys}`)

        this.ws = new WebSocket(`${WSURL}?sid=${sid}${(username ? '&username=' + username : '' ) + '&keys=' + keys}`)

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

    sendRemoveMessage(message: MessageTypes.RemoveMessage) {
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
