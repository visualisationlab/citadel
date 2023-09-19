import { createLogger, format, transports, Logger } from 'winston'
import express, { Application, RequestHandler, Request, Response } from 'express'
import path from 'path'


import { body } from 'express-validator'
import uid from 'uid-safe'
import * as fs from 'fs'
import * as https from 'https'

// import { Session } from './session.class'
import winston from 'winston'
import { Server } from 'ws'

import { GraphFormatConverter } from 'graph-format-converter'
import { checkGraph } from './parser'
import { BasicGraph } from 'shared/lib/graph/BasicGraph'


export interface Config {
    readonly checkInterval: number,
    readonly timeout: number
    readonly localAddress: string,
    readonly defaultGraphURL: string | null
    readonly websocketPort: number,
    readonly keyPath: string,
    readonly certPath: string,
    readonly serverPort: number,
    readonly clientPort: number
}


type ErrorPhase = 0 | 1 | 2 | 3 | 4 | 5 | 6


declare module 'express-serve-static-core' {
    interface Response {

        graphs?: string[]
        root?: string
    }

    interface Request {
        content: {
            url?: string
        }
    }
}


export function configureExpressApp(
    app: Application,
    config: Config,
    // sessions: Record<string, Session | null>,
    logger: winston.Logger,
    formatter: Intl.ListFormat): void {
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))
    app.use(express.static(path.join(__dirname, '/../public')))

    // Set up routes.
    const getGraphs: RequestHandler = (_, res, next) => {
        fs.readdir("./public/graphs", (err, graphs) => {
            if (err) {
                next(err)

                return
            }

            res.root = "https://" + config.localAddress + ":" + process.env.SERVERPORT + "/graphs/"
            res.graphs = graphs

            next()
        })
    }

    app.get('/graphs', getGraphs, (req: Request, res: Response) => {
        res.json({graphs: res.graphs, root: res.root})
    })

    // app.get('/status/:session', (req: Request, res: Response) => {
    //     res.send(
    //         sessions[req.params.session]
    //     )
    // })

    // app.get('/keys/:session', (req: Request, res: Response) => {
    //     if (sessions[req.params.session]) {
    //         res.send("0")
    //         return
    //     }

    //     const remoteAddress = req.socket.remoteAddress

    //     if (remoteAddress === undefined) {
    //         res.send("0")

    //         return
    //     }

    //     res.send(sessions[req.params.session]?.getKeys(remoteAddress).toString())
    // })

    app.post('/urls', body('url').trim().unescape(),  (req, res) => {
        const url = req.content.url

        if (url === undefined) {
            res.status(400).json({msg: "URL is not set", errors: []})

            return
        }

        logger.log('info', `Received URL ${url}`)

        uid(4, (err, sid) => {
            if (err) throw err

            const dest = './cache/' + sid

            // Create session.
            fs.rm(dest, (err) => {
                if (err) {
                    sendGraphError(res, 6, [err.message], logger, formatter)

                    return
                }

                const file = fs.createWriteStream(dest)

                try {
                    new URL(url)
                } catch (e) {
                    sendGraphError(res, 1, ["URL is not valid"], logger, formatter)

                    file.close()

                    fs.rm(dest, (err) => {
                        if (err) {
                            sendGraphError(res, 6, [err.message], logger, formatter)
                        }
                    })

                    return
                }

                https.get(url, (response) => {
                    let data = ''

                    response.on('data', (chunk) => {
                        // Check for max size.
                        if (data.length > 10000000) {
                            sendGraphError(res, 2, ["File is too large"], logger, formatter)

                            file.close()

                            fs.rm(dest, (err) => {
                                if (err) {
                                    sendGraphError(res, 6, [err.message], logger, formatter)
                                }
                            })

                            return
                        }

                        data += chunk
                        file.write(chunk)
                    })

                    response.on('end', () => {
                        logger.log('info', `Downloaded ${url} to ${dest}`)

                        try {
                            if (url) {
                                sendGraphError(res, 1, ["URL is not set"], logger, formatter)

                                file.close()

                                fs.rm(dest, (err) => {
                                    if (err) {
                                        sendGraphError(res, 6, [err.message], logger, formatter)
                                    }
                                })
                                return
                            }

                            let json

                            const extension = url.split(/[#?]/)[0]?.split('.').pop()?.trim()

                            if (extension === 'graphml') {
                                const graphmlInstance = GraphFormatConverter.fromGraphml(data);

                                json = graphmlInstance.toJson()
                            } else {
                                json = JSON.parse(data) as object
                            }

                            const validationResult = checkGraph(json)

                            if (validationResult instanceof Array) {
                                const errors = validationResult.map((error) => {
                                    return error.message
                                })

                                sendGraphError(res, 5, errors, logger, formatter)

                                file.close()

                                fs.rm(dest, (err) => {
                                    if (err) {
                                        sendGraphError(res, 6, [err.message], logger, formatter)
                                    }
                                })

                                return
                            }



                            // Parse globals
                            // let globals: {[key: string]: {[key: string]: string}} = {general: {}}

                            // if (json.attributes) {
                            //     // Parse globals.
                            //     for (const key in json.attributes) {
                            //         if (typeof json.attributes[key] === 'object') {
                            //             globals[key] = json.attributes[key]

                            //             for (let param in globals[key]) {
                            //                 globals[key][param] = globals[key][param].toString()
                            //             }
                            //         }
                            //         else {
                            //             globals['general'][key] = json.attributes[key]
                            //         }
                            //     }
                            // }

                            // const session = new Session(sid, ((sid) => {
                            //     sessions[sid] = null
                            // }), url, json as BasicGraph, config.localAddress,
                            //     config.websocketPort, logger)

                            // sessions[sid] = session

                        } catch (e) {
                            if (e instanceof Error) {
                                sendGraphError(res, 4, [e.message], logger, formatter)
                            }
                            else {
                                sendGraphError(res, 4, ["Unknown error"], logger, formatter)
                            }

                            // Delete cached file.
                            file.close()
                            fs.rm(dest, (err) => {
                                if (err) {
                                    sendGraphError(res, 6, [err.message], logger, formatter)
                                }
                            })

                            sid = ''

                            return
                        }

                        file.close(() => {
                            fs.rm(dest, (err) => {
                                if (err) {
                                    sendGraphError(res, 6, [err.message], logger, formatter)
                                }
                            })

                            res.json(sid)
                        })
                    })

                    response.on('error', (err) => {
                        // logger.log('error', `HTTP response error from ${url}: ${err}`)
                        // if (err instanceof Error) {
                        sendGraphError(res, 3, [err.message], logger, formatter)

                        // res.status(404).json({msg: `HTTP response error from ${url}`, errors: []})
                    })
                }).on('error', (err) => {
                    // logger.log('error', `Error downloading graph from URL ${url}: ${err}`)

                    sendGraphError(res, 2, [err.message], logger, formatter)
                    // res.status(404).json({msg: "Error downloading graph data", errors: []})

                    fs.unlink(dest, (err) => {
                        if (err === null) {
                            return
                        }
                    })
                })
            })
        })
    })

    app.get('/ws', (req: Request, res: Response) => {
        res.json({port: config.websocketPort})
    })

    app.get('/')
}

function sendGraphError(res: Response,
    phase: ErrorPhase,
    errors: string[],
    logger: winston.Logger,
    formatter: Intl.ListFormat) {
    logger.log('error', `Error in phase ${phase}: ${formatter.format(errors)}`)

    res.status(400).json({phase: phase, errors: errors})
}

// export function configureWebsocketServer(
//     server: Server, logger: winston.Logger, sessions: Record<string, Session | null>): void {
//     server.on('connection', (socket, req) => {
//         const inputURL = req.url

//         // If URL is not set in header, exit.
//         if (inputURL === undefined) {
//             socket.close()

//             return
//         }

//         try {
//             // Get sid/URL/key.
//             const url = new URL(inputURL, `wss://${req.headers.host}`)
//             const sid = url.searchParams.get('sid')
//             const apiKey = url.searchParams.get('key')
//             const headsetKey = url.searchParams.get('headsetKey')
//             const headsetUserID = url.searchParams.get('userID')
//             const username = url.searchParams.get('username')

//             const keyString = url.searchParams.get('keys')
//             const keys = keyString ? parseInt(keyString) : 0

//             logger.log('info', `New connection from ${req.socket.remoteAddress} with sid ${sid}, key ${apiKey}, headsetKey ${headsetKey}, headsetUserID ${headsetUserID}, username ${username}, keys ${keys}`)
//             let userID: string | null = null

//             if (sid === null) {
//                 socket.close()

//                 return
//             }

//             // Store session.
//             const session = sessions[sid]

//             // If session doesn't exist, exit.
//             if (!session) {
//                 socket.close()

//                 return
//             }

//             // If apiKey is set, register simulator.
//             if (apiKey) {
//                 session.registerSimulator(apiKey, socket)
//             }
//             else if (headsetKey && headsetUserID) {
//                 session.registerHeadset(headsetKey, headsetUserID, socket)
//             }
//             else {
//                 userID = session.addUser(socket, username, keys, req)

//                 logger.log('info', `User ${userID} joined session ${sid}`)
//             }

//             socket.on('close', (code: number, reason: Buffer) => {
//                 // Read buffer and log
//                 const reasonString = reason.toString()

//                 logger.log('info', `Connection closed with code ${code} and reason ${reasonString}`)

//                 const session = sessions[sid]

//                 if (!session) {
//                     return
//                 }

//                 if (headsetKey) {
//                     session.removeHeadset(headsetKey)
//                 }

//                 if (apiKey) {
//                     session.deRegisterSimulator(apiKey)
//                 }

//                 if (userID) {
//                     session.removeUser(userID)
//                     return
//                 }
//             })

//             socket.on('message', (data, isBinary) => {
//                 if (isBinary) {
//                     throw new Error(`BINARY! HELP!`)
//                 }

//                 try {
//                     // If data is a Buffer, convert to string.
//                     const message: unknown = JSON.parse(JSON.stringify(data))

//                     if (message === null) {
//                         throw new Error(`Message is null`)
//                     }

//                     if (typeof message !== 'object') {
//                         throw new Error(`Message is not an object`)
//                     }

//                     if (message.sessionID === undefined) {
//                         throw new Error(`Message doesn't have a sessionID`)
//                     }

//                     if (sessions[message.sessionID] === null || sessions[message.sessionID] === undefined) {
//                         logger.log('warn', "Received invalid message, closing connection")
//                         socket.close()

//                         return
//                     }

//                     session.addMessage(message)
//                 } catch (e) {
//                     logger.log('error', `Error '${e}' when parsing message`)

//                     return
//                 }
//             })
//         } catch (e) {
//             socket.close()
//         }
//     })

//     // Close all sessions when server is closed.
//     server.on('close', () => {
//         Object.keys(sessions).forEach((key) => {
//             const session = sessions[key]

//             if (!session) {
//                 return
//             }

//             session.destroy()
//         })
//     })
// }

export function setupLogger(): Logger {
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
            new transports.File({ filename: 'logs/quick-start-error.log', level: 'error' }),
            new transports.File({ filename: 'logs/quick-start-combined.log' })
        ]
    })

    logger.add(new transports.Console({
        format: format.combine(
            format.colorize(),
            format.simple()
        )
    }))

    return logger
}

export function loadEnvironmentVariables(logger: winston.Logger): Config {
    // Check if CHECK_INTERVAL is set in ENV.
    if (process.env.SESSION_CHECKING_INTERVAL === undefined) {
        throw new Error('CHECK_INTERVAL not set in ENV')
    }

    const checkInterval = parseInt(process.env.SESSION_CHECKING_INTERVAL)

    if (isNaN(checkInterval)) {
        throw new Error('CHECK_INTERVAL is not a number')
    }

    if (process.env.SESSION_TIMEOUT === undefined) {
        throw new Error('SESSION_TIMEOUT not set in ENV')
    }

    const timeout = parseInt(process.env.SESSION_TIMEOUT)

    if (isNaN(timeout)) {
        throw new Error('SESSION_TIMEOUT is not a number')
    }

    // Disable TLS certificate check. Only for development.
    if (process.env.NODE_ENV !== 'production') {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    }

    // Check if LOCAL_ADDRESS is set in ENV.
    if (process.env.LOCAL_ADDRESS == undefined || process.env.LOCAL_ADDRESS == '') {
        throw new Error('LOCAL_ADDRESS not set in ENV')
    }

    const localAddress = process.env.LOCAL_ADDRESS

    if (process.env.WEBSOCKET_PORT === undefined) {
        throw new Error('WEBSOCKET_PORT not set in ENV')
    }

    const websocketPort = parseInt(process.env.WEBSOCKET_PORT)

    if (isNaN(websocketPort)) {
        throw new Error('WEBSOCKET_PORT is not a number')
    }

    if (process.env.SERVERPORT === undefined) {
        throw new Error('SERVERPORT not set in ENV')
    }

    const serverPort = parseInt(process.env.SERVERPORT)

    if (process.env.CLIENTPORT === undefined) {
        throw new Error('CLIENTPORT not set in ENV')
    }

    const clientPort = parseInt(process.env.CLIENTPORT)

    if (isNaN(clientPort)) {
        throw new Error('CLIENTPORT is not a number')
    }

    let defaultGraphURL: string | null = null

    if (process.env.DEFAULT_GRAPH_URL !== undefined && process.env.DEFAULT_GRAPH_URL !== '') {
        defaultGraphURL = process.env.DEFAULT_GRAPH_URL
    }

    let keyPath = ''
    let certPath = ''

    if (process.env.KEY_PATH === undefined || process.env.KEY_PATH === '') {
        throw new Error('KEY_PATH not set in ENV')
    }

    keyPath = process.env.KEY_PATH

    if (process.env.CERT_PATH === undefined || process.env.CERT_PATH === '') {
        throw new Error('CERT_PATH not set in ENV')
    }

    certPath = process.env.CERT_PATH

    logger.log(
        'info',
        `Using client port ${clientPort}, interval ${checkInterval}, timeout ${timeout}, local address ${localAddress}, websocket port ${websocketPort}, server port ${serverPort}, default graph URL ${defaultGraphURL}, key path ${keyPath}, cert path ${certPath}`
    )

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
    }
}