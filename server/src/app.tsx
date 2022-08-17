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

const path = require('path');
const cors = require('cors');
const fs = require('fs');

let localAddress = '';
let sessions: {[sid: string]: (Session | null)} = {}

if (process.env.WSCLIENTPORT === undefined) {
    throw new Error('WSCLIENTPORT not set in ENV')
}

// Get IP.
const nInterface = networkInterfaces()['wlp3s0'];

if (nInterface) {
    localAddress = nInterface.filter((entry) => {
        return entry.family === "IPv4";
    })[0].address
}
else {
    console.log('Could not retrieve interface')
    exit(1)
}

var app = express()

let corsOptions

if (localAddress !== '') {
    console.log("Cors origin " + localAddress + ":" + process.env.CLIENTPORT);

    corsOptions = {
        origin: "http://" + localAddress + ":" + process.env.CLIENTPORT
    };
}
else {
    console.log('Could not retrieve local address')
    exit(1)
}

app.use(cors(corsOptions))

// Start websocket.
const server = new WebSocketServer({
    port: parseInt(process.env.WSCLIENTPORT),
    clientTracking: true,
    perMessageDeflate: true
})

// At new connection.
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
        else {
            userID = session.addUser(socket)
        }

        socket.on('close', (code, reason) => {
            if (sessions[sid] === undefined || sessions[sid] === null || (userID === null && apiKey === null)) {
                return
            }

            if (userID) {
                session.removeUser(userID)
                return
            }

            session.deRegisterSimulator(apiKey!)
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
                    console.log('CLOSING!')
                    socket.close()

                    return
                }

                session.addMessage(message)
            } catch (e) {
                console.log(`Error '${e}' when parsing message`)

                return
            }
        })
        // socket.on('error', (err) => onError(socket, req, err))
    } catch (e) {
        console.log(e)

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

setInterval(() => {
    Object.keys(sessions).filter((key) => {
        const session = sessions[key]

        if (session === null) {
            return false
        }

        return session.hasExpired()
    }).forEach((key) => {
        console.log(`CLOSING SESSION ${key}`)
        sessions[key]!.destroy()
    })
}, 5000)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/../public')));

let getGraphs : RequestHandler = (_, res, next) => {
    fs.readdir("./public/graphs", (err: Error, graphs: string[]) => {
        if (err) {
            return next(err);
        }

        res.locals.graphs = graphs.filter((filename) => {
            return path.parse(filename).ext.includes(".json")
        })

        next()
    })
}

// Potential problem: Malicious user could repeatedly call function and
// slow down server with IO calls. Solution could be storing file list,
// but that would mean server would have to restart when updating graph list.
// Update call: same problem.
app.get('/graphs', getGraphs, (req: Request, res: Response) => {
    res.json(res.locals.graphs);
})

app.post('/urls', body('url').trim().unescape(),  (req, res) => {
    let url = req.body.url

    uid(4, (err, sid) => {
        if (err) throw err

        const dest = './cache/' + sid

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
                        try {

                            const json = JSON.parse(data)

                            const session = new Session(sid, ((sid) => {
                                sessions[sid] = null
                            }), url, json.nodes, json.edges, localAddress)

                            sessions[sid] = session

                        } catch (e) {
                            console.error(e)
                            rm(dest, () => {})

                            sid = ''

                            return
                        }

                        console.log(`Started new session with SID ${sid}`)
                        file.close(() => res.json(sid))
                    })
                }).on('error', (err) => {
                    unlink(dest, (err) => {
                        if (err === null) {
                            return
                        }

                        // throw new Error(err.message)
                    })

                    // throw new Error(err.message)
                })
            } catch (e) {
                // console.log(e)
            }
        })
    })
})

app.get('/ws', (req: Request, res: Response) => {
    res.json(server);
})

app.get('/')

console.log("Expecting client to run on port: " + process.env.CLIENTPORT);
console.log("Running server on port: " + process.env.SERVERPORT);
console.log("Running Unity websocket on port: " + process.env.WSUNITYPORT);
console.log("Running client websocket on port: " + process.env.WSCLIENTPORT);

app.listen(process.env.SERVERPORT);

module.exports = app;
