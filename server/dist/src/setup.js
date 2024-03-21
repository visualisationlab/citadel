"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEnvironmentVariables = exports.setupLogger = exports.configureWebsocketServer = exports.configureExpressApp = void 0;
const winston_1 = require("winston");
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const path_1 = __importDefault(require("path"));
const uid_safe_1 = __importDefault(require("uid-safe"));
const fs = __importStar(require("fs"));
const https = __importStar(require("https"));
const graph_format_converter_1 = require("graph-format-converter");
const parser_1 = require("./parser");
const session_class_1 = require("./session.class");
function configureExpressApp(app, config, sessions, logger, formatter) {
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use(express_1.default.static(path_1.default.join(__dirname, '../../public')));
    // Set up routes.
    const getGraphs = (_, res, next) => {
        fs.readdir("./public/graphs", (err, graphs) => {
            if (err) {
                next(err);
                return;
            }
            // res.root = "https://" + config.localAddress + ":" + config.serverPort + "/graphs/"
            // res.graphs = graphs
            res.locals['root'] = "https://" + config.localAddress + ":" + config.serverPort + "/graphs/";
            res.locals['graphs'] = graphs;
            // console.log(res.root)
            // console.log(res.graphs)
            // graphs.map((graph) =>{
            // })
            next();
        });
    };
    app.get('/graphs', getGraphs, (req, res) => {
        console.log('received graphs call');
        console.log();
        res.json({ graphs: res.locals['graphs'], root: res.locals['root'] });
    });
    app.get('/status/:session', (req, res) => {
        res.send(sessions[req.params.session]);
    });
    app.get('/keys/:session', (req, res) => {
        if (sessions[req.params.session]) {
            res.send("0");
            return;
        }
        const remoteAddress = req.socket.remoteAddress;
        if (remoteAddress === undefined) {
            res.send("0");
            return;
        }
        res.send(sessions[req.params.session]?.getKeys(remoteAddress).toString());
    });
    app.post('/urls', (0, express_validator_1.body)('url').trim().unescape(), (req, res) => {
        // body('url').trim().unescape()
        //const url = req.content.url
        //const url = req.body.url
        const url = "https://" + config.localAddress + ":" + config.serverPort + '/graphs/' + req.body.url;
        console.log(url);
        if (url === undefined) {
            res.status(400).json({ msg: "URL is not set", errors: [] });
            return;
        }
        logger.log('info', `Received URL ${url}`);
        (0, uid_safe_1.default)(4, (err, sid) => {
            if (err)
                throw err;
            const dest = './cache/' + sid;
            if (fs.existsSync('./cache/')) {
                console.log('found cache dir');
            }
            // Create session.
            fs.rm(dest, (err) => {
                // if (err) {
                //     console.log('error here')
                //     sendGraphError(res, 6, [err.message], logger, formatter)
                //     return
                // }
                // LAU doesn't understand above return --> you try to remove the cache file, failing means there is no so you create a new session? Why return then? 
                const file = fs.createWriteStream(dest);
                try {
                    new URL(url);
                }
                catch (e) {
                    sendGraphError(res, 1, ["URL is not valid"], logger, formatter);
                    sendGraphError(res, 1, [e.message], logger, formatter);
                    file.close();
                    fs.rm(dest, (err) => {
                        if (err) {
                            sendGraphError(res, 6, [err.message], logger, formatter);
                        }
                    });
                    return;
                }
                https.get(url, (response) => {
                    // console.log('https get worked?')
                    let data = '';
                    response.on('data', (chunk) => {
                        // Check for max size.
                        if (data.length > 10000000) {
                            sendGraphError(res, 2, ["File is too large"], logger, formatter);
                            file.close();
                            fs.rm(dest, (err) => {
                                if (err) {
                                    sendGraphError(res, 6, [err.message], logger, formatter);
                                }
                            });
                            return;
                        }
                        data += chunk;
                        file.write(chunk);
                    });
                    response.on('end', () => {
                        logger.log('info', `Downloaded ${url} to ${dest}`);
                        try {
                            // if (url) {
                            //     sendGraphError(res, 1, ["URL is not set"], logger, formatter)
                            //     file.close()
                            //     fs.rm(dest, (err) => {
                            //         if (err) {
                            //             sendGraphError(res, 6, [err.message], logger, formatter)
                            //         }
                            //     })
                            //     return
                            // }
                            let json;
                            const extension = url.split(/[#?]/)[0]?.split('.').pop()?.trim();
                            // console.log(extension)
                            if (extension === 'graphml') {
                                const graphmlInstance = graph_format_converter_1.GraphFormatConverter.fromGraphml(data);
                                json = graphmlInstance.toJson();
                            }
                            else {
                                json = JSON.parse(data);
                                // console.log('JSON')
                                // console.log(json)
                            }
                            const validationResult = (0, parser_1.checkGraph)(json);
                            if (validationResult instanceof Array) {
                                const errors = validationResult.map((error) => {
                                    return error.message;
                                });
                                sendGraphError(res, 5, errors, logger, formatter);
                                file.close();
                                fs.rm(dest, (err) => {
                                    if (err) {
                                        sendGraphError(res, 6, [err.message], logger, formatter);
                                    }
                                });
                                return;
                            }
                            // console.log(json)
                            // Parse globals
                            let globals = { general: {} };
                            if (json.attributes) {
                                // Parse globals.
                                for (const key in json.attributes) {
                                    if (typeof json.attributes[key] === 'object') {
                                        globals[key] = json.attributes[key];
                                        for (let param in globals[key]) {
                                            globals[key][param] = globals[key][param].toString();
                                        }
                                    }
                                    else {
                                        globals['general'][key] = json.attributes[key];
                                    }
                                }
                            }
                            // console.log('made it this far')
                            const session = new session_class_1.Session(sid, ((sid) => {
                                sessions[sid] = null;
                            }), url, json, config.localAddress, // as BasicGraph
                            String(config.websocketPort), logger, globals);
                            sessions[sid] = session;
                        }
                        catch (e) {
                            if (e instanceof Error) {
                                sendGraphError(res, 4, [e.message], logger, formatter);
                                console.log(e.stack);
                            }
                            else {
                                sendGraphError(res, 4, ["Unknown error"], logger, formatter);
                            }
                            // Delete cached file.
                            file.close();
                            fs.rm(dest, (err) => {
                                if (err) {
                                    sendGraphError(res, 6, [err.message], logger, formatter);
                                }
                            });
                            sid = '';
                            return;
                        }
                        file.close(() => {
                            fs.rm(dest, (err) => {
                                if (err) {
                                    sendGraphError(res, 6, [err.message], logger, formatter);
                                }
                            });
                            res.json(sid);
                        });
                    });
                    response.on('error', (err) => {
                        // logger.log('error', `HTTP response error from ${url}: ${err}`)
                        // if (err instanceof Error) {
                        sendGraphError(res, 3, [err.message], logger, formatter);
                        // res.status(404).json({msg: `HTTP response error from ${url}`, errors: []})
                    });
                }).on('error', (err) => {
                    // logger.log('error', `Error downloading graph from URL ${url}: ${err}`)
                    sendGraphError(res, 2, [err.message], logger, formatter);
                    // res.status(404).json({msg: "Error downloading graph data", errors: []})
                    fs.unlink(dest, (err) => {
                        if (err === null) {
                            return;
                        }
                    });
                });
            });
        });
    });
    // app.get('/ws', (req: Request, res: Response) => {
    //     res.json({port: config.websocketPort})
    // })
    app.get('/');
}
exports.configureExpressApp = configureExpressApp;
function sendGraphError(res, phase, errors, logger, formatter) {
    logger.log('error', `Error in phase ${phase}: ${formatter.format(errors)}`);
    res.status(400).json({ phase: phase, errors: errors });
}
function configureWebsocketServer(server, logger, sessions) {
    server.on('connection', (socket, req) => {
        const inputURL = req.url;
        // If URL is not set in header, exit.
        if (inputURL === undefined) {
            socket.close();
            return;
        }
        try {
            // Get sid/URL/key.
            const url = new URL(inputURL, `wss://${req.headers.host}`);
            const sid = url.searchParams.get('sid');
            const apiKey = url.searchParams.get('key');
            const headsetKey = url.searchParams.get('headsetKey');
            const headsetUserID = url.searchParams.get('userID');
            const username = url.searchParams.get('username');
            const keyString = url.searchParams.get('keys');
            const keys = keyString ? parseInt(keyString) : 0;
            logger.log('info', `New connection from ${req.socket.remoteAddress} with sid ${sid}, key ${apiKey}, headsetKey ${headsetKey}, headsetUserID ${headsetUserID}, username ${username}, keys ${keys}`);
            let userID = null;
            if (sid === null) {
                socket.close();
                return;
            }
            // Store session.
            const session = sessions[sid];
            // If session doesn't exist, exit.
            if (!session) {
                socket.close();
                return;
            }
            // If apiKey is set, register simulator.
            if (apiKey) {
                session.registerSimulator(apiKey, socket);
            }
            else if (headsetKey && headsetUserID) {
                session.registerHeadset(headsetKey, headsetUserID, socket);
            }
            else {
                userID = session.addUser(socket, username, keys, req);
                logger.log('info', `User ${userID} joined session ${sid}`);
            }
            socket.on('close', (code, reason) => {
                // Read buffer and log
                const reasonString = reason.toString();
                logger.log('info', `Connection closed with code ${code} and reason ${reasonString}`);
                const session = sessions[sid];
                if (!session) {
                    return;
                }
                if (headsetKey) {
                    session.removeHeadset(headsetKey);
                }
                if (apiKey) {
                    session.deRegisterSimulator(apiKey);
                }
                if (userID) {
                    session.removeUser(userID);
                    return;
                }
            });
            socket.on('message', (data, isBinary) => {
                if (isBinary) {
                    throw new Error(`BINARY! HELP!`);
                }
                try {
                    // If data is a Buffer, convert to string.
                    const message = JSON.parse(data); //changed unknown into any LAU //JSON.stringify(data)
                    //console.log(message)
                    if (message === null) {
                        throw new Error(`Message is null`);
                    }
                    if (typeof message !== 'object') {
                        throw new Error(`Message is not an object`);
                    }
                    if (message.sessionID === undefined) {
                        throw new Error(`Message doesn't have a sessionID`);
                    }
                    if (sessions[message.sessionID] === null || sessions[message.sessionID] === undefined) {
                        logger.log('warn', "Received invalid message, closing connection");
                        socket.close();
                        return;
                    }
                    session.addMessage(message);
                }
                catch (e) {
                    console.log(e.stack);
                    logger.log('error', `Error '${e}' when parsing message`);
                    return;
                }
            });
        }
        catch (e) {
            logger.log('error', `Websocket closed ${e}`);
            logger.log('error', e.stack);
            socket.close();
        }
    });
    // Close all sessions when server is closed.
    server.on('close', () => {
        Object.keys(sessions).forEach((key) => {
            const session = sessions[key];
            if (!session) {
                return;
            }
            session.destroy();
        });
    });
}
exports.configureWebsocketServer = configureWebsocketServer;
function setupLogger() {
    const logger = (0, winston_1.createLogger)({
        level: 'info',
        format: winston_1.format.combine(winston_1.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }), winston_1.format.errors({ stack: true }), winston_1.format.splat(), winston_1.format.json()),
        defaultMeta: { service: 'visgraph-server' },
        transports: [
            new winston_1.transports.File({ filename: 'logs/quick-start-error.log', level: 'error' }),
            new winston_1.transports.File({ filename: 'logs/quick-start-combined.log' })
        ]
    });
    logger.add(new winston_1.transports.Console({
        format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.simple())
    }));
    return logger;
}
exports.setupLogger = setupLogger;
function loadEnvironmentVariables(logger) {
    // Check if CHECK_INTERVAL is set in ENV.
    if (process.env['SESSION_CHECKING_INTERVAL'] === undefined) {
        throw new Error('CHECK_INTERVAL not set in ENV');
    }
    const checkInterval = parseInt(process.env['SESSION_CHECKING_INTERVAL']);
    if (isNaN(checkInterval)) {
        throw new Error('CHECK_INTERVAL is not a number');
    }
    if (process.env['SESSION_TIMEOUT'] === undefined) {
        throw new Error('SESSION_TIMEOUT not set in ENV');
    }
    const timeout = parseInt(process.env['SESSION_TIMEOUT']);
    if (isNaN(timeout)) {
        throw new Error('SESSION_TIMEOUT is not a number');
    }
    // Disable TLS certificate check. Only for development.
    if (process.env['NODE_ENV'] !== 'production') {
        process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
    }
    // Check if LOCAL_ADDRESS is set in ENV.
    if (process.env['LOCAL_ADDRESS'] == undefined || process.env['LOCAL_ADDRESS'] == '') {
        throw new Error('LOCAL_ADDRESS not set in ENV');
    }
    const localAddress = process.env['LOCAL_ADDRESS'];
    if (process.env['WEBSOCKET_PORT'] === undefined) {
        throw new Error('WEBSOCKET_PORT not set in ENV');
    }
    const websocketPort = parseInt(process.env['WEBSOCKET_PORT']);
    if (isNaN(websocketPort)) {
        throw new Error('WEBSOCKET_PORT is not a number');
    }
    if (process.env['SERVERPORT'] === undefined) {
        throw new Error('SERVERPORT not set in ENV');
    }
    const serverPort = parseInt(process.env['SERVERPORT']);
    if (process.env['CLIENTPORT'] === undefined) {
        throw new Error('CLIENTPORT not set in ENV');
    }
    const clientPort = parseInt(process.env['CLIENTPORT']);
    if (isNaN(clientPort)) {
        throw new Error('CLIENTPORT is not a number');
    }
    let defaultGraphURL = null;
    if (process.env['DEFAULT_GRAPH_URL'] !== undefined && process.env['DEFAULT_GRAPH_URL'] !== '') {
        defaultGraphURL = process.env['DEFAULT_GRAPH_URL'];
    }
    let keyPath = '';
    let certPath = '';
    if (process.env['KEY_PATH'] === undefined || process.env['KEY_PATH'] === '') {
        throw new Error('KEY_PATH not set in ENV');
    }
    keyPath = process.env['KEY_PATH'];
    if (process.env['CERT_PATH'] === undefined || process.env['CERT_PATH'] === '') {
        throw new Error('CERT_PATH not set in ENV');
    }
    certPath = process.env['CERT_PATH'];
    logger.log('info', `Using client port ${clientPort}, interval ${checkInterval}, timeout ${timeout}, local address ${localAddress}, websocket port ${websocketPort}, server port ${serverPort}, default graph URL ${defaultGraphURL}, key path ${keyPath}, cert path ${certPath}`);
    return {
        checkInterval: checkInterval,
        timeout: timeout,
        localAddress: localAddress,
        defaultGraphURL: defaultGraphURL,
        websocketPort: websocketPort,
        keyPath: keyPath,
        certPath: certPath,
        serverPort: serverPort,
        clientPort: clientPort
    };
}
exports.loadEnvironmentVariables = loadEnvironmentVariables;
//# sourceMappingURL=setup.js.map