import uid from 'uid-safe'
import cytoscape from 'cytoscape'
import { WebSocketServer, WebSocket, RawData } from 'ws';

type SessionState = 'idle' | 'generating layout' | 'running simulation'

type User = {
    readonly userID: string,
    socket: WebSocket,
    username: string,
    apikeys: string[]
}

type Simulator = {
    readonly simID: string,
    socket: WebSocket,
    params: any,
    apikey: string,
}

module MessageTypes {
    export type CloseReason =
        | {code: 1001, reason: 'Session end'}
        | {code: 1002, reason: 'Protocol error'}
        | {code: 1003, reason: 'Unsupported data'}

    export interface Message {
        sessionID: string,
        sessionState: SessionState
        data: any
    }

    interface ClientMessage extends Message {
        userID: string
    }

    export interface InfoMessage extends ClientMessage {
        data: {
            url: string,
            users: {

            }
        }
    }

    export interface DataMessage extends Message {
        data: any
    }
}

class Session {
    private readonly URL: string
    private readonly sessionID: string

    private expirationDate: Date
    private cy: cytoscape.Core
    private sessionState: SessionState

    private users: User[]
    private simulators: Simulator[]

    private messageQueue: MessageTypes.Message[]

    constructor(url: string,
                nodes: {[key: string]: any}[],
                edges: {[key: string]: any}[]) {
        this.URL = url
        this.sessionID = uid.sync(4)
        let expDate = new Date()

        expDate.setHours(expDate.getHours() + 6)

        this.expirationDate = expDate

        this.cy = cytoscape({
            headless: true,
            styleEnabled: true,
        })

        this.cy.json(this.parseJson(nodes, edges))

        this.users = []
        this.simulators = []
        this.messageQueue = []
        this.sessionState = 'idle'
    }

    private setState(state: SessionState) {
        this.sessionState = state

        // TODO: NOTIFY CLIENTS
    }

    // type Action =
    //  'send data'

    private async processMessage(message: MessageTypes.Message) {
        return await new Promise<() => void>((resolve, reject) => {
            reject('Thingy')
        })
    }

    private getMessage() {
        if (this.messageQueue.length === 0) {
            this.setState('idle')

            return
        }

        // Get the first message in the queue.
        this.processMessage(this.messageQueue.splice(0, 1)[0])
            .then(
                (result) => {
                    result()

                    // Get the next message.
                    this.getMessage()
                },
                // TODO: ERROR TYPES
                (error) => {
                    // Log an error and close the session.
                    console.log(error)

                    this.destroy(error)

                    // TODO: NOTIFY APP
                }
            )
    }

    // Adds a message to the queue, and tries to process it.
    addMessage(message: MessageTypes.Message) {
        this.messageQueue.push(message)

        this.getMessage()
    }

    // Removes all closing/closed sessions.
    private pruneSessions() {
        this.users = this.users.filter((user) => {
            return user.socket.readyState !== user.socket.CLOSING
                && user.socket.readyState !== user.socket.CLOSED
        })
    }

    // Sends graph data to all users.
    private sendData() {
        this.pruneSessions()

        this.users.forEach((user) => {
            const msg: MessageTypes.DataMessage = {
                sessionID: this.sessionID,
                sessionState: this.sessionState,

                data: (this.cy.json() as any).elements
            }

            user.socket.send(msg)
        })
    }

    // Sends session info to all users.
    private sendSessionInfo() {
        this.pruneSessions()

        this.users.forEach((user) => {
            const msg: MessageTypes.InfoMessage = {
                sessionID: this.sessionID,
                sessionState: this.sessionState,
                userID: user.userID,

                data: {
                    url: this.URL,
                    users: this.users.map((user) => {
                        return {
                            username: user.username,
                            userID: user.userID
                        }
                    })
                }
            }

            user.socket.send(msg)
        })
    }

    // Adds a user to the session, giving it a random user ID and username.
    addUser(socket: WebSocket) {
        const userID = uid.sync(4)
        const username = `user${Math.floor(Math.random() * 10)}`

        this.users.push({
            userID: userID,
            socket: socket,
            username: username,
            apikeys: []
        })

        this.sendSessionInfo()
    }

    // Removes a user from the session.
    removeUser(userID: string, reason: MessageTypes.CloseReason) {
        this.users.forEach((user) => {
            if (user.userID === userID) {
                user.socket.close(reason.code, reason.reason)
            }
        })

        this.users = this.users.filter((user) => {
            return user.userID !== userID
        })

        this.sendSessionInfo()
    }

    // Parses JSON for use by cytoscape.
    private parseJson(nodes: {[key: string]: any}[], edges: {[key: string]: any}[]) {
        return {
            elements: {
                nodes: nodes.map((node) => {
                    if (Object.keys(node).includes('attributes')) {
                        node['data'] = node.attributes
                    }

                    if (Object.keys(node).includes('id')) {
                        node['data']['id'] = node['id'].toString()
                    }

                    return node
                }),
                edges: edges.map((edge, index) => {
                    const edgeKeys = Object.keys(edge)

                    if (edgeKeys.includes('attributes')) {
                        edge['data'] = edge.attributes
                        edge['attributes'] = {}
                    }

                    if (edgeKeys.includes('id')) {
                        edge['data']['id'] = edge['id'].toString()
                    }

                    if (!edgeKeys.includes('id')) {
                        edge['data']['id'] = `e${index}`
                    }

                    if (edgeKeys.includes('source')) {
                        edge['data']['source'] = edge['source'].toString()
                    }

                    if (edgeKeys.includes('target')) {
                        edge['data']['target'] = edge['target'].toString()
                    }
                    if (index === 0) {
                        console.log(edge)
                    }

                    return edge
                })
            }
        }
    }

    // Extends the expiration date by current time + 6 hrs.
    extendExpirationDate() {
        let expDate = new Date()

        expDate.setHours(expDate.getHours() + 6)

        this.expirationDate = expDate
    }

    // Returns whether the current session has expired.
    hasExpired() {
        return this.expirationDate > new Date()
    }

    // Destroys the current session with reason given by param.
    destroy(reason: MessageTypes.CloseReason) {
        this.simulators.forEach((sim) => {
            sim.socket.close(reason.code, reason.reason)
        })

        this.users.forEach((user) => {
            user.socket.close(reason.code, reason.reason)
        })

        this.cy.destroy()
    }
}
