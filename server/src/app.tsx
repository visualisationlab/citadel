// Load env config file in root directory.
require('dotenv').config({path:__dirname + '/.env'})

import { RequestHandler, Request, Response } from "express";
import { WebSocket } from "ws"
import express from 'express'

import { body } from 'express-validator'

import { Session } from './sessions'
import { networkInterfaces } from 'os'

const path = require('path');
const cors = require('cors');
const fs = require('fs');

const { WebSocketServer } = require("ws")

import { server, onOpen, onClose, onMessage, onError } from './socket'

server.on('connection', (socket: WebSocket, req) => {
    const type = onOpen(socket, req)

    if (type === null) {
        console.log('Connection failed')

        return
    }

    socket.on('close', (code, reason) => onClose(socket, req, code, reason))

    socket.on('message', (data, isBinary) => onMessage(socket, type, data, isBinary))

    socket.on('error', (err) => onError(socket, req, err))
})

server.on('close', () => {
    console.log('Web Client server closed')
})

server.on('error ', (error: Error) => {
    console.log(`Web Client server error: ${error}`)
})

setInterval(Session.checkSessions, 5000)

const unityServer = new WebSocketServer({
    port: process.env.WSUNITYPORT
})

// const clientServer = new WebSocketServer({
//     port: process.env.WSCLIENTPORT
// })

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

unityServer.on("connection", (socket: WebSocket) => {
    // Require a connection with ID message.
    socket.on("message", (data) => {
        let unityData = null;

        // Attempt to parse data sent by a Unity client.
        try {
            unityData = JSON.parse(Buffer.from(data.toString()).toString());
        } catch (e) {
            console.log(e)

            socket.close();
            return;
        }

        // Check if ID matches.
        if (!Object.keys(clientSessions).includes(unityData.id.toString()) &&
            unityData.id !== 0) {

            sendPacket(socket, {
                type: MessageType.ERROR,
                content: "Client ID does not exist.",
                id: 0
            });

            socket.close();

            return;
        } else if (unityData.id == 0) {
            unityData.id = idCounter - 1;
            logMessage(idCounter - 1, "ID defaulting to most recent session");
        }

        // Check if ID is already being used by Unity session.
        /*if (Object.keys(unitySessions).includes(unityData.id.toString())) {
            socket.send(JSON.stringify({
                type: messageType.ERROR,
                content: "Session already in use.",
                id: -1
            }));

            socket.close();
            return;
        }*/

        sendPacket(socket, {
            type: MessageType.SUCCESS,
            content: "Connected to client with session ID " + unityData.id,
            id: unityData.id
        });

        unitySessions[unityData.id] = socket;

        sendPacket(clientSessions[unityData.id], {
            type: MessageType.INITIAL,
            content: "",
            id: unityData.id
        });
    });

    socket.on("close", () => {
        logMessage(0, "Connection to Unity socket closed")
    });
});

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

app.use(express.static(path.join(__dirname, 'public')));

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
    Session.genSession(req.body.url, (sid) => {
        res.json(sid)
    })
})

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
