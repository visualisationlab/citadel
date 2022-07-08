import { WebSocketServer, WebSocket, RawData } from 'ws';
import cytoscape from 'cytoscape'
import { IncomingMessage } from 'http';
import http from 'http'
import fs from 'fs'
import { parse } from 'url';
import { sessionData, updateSessions } from './sessions'
type MessageType = 'update'

interface Message {
    type: MessageType,
    sid: string,
    data: Object,
}

interface InitMessage extends Message {
    data: {
        json: Object
    }
}

if (process.env.WSCLIENTPORT === undefined) {
    throw new Error('WSCLIENTPORT not set in ENV')
}

export const server = new WebSocketServer({
    port: parseInt(process.env.WSCLIENTPORT),
    clientTracking: true,
})

export function onOpen(socket: WebSocket, req: IncomingMessage) {
    console.log(`New connection with IP ${req.socket.remoteAddress}`)

    if (req.url === undefined) {
        socket.close()
    }

    try {

        const url = new URL(req.url!, `ws://${req.headers.host}`)
        const sid = url.searchParams.get('sid')

        if (sid === null) {
            return
        }

        sessionData[sid].sockets.push(socket)

        console.log('registered socket')
        updateSessions(sid)
    } catch (e) {
        // IETS DOEN
    }
}

export function onClose(socket: WebSocket, req: IncomingMessage, code: number,
    reason: Buffer) {
    console.log(`Closed connection with IP ${req.socket.remoteAddress}: ${reason.toString()}`)
}

function readGraph(sid: string) {
    fs.readFile(`cache/${sid}`, 'utf8', (err, data) => {
        if (err) {
            console.error(err)

            return
        }

        try {
            const graph = JSON.parse(Buffer.from(data.toString()).toString())

            console.log(graph)
        }
        catch (e) {
            console.error(e)

            return
        }
    })
}

function parseMessage(message: Message) {
    return
    switch (message.type) {
        default:
            throw new Error(`Unknown message type ${message.type}`)
    }
}

export function onMessage(socket: WebSocket, data: RawData, isBinary: boolean) {
    if (isBinary) {
        throw new Error(`BINARY! HELP!`)
    }

    let message: Message | null = null

    try {
        message = JSON.parse(Buffer.from(data.toString()).toString())

        if (message === null) {
            throw new Error('Object is null')
        }

        if (!message.hasOwnProperty('type') || !message.hasOwnProperty('sid')
            || message.hasOwnProperty('data')) {

            // throw new Error('One or more fields missing')
        }

        parseMessage(message)
    } catch (e) {
        console.log(`Error '${e}' when parsing message`)

        // socket.close()

        return
    }
}

export function onError(socket: WebSocket, req: IncomingMessage, err: Error) {
    console.log(`Error from client with IP ${req.socket.remoteAddress}: ${err}`)
}


