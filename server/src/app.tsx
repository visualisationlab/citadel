/**
 * @author Miles van der Lely <m.vanderlely@uva.nl>
 *
 */

require('dotenv').config({path:__dirname + '/../.env'})

import express, { RequestHandler, Request, Response } from 'express'
import { body } from 'express-validator'
import { WebSocket, WebSocketServer } from 'ws'
import { IncomingMessage } from 'http'
import uid from 'uid-safe'
import { rm, createWriteStream, unlink } from 'fs'
import { Validator } from 'jsonschema'
import {GraphFormatConverter} from 'graph-format-converter'
import { createLogger, format, transports } from 'winston'
import https from 'https'

import { Session } from './session.class'

const path = require('path')
const cors = require('cors')
const fs = require('fs')

type ErrorPhase = 0 | 1 | 2 | 3 | 4 | 5 | 6

type ErrorMessage = {
    phase: ErrorPhase,
    errors: string[]
}

let sessions: {[sid: string]: (Session | null)} = {}

// Check if CHECK_INTERVAL is set in ENV.
if (process.env.CHECK_INTERVAL === undefined) {
    throw new Error('CHECK_INTERVAL not set in ENV')
}

let checkInterval = parseInt(process.env.CHECK_INTERVAL)

// Disable TLS certificate check. Only for development.
if (process.env.NODE_ENV !== 'production') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

// Check if HOST is set in ENV.
if (process.env.HOST == undefined || process.env.HOST == '') {
    throw new Error('HOST not set in ENV')
}

if (process.env.WSCLIENTPORT === undefined) {
    throw new Error('WSCLIENTPORT not set in ENV')
}

let defaultGraphURL: string | null = null

if (process.env.DEFAULT_GRAPH_URL !== undefined && process.env.DEFAULT_GRAPH_URL !== '') {
    defaultGraphURL = process.env.DEFAULT_GRAPH_URL
}

let localAddress = process.env.HOST

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({stack: true}),
    format.splat(),
    format.json(),
    ),
    defaultMeta: { service: 'visgraph-server' },
    transports: [
        new transports.File({ filename: 'quick-start-error.log', level: 'error' }),
        new transports.File({ filename: 'quick-start-combined.log' })
    ]
})

logger.add(new transports.Console({
    format: format.combine(
        format.colorize(),
        format.simple()
    )
}))

// Create express app.
var app = express()

// Set up CORS.
let corsOptions

corsOptions = {
    origin: "https://" + localAddress + ":" + process.env.CLIENTPORT
}

app.use(cors(corsOptions))

// Set up express app.
var httpsServer = https.createServer({
    key: fs.readFileSync(process.env["KEY"], 'utf8'),
    cert: fs.readFileSync(process.env["CERT"], 'utf8')
}, app)

const WSserver = new WebSocketServer({
    server: httpsServer,
    clientTracking: true,
    perMessageDeflate: true
})

/*
 * Websocket event handlers.
    */
WSserver.on('connection', (socket: WebSocket, req: IncomingMessage) => {
    // If URL is not set in header, exit.
    if (req.url === undefined) {
        socket.close()
    }

    try {
        // Get sid/URL/key.
        const url = new URL(req.url!, `wss://${req.headers.host}`)
        const sid = url.searchParams.get('sid')
        const apiKey = url.searchParams.get('key')
        const headsetKey = url.searchParams.get('headsetKey')
        const headsetUserID = url.searchParams.get('userID')
        const username = url.searchParams.get('username')

        const keyString = url.searchParams.get('keys')
        const keys = keyString ? parseInt(keyString) : 0

        logger.log('info', `New connection from ${req.socket.remoteAddress} with sid ${sid}, key ${apiKey}, headsetKey ${headsetKey}, headsetUserID ${headsetUserID}, username ${username}, keys ${keys}`)
        let userID: string | null = null

        if (sid === null) {
            socket.close()

            return
        }

        // If session doesn't exist, exit.
        if (sessions[sid] === undefined || sessions[sid] === null) {

            socket.close()

            return
        }

        // Store session.
        const session = sessions[sid]!

        // If apiKey is set, register simulator.
        if (apiKey) {
            session.registerSimulator(apiKey, socket)
        }
        else if (headsetKey && headsetUserID) {
            session.registerHeadset(headsetKey, headsetUserID, socket)
        }
        else {
            userID = session.addUser(socket, username, keys, req)

            logger.log('info', `User ${userID} joined session ${sid}`)
        }

        socket.on('close', (code, reason) => {
            if (sessions[sid] === undefined || sessions[sid] === null) {
                return
            }

            if (headsetKey) {
                session.removeHeadset(headsetKey)
            }

            if (apiKey) {
                session.deRegisterSimulator(apiKey)
            }

            if (userID) {
                session.removeUser(userID)
                return
            }
        })

        socket.on('message', (data, isBinary) => {
            if (isBinary) {
                throw new Error(`BINARY! HELP!`)
            }

            try {
                let message = JSON.parse(data.toString())

                if (message === null) {
                    throw new Error('Object is null')
                }


                if (sessions[message.sessionID] === null || sessions[message.sessionID] === undefined) {
                    logger.log('warn', "Received invalid message, closing connection")
                    socket.close()

                    return
                }

                session.addMessage(message)
            } catch (e) {
                logger.log('error', `Error '${e}' when parsing message`)

                return
            }
        })
    } catch (e) {
        socket.close()
    }
})

// Close all sessions when server is closed.
WSserver.on('close', () => {
    Object.keys(sessions).forEach((key) => {
        const session = sessions[key]

        if (session === null) {
            return
        }

        session.destroy()
    })
})

// Session checker.
setInterval(() => {
    Object.keys(sessions).filter((key) => {
        const session = sessions[key]

        if (session === null) {
            return false
        }

        return session.hasExpired()
    }).forEach((key) => {
        logger.log('info', `Session ${key} timed out`)

        sessions[key]!.destroy()
    })
}, checkInterval)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, '/../public')))

// Express routes.
let getGraphs : RequestHandler = (_, res, next) => {
    fs.readdir("./public/graphs", (err: Error, graphs: string[]) => {
        if (err) {
            return next(err);
        }

        // res.locals.graphs = graphs.filter((filename) => {
        //     return path.parse(filename).ext.includes(".json")
        // })

        res.locals.root = "https://" + localAddress + ":" + process.env.SERVERPORT + "/graphs/"
        res.locals.graphs = graphs

        next()
    })
}

app.get('/graphs', getGraphs, (req: Request, res: Response) => {
    res.json({graphs: res.locals.graphs, root: res.locals.root})
})

app.get('/status/:session', (req: Request, res: Response) => {
    res.send(
        sessions[req.params.session] !== undefined
    )
})

app.get('/keys/:session', (req: Request, res: Response) => {
    if (sessions[req.params.session] === undefined) {
        res.send("0")
        return
    }

    const remoteAddress = req.socket.remoteAddress

    if (remoteAddress === undefined) {
        res.send("0")

        return
    }

    res.send(sessions[req.params.session]!.getKeys(remoteAddress).toString())
})

var graphSchema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "type": "object",
    "description": "Network data",
    "properties": {
        "attributes": {
            "type": "object",
            "properties": {
                "edgeType": {
                    "type": "string"
                }
            },
            "required": [ "edgeType" ]
        },
        "nodes": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "id": {
                        "type": ["string", "integer"]
                    },
                    "attributes": {
                        "type": "object"
                    }
                },
                "required": ["id"]
            },
            "minItems": 1,
            "uniqueItems": true
        },
        "edges": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "source": {
                        "type": ["string", "integer"]
                    },
                    "target": {
                        "type": ["string", "integer"]
                    },
                    "attributes": {
                        "type": "object"
                    },
                    "id": {
                        "type": ["string", "integer"]
                    }
                },
                "required": ["source", "target", "attributes", "id"]
            },
            "minItems": 1,
            "uniqueItems": true
        }
    },
    "required": ["attributes", "nodes", "edges"]
}

function sendGraphError(res: Response, phase: ErrorPhase, errors: string[]) {
    logger.log('error', `Error in phase ${phase}: ${errors}`)
    res.status(400).json({phase: phase, errors: errors})
}

app.post('/urls', body('url').trim().unescape(),  (req, res) => {
    let url = req.body.url

    logger.log('info', `Received URL ${url}`)

    uid(4, (err, sid) => {
        if (err) throw err

        const dest = './cache/' + sid

        // Create session.
        rm(dest, () => {
            let file = createWriteStream(dest)

            try {
                new URL(url)
            } catch (e) {
                sendGraphError(res, 1, ["URL is not valid"])

                file.close()
                rm(dest, () => {})

                return
            }

            https.get(url, (response) => {
                let data = ''

                response.on('data', (chunk) => {
                    // Check for max size.
                    if (data.length > 10000000) {
                        sendGraphError(res, 2, ["File is too large"])

                        file.close()
                        rm(dest, () => {})
                        return
                    }

                    data += chunk
                    file.write(chunk)
                })

                response.on('end', () => {
                    logger.log('info', `Downloaded ${url} to ${dest}`)

                    try {
                        const extension = url.split(/[#?]/)[0].split('.').pop().trim();

                        let json

                        var validator = new Validator()

                        if (extension === 'graphml') {
                            const graphmlInstance = GraphFormatConverter.fromGraphml(data);

                            json = graphmlInstance.toJson()
                        }
                        else {
                            json = JSON.parse(data)
                        }

                        var vr = validator.validate(json, graphSchema)

                        if (!vr.valid) {
                            // logger.log('error', `Graph is not valid ${url}: ${vr.errors}`)

                            sendGraphError(res, 5, vr.errors.map((e) => e.message))
                            file.close()

                            rm(dest, () => {})
                            return
                        }

                        const session = new Session(sid, ((sid) => {
                            sessions[sid] = null
                        }), url, json.nodes, json.edges, localAddress,
                            process.env.WSCLIENTPORT!, logger)

                        sessions[sid] = session

                    } catch (e: any) {
                        sendGraphError(res, 4, [e.message])

                        // Delete cached file.
                        file.close()
                        rm(dest, () => {})

                        sid = ''

                        return
                    }

                    file.close(() => {
                        rm(dest, () => {}); res.json(sid)
                    })
                })

                response.on('error', (err: any) => {
                    // logger.log('error', `HTTP response error from ${url}: ${err}`)
                    // if (err instanceof Error) {
                    sendGraphError(res, 3, [err.message])

                    // res.status(404).json({msg: `HTTP response error from ${url}`, errors: []})
                })
            }).on('error', (err: any) => {
                // logger.log('error', `Error downloading graph from URL ${url}: ${err}`)

                sendGraphError(res, 2, err)
                // res.status(404).json({msg: "Error downloading graph data", errors: []})

                unlink(dest, (err) => {
                    if (err === null) {
                        return
                    }
                })
            })
        })
    })
})

app.get('/ws', (req: Request, res: Response) => {
    res.json(WSserver)
})

app.get('/')

logger.log({
    level: 'info',
    message: 'Server started succesfully',
    corsorigin: localAddress + ":" + process.env.CLIENTPORT,
    clientport: process.env.CLIENTPORT,
    serverport: process.env.SERVERPORT,
    websocket: process.env.WSCLIENTPORT,
    checkInterval: checkInterval,
    defaultGraphURL: defaultGraphURL
})

httpsServer.listen(process.env.SERVERPORT);

module.exports = app
