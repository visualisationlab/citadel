require('dotenv').config({path:__dirname + '/../.env'})
import express, { RequestHandler, Request, Response } from 'express'
import { body } from 'express-validator'
import { WebSocket, WebSocketServer } from 'ws'
import { networkInterfaces } from 'os'
import { Session } from './session.class'
import { IncomingMessage } from 'http'
import uid from 'uid-safe'
import { rm, createWriteStream, unlink } from 'fs'
import { get } from 'http'
import { exit } from 'process'
import {GraphFormatConverter} from 'graph-format-converter'
import { createLogger, format, transports } from 'winston'

const path = require('path');
const cors = require('cors');
const fs = require('fs');

let localAddress = '';
let sessions: {[sid: string]: (Session | null)} = {}

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

if (process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console({
        format: format.combine(
            format.colorize(),
            format.simple()
        )
    }))
}

if (process.env.WSCLIENTPORT === undefined) {
    throw new Error('WSCLIENTPORT not set in ENV')
}

const nInterface = networkInterfaces()['wlp3s0'];

if (nInterface) {
    localAddress = nInterface.filter((entry) => {
        return entry.family === "IPv4";
    })[0].address
}
else {

    logger.log({
            level: 'error',
            message: 'Could not retrieve local networking interface',
            interfaces: networkInterfaces()})
    exit(1)
}

var app = express()

let corsOptions

if (localAddress !== '') {
    corsOptions = {
        origin: "http://" + localAddress + ":" + process.env.CLIENTPORT
    };
}
else {
    logger.log('error', 'Could not retrieve local address from networking interface')
    exit(1)
}

app.use(cors(corsOptions))

// Start websocket.
const server = new WebSocketServer({
    port: parseInt(process.env.WSCLIENTPORT),
    clientTracking: true,
    perMessageDeflate: true
})

/*
 * Websocket event handlers.
    */
server.on('connection', (socket: WebSocket, req: IncomingMessage) => {
    // If URL is not set in header, exit.
    if (req.url === undefined) {
        socket.close()
    }

    try {
        // Get sid/URL/key.
        const url = new URL(req.url!, `ws://${req.headers.host}`)
        const sid = url.searchParams.get('sid')
        const apiKey = url.searchParams.get('key')
        const headsetKey = url.searchParams.get('headsetKey')
        const headsetUserID = url.searchParams.get('userID')

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
            userID = session.addUser(socket)
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

server.on('close', () => {
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
}, 5000)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/../public')));

/*
 * Express routes.
    */
let getGraphs : RequestHandler = (_, res, next) => {
    fs.readdir("./public/graphs", (err: Error, graphs: string[]) => {
        if (err) {
            return next(err);
        }

        // res.locals.graphs = graphs.filter((filename) => {
        //     return path.parse(filename).ext.includes(".json")
        // })

        res.locals.graphs = graphs

        next()
    })
}

app.get('/graphs', getGraphs, (req: Request, res: Response) => {
    res.json(res.locals.graphs);
})

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
                get(url, (response) => {
                    let data = ''

                    response.on('data', (chunk) => {
                        data += chunk
                        file.write(chunk)
                    })

                    response.on('end', () => {
                        logger.log('info', `Downloaded ${url} to ${dest}`)

                        try {
                            const extension = url.split(/[#?]/)[0].split('.').pop().trim();

                            let json

                            if (extension === 'graphml') {
                                const graphmlInstance = GraphFormatConverter.fromGraphml(data);

                                json = graphmlInstance.toJson()
                            }
                            else {
                                json = JSON.parse(data)
                            }

                            const session = new Session(sid, ((sid) => {
                                sessions[sid] = null
                            }), url, json.nodes, json.edges, localAddress,
                                process.env.WSCLIENTPORT!, logger)

                            sessions[sid] = session

                        } catch (e) {
                            logger.log('error', `Error parsing graph from URL ${url}: ${e}`)
                            rm(dest, () => {})

                            sid = ''

                            return
                        }

                        file.close(() => res.json(sid))
                    })
                }).on('error', (err) => {
                    logger.log('error', `Error downloading graph from URL ${url}: ${err}`)
                    unlink(dest, (err) => {
                        if (err === null) {
                            return
                        }
                    })
                })
            } catch (e) {
                logger.log('error', `Error downloading graph from URL ${url}: ${e}`)
                unlink(dest, (err) => {
                    if (err === null) {
                        return
                    }

                })
            }
        })
    })
})

app.get('/ws', (req: Request, res: Response) => {
    res.json(server);
})

app.get('/')

logger.log({
    level: 'info',
    message: 'Server started succesfully',
    corsorigin: localAddress + ":" + process.env.CLIENTPORT,
    clientport: process.env.CLIENTPORT,
    serverport: process.env.SERVERPORT,
    websocket: process.env.WSCLIENTPORT
})

app.listen(process.env.SERVERPORT);

module.exports = app;
