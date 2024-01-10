/**
 * @author Miles van der Lely <m.vanderlely@uva.nl>
 *
 */

import { WebSocketServer } from 'ws'
import express from 'express'
import https from 'https'
import { Session } from './session.class'
import cors from 'cors'
import * as fs from 'fs'
import dotenv from 'dotenv'

import {
    configureExpressApp,
    configureWebsocketServer,
    loadEnvironmentVariables,
    setupLogger
} from './setup'

dotenv.config({path:__dirname + '/../../.env'})

function main() {
    const logger = setupLogger()
    const config = loadEnvironmentVariables(logger)
    const sessions: Record<string, Session | null> = {}
    //eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const formatter = new Intl.ListFormat('en', { style: 'short', type: 'conjunction' })
    const app = express()
    // Set up CORS.
    const corsOptions = {
        origin: "https://" + config.localAddress + ":" + config.clientPort,
    }

    app.use(cors(corsOptions))

    // Set up express app.
    const httpsServer = https.createServer({
        key: fs.readFileSync(config.keyPath, 'utf8'),
        cert: fs.readFileSync(config.certPath, 'utf8')
    }, app)

    configureExpressApp(app, config, logger, formatter)

    const websocketServer = new WebSocketServer({
        server: httpsServer,
        clientTracking: true,
        perMessageDeflate: true
    })

    //Session checker.
    setInterval(() => {
        Object.keys(sessions).filter((key) => {
            const session = sessions[key]

            if (!session) {
                return false
            }

            return session.hasExpired()
        }).forEach((key) => {
            logger.log('info', `Session ${key} timed out`)

            sessions[key]?.destroy()
        })
    }, config.checkInterval)

    configureWebsocketServer(websocketServer, logger, sessions)

    httpsServer.listen(config.serverPort)

    logger.log({
        level: 'info',
        message: 'Server started succesfully',
        config
    })
}

main()


