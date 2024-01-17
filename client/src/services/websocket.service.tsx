// Handles Websocket communication between client and server.

// import { VisGraph } from '../types'
// import { Cytograph } from "shared"
import { Router } from '../components/router.component'
import { API } from '../services/api.service'

import { MessageTypes } from '../components/router.component'

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

// Websocket WSURL.
const WSURL = process.env['REACT_APP_WSURL'] + ':' +
    process.env['REACT_APP_WEBSOCKETPORT']

// const WSURL = process.env.REACT_APP_WSURL + ':' +
//     process.env.REACT_APP_WEBSOCKETPORT

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
        const prevSessionsString = localStorage.getItem('prevSessions')
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

    parseServerMessage<T  extends keyof MessageTypes.MessageTypeMap>(message: MessageTypes.Message<T>) {
        Router.route(message)
    }

    connect<T  extends keyof MessageTypes.MessageTypeMap>(sid: string, username: string | null, keys: number | null) {
        if (this.ws !== null) {
            this.ws.close()
        }

        console.log(`${WSURL}?sid=${sid}${(username ? '&username=' + username : '') + '&keys=' + keys}`)

        this.ws = new WebSocket(`${WSURL}?sid=${sid}${(username ? '&username=' + username : '' ) + '&keys=' + keys}`)

        // Handles incoming messages from server.
        this.ws.onmessage = (msg) => {
            try {
                const messageData: MessageTypes.Message<T> = JSON.parse(msg.data)

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
    sendMessageToServer<T extends keyof MessageTypes.MessageTypeMap>(message: MessageTypes.Message<T>) {
        if (this.ws === null) {
            console.log('Websocket not initialized')
            return
        }

        if (this.ws.readyState === WebSocket.CLOSED
            || this.ws.readyState === WebSocket.CLOSING
            || this.ws.readyState === WebSocket.CONNECTING) {

            console.log('Websocket not ready')

            return
        }

        this.ws.send(JSON.stringify(message))
    }
}

export const websocketService = new WebsocketService()
