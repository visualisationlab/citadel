import { WebSocketServer, WebSocket, RawData } from 'ws';
import cytoscape from 'cytoscape'
import { IncomingMessage } from 'http'
import http from 'http'
import fs from 'fs'
import { parse } from 'url'
import { pack, unpack } from 'msgpackr'
import { Session } from './sessions'
import uid from 'uid-safe'

type User = {
    socket: WebSocket,
    user: string,
    apiKey: string
}

type API = {
    socket: WebSocket,
    apiKey: string
}

type Sockets = {[sid: string]: {users: User[], apis: API[]} | null}

export interface ClientMessage {
    type:   | 'set'
            | 'get',
    sid: string,
    contents: Object
}

export interface APIMessage {
    sid: string,
    nodes: JSON,
    edges: JSON,
    params: {[key: string]: number}
}

export interface GetMessage {
    type: 'get',
    sid: string,
    contents: {
        attribute:
            | 'info'
            | 'layouts'
    }
}

export interface SetMessage {
    type: 'set',
    sid: string,
    contents: {
        attribute: 'layout' | 'data' | 'sim',
        value: any
    }
}

export interface ServerMessage {
    type:   | 'data'
            | 'info'
            | 'layouts',
    contents: Object
}


if (process.env.WSCLIENTPORT === undefined) {
    throw new Error('WSCLIENTPORT not set in ENV')
}

export const server = new WebSocketServer({
    port: parseInt(process.env.WSCLIENTPORT),
    clientTracking: true,
    perMessageDeflate: true
})

let userData: Sockets = {}

export function genSocketSession(sid: string) {
    userData[sid] = {users: [], apis: []}
}

export function closeSession(sid: string) {
    console.log(`Closing sockets for session ${sid}`)

    if (userData[sid] === null) {
        return
    }

    userData[sid]?.users.forEach((user) => {
        if (user.socket.readyState === user.socket.CLOSED || user.socket.readyState === user.socket.CLOSING) {
            return
        }

        user.socket.close()
    })

    userData[sid]?.apis.forEach((api) => {
        if (api.socket.readyState === api.socket.CLOSED || api.socket.readyState === api.socket.CLOSING) {
            return
        }

        api.socket.close()
    })

    userData[sid] = null
}

export function sendAPIMessage(message: APIMessage, key: string, sid: string) {
    const sockets = getAPISocket(sid, key)

    if (sockets === undefined || sockets.length === 0) {
        return
    }

    console.log('Sending')

    sockets[0].socket.send(JSON.stringify(message))
}

export function sendMessage(message: ServerMessage, sid: string) {
    const sockets = getSockets(sid)

    console.log(`Sending updates to ${sockets.length} clients`)

    sockets.forEach((socket) => {
        if (socket.readyState === socket.CLOSED || socket.readyState === socket.CLOSING) {
            return
        }

        socket.send(JSON.stringify(message))
    })
}

function getAPISocket(sid: string, key: string) {
    if (userData[sid] === null) {
        return []
    }

    return userData[sid]?.apis.filter((api) => {
        return ((api.socket.readyState !== api.socket.CLOSED
                && api.socket.readyState !== api.socket.CLOSING))
    })
}

function getSockets(sid: string): WebSocket[] {
    if (userData[sid] === null) {
        return []
    }

    const activeSockets = userData[sid]?.users.filter((user) => {
        return (user.socket.readyState !== user.socket.CLOSED && user.socket.readyState !== user.socket.CLOSING)
    })

    if (activeSockets === undefined) {
        return []
    }

    userData[sid]!.users = activeSockets

    return activeSockets.map((user) => (user.socket))
}

function registerUser(socket: WebSocket, req: IncomingMessage, sid: string): ('user' | null) {
    const userName =  'User ' + userData[sid]?.users.length

    uid(4, (err, key) => {
        if (err) throw err

        userData[sid]?.users.push({socket: socket, user: userName, apiKey: key})

        console.log(`Registered new user ${req.socket.remoteAddress} with key ${key}`)

        const graphData = Session.getGraphData(sid)
        const sessionInfo = Session.getInfo(sid)

        if (graphData === null || sessionInfo === null) {
            closeSession(sid)

            return null
        }

        sendMessage({
            type: 'data',
            contents: graphData
        }, sid)

        sendMessage({
            type: 'info',
            contents: {...sessionInfo, userName: userName, users: userData[sid]?.users
                .map((userData) => {return userData.user})}
        }, sid)
    })

    return 'user'
}

function registerAPI(socket: WebSocket, req: IncomingMessage, sid: string, key: string): ('api' | null) {
    const sessionUserData = userData[sid]

    if (sessionUserData?.users.filter((userData) => {
        return (userData.apiKey === key)
    }).length === 0) {
        console.log(`Unknown API key`)

        socket.close()

        return null
    }

    userData[sid]?.apis.push({socket: socket, apiKey: key})

    Session.registerSim(sid, {})

    console.log(`Registered API`)

    return 'api'
}

export function onOpen(socket: WebSocket, req: IncomingMessage): ('user' | 'api' | null) {
    if (req.url === undefined) {
        socket.close()
    }

    try {
        const url = new URL(req.url!, `ws://${req.headers.host}`)
        const sid = url.searchParams.get('sid')

        const apiKey = url.searchParams.get('key')

        if (sid === null) {
            socket.close()

            return null
        }

        let session = Session.getSessionData(sid)

        if (session == null) {
            console.log(`User attempted to connect to unknown session ${sid}`)

            socket.close()

            return null
        }

        // if (!(Object.keys(session).includes(sid))) {
        // }

        if (userData[sid] === null) {
            socket.close()

            return null
        }

        if (apiKey !== null) {
            return registerAPI(socket, req, sid, apiKey)
        }

        return registerUser(socket, req, sid)
    } catch (e) {
        console.log(e)

        return null
    }
}

export function onClose(socket: WebSocket, req: IncomingMessage, code: number,
    reason: Buffer) {

    console.log(`Closed connection with IP ${req.socket.remoteAddress}: ${reason.toString()}`)
}

function parseUserMessage(message: ClientMessage) {
    try {
        const outMessage = Session.parseUserMessage(message)

        if (outMessage === null) {
            return
        }

        sendMessage(outMessage, message.sid)
    }
    catch (e) {
        closeSession(message.sid)
    }
}

export function onMessage(socket: WebSocket, type: 'user' | 'api', data: RawData, isBinary: boolean) {
    if (isBinary) {
        throw new Error(`BINARY! HELP!`)
    }

    let message: ClientMessage | APIMessage | null = null

    try {
        message = JSON.parse(data.toString())

        if (message === null) {
            throw new Error('Object is null')
        }

        if (userData[message.sid] === null) {
            throw new Error('Session does not exist')
        }

        switch (type) {
            case 'api':

                Session.parseAPIMessage(message as APIMessage)
                return
            case 'user':
                parseUserMessage(message as ClientMessage)
                return
        }


        throw new Error('Unknown socket')
    } catch (e) {
        console.log(`Error '${e}' when parsing message`)

        return
    }
}

export function onError(socket: WebSocket, req: IncomingMessage, err: Error) {
    console.log(`Error from client with IP ${req.socket.remoteAddress}: ${err}`)
}


