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

const path = require('path');
const cors = require('cors');
const fs = require('fs');

// import { server, onOpen, onClose, onMessage, onError } from './socket'

if (process.env.WSCLIENTPORT === undefined) {
    throw new Error('WSCLIENTPORT not set in ENV')
}

const server = new WebSocketServer({
    port: parseInt(process.env.WSCLIENTPORT),
    clientTracking: true,
    perMessageDeflate: true
})

let sessions: {[sid: string]: (Session | null)} = {}

server.on('connection', (socket: WebSocket, req: IncomingMessage) => {
    if (req.url === undefined) {
        socket.close()
    }

    try {
        const url = new URL(req.url!, `ws://${req.headers.host}`)
        const sid = url.searchParams.get('sid')

        const apiKey = url.searchParams.get('key')

        let userID: string | null = null

        if (sid === null) {
            socket.close()

            return
        }

        if (sessions[sid] === undefined || sessions[sid] === null) {

            socket.close()

            return
        }

        const session = sessions[sid]!

        if (apiKey !== null) {
            session.registerSimulator(apiKey, socket)
        }
        else {
            userID = session.addUser(socket)
        }

        socket.on('close', (code, reason) => {
            console.log(code)
            console.log(reason)
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

                console.log(message)

                if (message === null) {
                    throw new Error('Object is null')
                }


                if (sessions[message.sid] === null || sessions[message.sid] === undefined) {
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

const nInterface = networkInterfaces()['wlp3s0'];

let localAddress = '';

if (nInterface) {
    localAddress = nInterface.filter((entry) => {
        return entry.family === "IPv4";
    })[0].address
}

enum MessageType {
    ERROR,
    INITIAL,
    UPDATE,
    SUCCESS,
    CONNECT,
    CLEAR,
    DELETE
}

let idCounter = 1

type sessionID = number
type socketContainer = { [name: sessionID]: WebSocket}

type Packet = {
    type: MessageType,
    content: string,
    id: sessionID,
}

// Stores session ID and corresponding sockets.
let unitySessions: socketContainer = {};
let clientSessions: socketContainer = {};

function logMessage(session: sessionID, message: string) {
    var currentDate = new Date();

    let dateString = ('0' + currentDate.getHours()).slice(-2) + ":"
        + ('0' + currentDate.getMinutes()).slice(-2) + ":"
        + ('0' + currentDate.getSeconds()).slice(-2);

    console.log("[" + dateString + ", " + ('00' + session).slice(-3) + "] " + message);
}

function sendPacket(socket: WebSocket, packet: Packet): void {
    logMessage(packet.id, packet.type.toString());

    socket.send(JSON.stringify(packet));
}

// unityServer.on("connection", (socket: WebSocket) => {
//     // Require a connection with ID message.
//     socket.on("message", (data) => {
//         let unityData = null;

//         // Attempt to parse data sent by a Unity client.
//         try {
//             unityData = JSON.parse(Buffer.from(data.toString()).toString());
//         } catch (e) {
//             console.log(e)

//             socket.close();
//             return;
//         }

//         // Check if ID matches.
//         if (!Object.keys(clientSessions).includes(unityData.id.toString()) &&
//             unityData.id !== 0) {

//             sendPacket(socket, {
//                 type: MessageType.ERROR,
//                 content: "Client ID does not exist.",
//                 id: 0
//             });

//             socket.close();

//             return;
//         } else if (unityData.id == 0) {
//             unityData.id = idCounter - 1;
//             logMessage(idCounter - 1, "ID defaulting to most recent session");
//         }

//         // Check if ID is already being used by Unity session.
//         /*if (Object.keys(unitySessions).includes(unityData.id.toString())) {
//             socket.send(JSON.stringify({
//                 type: messageType.ERROR,
//                 content: "Session already in use.",
//                 id: -1
//             }));

//             socket.close();
//             return;
//         }*/

//         sendPacket(socket, {
//             type: MessageType.SUCCESS,
//             content: "Connected to client with session ID " + unityData.id,
//             id: unityData.id
//         });

//         unitySessions[unityData.id] = socket;

//         sendPacket(clientSessions[unityData.id], {
//             type: MessageType.INITIAL,
//             content: "",
//             id: unityData.id
//         });
//     });

//     socket.on("close", () => {
//         logMessage(0, "Connection to Unity socket closed")
//     });
// });

// Handles connection with client instances.
// clientServer.on("connection", (socket: WebSocket) => {
//     let myId = 0;

//     socket.on("message", (data) => {
//         let clientData = null;

//         try {
//             clientData = JSON.parse(Buffer.from(data.toString()).toString());
//         } catch (e) {
//             console.log("Error parsing data.");

//             socket.close();
//             return;
//         }

//         // If client tries to connect, give it a new ID and store session.
//         if (clientData.type == MessageType.CONNECT) {
//             sendPacket(socket, {
//                 type: MessageType.CONNECT,
//                 content: "",
//                 id: idCounter
//             })

//             myId = idCounter;

//             clientSessions[idCounter] = socket;

//             idCounter++;

//             return;
//         }

//         if (!Object.keys(clientSessions).includes(clientData.id.toString())) {
//             sendPacket(socket, {
//                 type: MessageType.ERROR,
//                 id: clientData.id,
//                 content: "Session ID not in use.",
//             })

//             socket.close();
//             return;
//         }

//         switch (clientData.type) {
//             case MessageType.INITIAL:
//                 logMessage(clientData.id, "Received initial state from client");
//                 break;
//             case MessageType.UPDATE:
//                 // logMessage(clientData.id, "Received updated state from client.");
//                 break;
//             case MessageType.DELETE:
//                 logMessage(clientData.id, "Deleting node " + clientData.content);
//                 break;
//             case MessageType.CLEAR:
//                 logMessage(clientData.id, "Received clear state from client");
//                 break;
//             default:
//                 break;
//         }

//         if (Object.keys(unitySessions).includes(clientData.id.toString())) {
//             unitySessions[clientData.id].send(JSON.stringify(clientData));
//         }
//     });

//     socket.on("close", () => {
//         delete clientSessions[myId];

//         logMessage(myId, "Client disconnected")
//         // TODO: send disconnect message to unity sessions.
//     });
// });

// Check if graphs need to be converted.
// fs.readdir("./public/graphs", (err: Error, files: File[]) => {
//     if (err)
//         throw new Error(err.message)

//     files.forEach(file => {
//         var parsefile = path.parse(file);

//         // If file is in graphml format, convert it to JSON and save result.
//         if (parsefile.ext === ".graphml") {
//             // && (!fs.existsSync("./public/graphs/" + parsefile.name + ".json"))) {
//             fs.readFile("./public/graphs/" + file, 'utf8' , (err: Error, data: string) => {
//                 if (err) {
//                     console.error(err)
//                     return
//                 }

//                 // const options = {
//                 //     preserveOrder: true,
//                 //     ignoreAttributes: false
//                 // }

//                 // const result = XMLValidator.validate(data)

//                 // if (typeof result === 'object' ) {
//                 //     console.log(result)
//                 // }

//                 // const parser = new XMLParser(options)

//                 // let jsonObject = parser.parse(data)

//                 // try {

//                 // } catch (e) {

//                 // }

//                 // console.log(JSON.stringify(jsonObject, null, 2))
//                 // exit(0)
//                 // var res = JSON.stringify(GraphFormatConverter.fromGraphml(data).toJson(), null, 2);

//                 // // TODO: REPLACE ATTRIBTE IDS WITH NAMES FROM GRAPHML.
//                 // fs.writeFile("./public/graphs/" + parsefile.name + ".json", res, (err: Error) => {
//                 //     if (err) {
//                 //         console.error(err)
//                 //         return
//                 //     }
//                 // });
//             });
//         }
//     });
// });

var app = express();

// const db = require("./models");
// const Role = db.role;

// Remove arguments in production.
// db.sequelize.sync({force: true}).then(() => {
//     console.log("Drop and Resync Db");
//     initial();
// })

// function initial() {
//     Role.create({
//         id: 1,
//         name: "user"
//     });

//     Role.create({
//         id: 2,
//         name: "moderator"
//     });

//     Role.create({
//         id: 3,
//         name: "admin"
//     });
// }


let corsOptions;

if (localAddress !== '') {
    console.log("Cors origin " + localAddress + ":" + process.env.CLIENTPORT);

    corsOptions = {
        origin: "http://" + localAddress + ":" + process.env.CLIENTPORT
    };
}
else {
    corsOptions = {
        origin: "http://chimay.science.uva.nl:8064"
    }
};

app.use(cors(corsOptions));


// NOTE: USING D3 v 4.12.2
// npm install d3@4.12.2
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

let getSessions : RequestHandler = (_, res, next ) => {
    // res.locals.sessions = Object.keys(clientSessions).filter((key) => {
    //     return (clientSessions[parseInt(key)].readyState !== WebSocket.CLOSED
    //         || clientSessions[parseInt(key)].readyState !== WebSocket.CLOSING);
    // });

    next()
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
                            }), url, json.nodes, json.edges)

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
    // Session.genSession(req.body.url, (sid) => {
    //     res.json(sid)
    // })
// })

app.get('/sessions', getSessions, (req: Request, res: Response) => {
    res.json(res.locals.sessions);
})

app.get('/ws', (req: Request, res: Response) => {
    res.json(server);
})

app.get('/')

// app.get('/websocket_update', (req : Request, res: Response) => {
//     for (let j = 0; j < 100; j++) {
//         unityServer.clients.forEach((client: WebSocket) => {


//             client.send((JSON.stringify({
//                 type: 1,
//                 content: JSON.stringify({id: "0", x:i, y:2})
//               })));

//             i = i + 0.1;
//         })
//     }
// })

// require('./routes/user.routes')(app);

const port = process.env.SERVERPORT;

logMessage(0, "Expecting client to run on port: " + process.env.CLIENTPORT);
logMessage(0, "Running server on port: " + process.env.SERVERPORT);
logMessage(0, "Running Unity websocket on port: " + process.env.WSUNITYPORT);
logMessage(0, "Running client websocket on port: " + process.env.WSCLIENTPORT);
// logMessage(0, "Running on URL " + localAddress === '' ? origin : localAddress);

app.listen(port);

module.exports = app;
