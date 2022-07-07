import { WebSocketServer, WebSocket } from 'ws';
import cytoscape from 'cytoscape'

if (process.env.WSUNITYPORT === undefined) {
    throw new Error('WSUNITYPORT not set in ENV')
}

const unityServer = new WebSocketServer({
    port: parseInt(process.env.WSUNITYPORT)
})

unityServer.on('connection', (socket: WebSocket) => {
    socket.on('open', () => {

    })

    socket.on('close', (code, reason) => {

    })

    socket.on('message', (data, isBinary) => {

    })

    socket.on('error', (err) => {

    })
})

unityServer.on('close', () => {

})

unityServer.on('error ', (error: Error) => {

})
