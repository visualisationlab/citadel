import { WebSocketServer, WebSocket, RawData } from 'ws';
import cytoscape from 'cytoscape'
import uid from 'uid-safe'
import { IncomingMessage } from 'http';
import http from 'http'
import fs from 'fs'

type SessionData = {
    url: string,
    cy: cytoscape.Core,
}

type MessageType = 'init'
    | 'update'

interface Message {
    type: MessageType,
    sid: string,
    data: Object,
}

interface InitMessage extends Message {
    data: {
        url: string
    }
}

type Session = {
    sid: string,
    expirationDate: Date
}

if (process.env.WSCLIENTPORT === undefined) {
    throw new Error('WSCLIENTPORT not set in ENV')
}

const clientServer = new WebSocketServer({
    port: parseInt(process.env.WSCLIENTPORT),
    clientTracking: true,
})

let sessionData: {[sid: string]: SessionData} = {}
let sessions: Session[] = []

function onOpen(socket: WebSocket, req: IncomingMessage) {
    console.log(`New connection with IP ${req.socket.remoteAddress}`)

    uid(18, (err, string) => {
        if (err) throw err

        let date = new Date(Date.now())

        // Add one day.
        date.setDate(date.getDate() + 1)

        sessions.push({
            sid: string,
            expirationDate: date
        })
    })
}

function onClose(socket: WebSocket, req: IncomingMessage, code: number,
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
            const graph = JSON.parse(Buffer.from(data.toString()).toString()).parse()
        }
        catch (e) {
            console.error(e)

            return
        }
    })
}

function downloadGraph(sid: string, url: string) {
    let dest = `cache/${sid}`

    fs.rm(dest, () => {
        let file = fs.createWriteStream(dest)

        http.get(url, (response) => {
            response.pipe(file)

            file.on('finish', () => {
                file.close(() => readGraph(sid))
            })
        }).on('error', (err) => {
            fs.unlink(dest, (err) => {
                if (err === null) {
                    return
                }

                throw new Error(err.message)
            })

            throw new Error(err.message)
        })
    })
}

function parseMessage(message: Message) {
    switch (message.type) {
        case 'init':
            if (!message.data.hasOwnProperty('url')) {
                throw new Error('Message does not contain URL')
            }

            downloadGraph(message.sid, (message as InitMessage).data.url)
        default:
            throw new Error(`Unknown message type ${message.type}`)
    }
}

function onMessage(socket: WebSocket, data: RawData, isBinary: boolean) {
    if (isBinary) {
        throw new Error(`BINARY! HELP!`)
    }

    let message: Message | null = null

    // Attempt to parse data sent by a Unity client.
    try {
        message = JSON.parse(Buffer.from(data.toString()).toString()).parse()

        if (message === null) {
            throw new Error('Object is null')
        }

        if (!message.hasOwnProperty('type') || !message.hasOwnProperty('sid')
            || message.hasOwnProperty('data')) {

            throw new Error('One or more fields missing')
        }

        parseMessage(message)
    } catch (e) {
        console.log(`Error '${e}' when parsing message, closing...`)

        socket.close()

        return
    }
}

function onError(socket: WebSocket, req: IncomingMessage, err: Error) {
    console.log(`Error from client with IP ${req.socket.remoteAddress}: ${err}`)
}

clientServer.on('connection', (socket: WebSocket, req) => {
    socket.on('open', () => onOpen(socket, req))

    socket.on('close', (code, reason) => onClose(socket, req, code, reason))

    socket.on('message', (data, isBinary) => onMessage(socket, data, isBinary))

    socket.on('error', (err) => onError(socket, req, err))
})

clientServer.on('close', () => {
    console.log('Web Client server closed')
})

clientServer.on('error ', (error: Error) => {
    console.log(`Web Client server error: ${error}`)
})
