import uid from 'uid-safe'
import cytoscape from 'cytoscape'
import { WebSocket } from 'ws';

type SessionState = 'idle' | 'busy'

type User = {
    readonly userID: string,
    socket: WebSocket,
    username: string,
    apikeys: string[]
}

type Simulator = {
    readonly apikey: string | null,
    readonly userID: string,
    socket: WebSocket,
    params: any,
    state: 'disconnected' | 'idle' | 'generating'
}

export module MessageTypes {
    export type CloseReason =
        | {code: 1001, reason: 'Session end'}
        | {code: 1002, reason: 'Protocol error'}
        | {code: 1003, reason: 'Unsupported data'}
        | {code: 1004, reason: 'Session timeout'}

    export interface OutMessage {
        sessionID: string,
        sessionState: SessionState,
        type: 'data' | 'session'
    }

    export interface InMessage {
        sessionID: string,
        userID: string,
        messageSource: 'simulator' | 'user'
        messageType: 'get' | 'set'
        apiKey?: string
        data?: any
        dataType?: any
    }

    export interface SimulatorMessage {
        sessionID: string,
        apiKey: string,
        messageSource: 'simulator',
        data: {
            nodes: any,
            edges: any,
            params: any
        }
    }

    export type GetType = 'graphState' | 'sessionState' | 'layouts' | 'apiKey' | 'QR'
    export type SetType = 'graphState' | 'simulator' | 'layout' | 'username'

    export interface GetMessage extends InMessage {
        messageSource: 'user'
        messageType: 'get'
        userID: string,
        dataType: GetType
    }

    export interface SetMessage extends InMessage {
        messageSource: 'user'
        messageType: 'set'
        userID: string,
        dataType: SetType
        params: any
    }

    export interface SessionStateMessage extends OutMessage {
        userID: string,
        type: 'session',
        data: {
            url: string,
            users: {

            },
            simulators: Simulator[],
            layoutInfo: LayoutInfo[]
        }
    }

    export interface DataStateMessage extends OutMessage {
        type: 'data',
        data: {
            nodes: any
            edges: any
        }
    }
}

type AvailableLayout =
        | 'null'
        | 'random'
        | 'cose'
        | 'grid'
        | 'circle'
        | 'breadthfirst'
        | 'cose'
        | 'fcose'
        | 'cola'
        | 'cise'
        | 'spread'
        | 'd3-force'

export type LayoutSetting =
    |   {
            name: string,
            description: string,
            type: 'number',
            defaultValue: number
        }
    |   {
            name: string,
            description: string,
            type: 'boolean',
            defaultValue: boolean
        }

export interface LayoutInfo {
    name: AvailableLayout,
    description: string,
    link: string,
    settings: LayoutSetting[]
}

function getAvailableLayouts(): LayoutInfo[] {
    return [
        {
            name: 'null',
            description: 'Places all nodes at position (0,0)',
            link: 'https://js.cytoscape.org/#layouts',
            settings: []
        },
        {
            name: 'random',
            description: 'Places all nodes at random positions within the frame.',
            link: 'https://js.cytoscape.org/#layouts',
            settings: []
        },
        {
            name: 'grid',
            description: 'Places all nodes within a well-spaced grid.',
            link: 'https://js.cytoscape.org/#layouts',
            settings: [
                {
                    name: 'spacingFactor',
                    description: 'Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up.',
                    type: 'number',
                    defaultValue: 0
                },
                {
                    name: 'rows',
                    description: 'Force number of rows in the grid.',
                    type: 'number',
                    defaultValue: 0,
                },
                {
                    name: 'cols',
                    description: 'Force number of columns in the grid.',
                    type: 'number',
                    defaultValue: 0,
                }
            ]
        },
        {
            name: 'circle',
            description: 'Places all nodes in a circle.',
            link: 'https://js.cytoscape.org/#layouts',
            settings: [
                {
                    name: 'radius',
                    description: 'The radius of the circle.',
                    type: 'number',
                    defaultValue: 0
                },
                {
                    name: 'spacingFactor',
                    description: 'Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up.',
                    type: 'number',
                    defaultValue: 0
                },
                {
                    name: 'clockwise',
                    description: 'Whether the layout should go clockwise (true) or countercockwise (false).',
                    type: 'boolean',
                    defaultValue: true
                }
            ]
        },
        {
            name: 'breadthfirst',
            description: 'Puts nodes in a hierarchy, based on a breadthfirst traversal of the graph',
            link: 'https://js.cytoscape.org/#layouts',
            settings: []
        },
        {
            name: 'cose',
            description: 'The cose (Compound Spring Embedder) layout uses a physics simulation to lay out graphs.',
            link: 'https://js.cytoscape.org/#layouts',
            settings: [
                {
                    name: 'gravity',
                    description: 'Gravity force (constant).',
                    type: 'number',
                    defaultValue: 1
                },
                {
                    name: 'nodeOverlap',
                    description: 'Node repulsion (overlapping) multiplier.',
                    type: 'number',
                    defaultValue: 4
                },
                {
                    name: 'nestingFactor',
                    description: 'Nesting factor (multiplier) to compute ideal edge length for nested edges.',
                    type: 'number',
                    defaultValue: 1.2
                },
                {
                    name: 'coolingFactor',
                    description: 'Cooling factor (how the temperature is reduced between consecutive iterations.',
                    type: 'number',
                    defaultValue: 0.99
                }
            ]
        },
        {
            name: 'fcose',
            description: 'The cose (Compound Spring Embedder) layout uses a physics simulation to lay out graphs.',
            link: 'https://js.cytoscape.org/#layouts',
            settings: [
                {
                    name: 'gravity',
                    description: 'Gravity force (constant).',
                    type: 'number',
                    defaultValue: 0.25
                },
                {
                    name: 'gravityRange',
                    description: 'Gravity range (constant).',
                    type: 'number',
                    defaultValue: 3.8
                },
                {
                    name: 'nestingFactor',
                    description: 'Nesting factor (multiplier) to compute ideal edge length for nested edges.',
                    type: 'number',
                    defaultValue: 0.1
                },
                {
                    name: 'numIter',
                    description: 'Number of iterations.',
                    type: 'number',
                    defaultValue: 2500
                }
            ]
        },
        {
            name: 'cola',
            description: 'The cola layout uses a force-directed physics simulation with several sophisticated constraints.',
            link: 'https://github.com/cytoscape/cytoscape.js-cola',
            settings: [
                {
                    name: 'randomize',
                    description: 'Randomizes initial node positions.',
                    type: 'boolean',
                    defaultValue: true
                },
                {
                    name: 'convergenceThreshold',
                    description: 'when the alpha value (system energy) falls below this value, the layout stops.',
                    type: 'number',
                    defaultValue: 0.01
                },
                {
                    name: 'edgeLength',
                    description: 'sets edge length directly in simulation.',
                    type: 'number',
                    defaultValue: 0
                },
            ]
        },
        {
            name: 'cise',
            description: 'CiSE(Circular Spring Embedder) is an algorithm based on the traditional force-directed layout scheme with extensions to move and rotate nodes in the same cluster as a group.',
            link: 'https://github.com/iVis-at-Bilkent/cytoscape.js-cise',
            settings: []
        },
        {
            name: 'spread',
            description: '',
            link: '',
            settings: [
                    {
                        name: 'minDist',
                        description: 'Minimum distance between nodes.',
                        type: 'number',
                        defaultValue: 0
                    },
            ]
        }
    ]
}

export class Session {
    private readonly URL: string
    private readonly sessionID: string

    private expirationDate: Date
    private cy: cytoscape.Core
    private sessionState: SessionState

    private users: User[]
    private simulators: Simulator[]

    private messageQueue: MessageTypes.InMessage[]

    private readonly destroyFun: (sid: string) => void

    constructor(sid: string,
                destroyFun: (sid: string) => void,
                url: string,
                nodes: {[key: string]: any}[],
                edges: {[key: string]: any}[]) {
        this.URL = url
        this.destroyFun = destroyFun
        this.sessionID = sid
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

        this.sendSessionState()
    }

    private parseSimulatorMessage(message: MessageTypes.SimulatorMessage,
        resolve: (value: () => void | PromiseLike<() => void>) => void,
        reject: (reason?: any) => void) {
        console.log(message.apiKey)
    }

    private parseGetMessage(message: MessageTypes.GetMessage,
        resolve: (value: () => void | PromiseLike<() => void>) => void,
        reject: (reason?: any) => void) {

        switch (message.dataType) {
            case 'QR':
                reject('Not Implemented')
                return
            case 'apiKey':
                resolve(() => {

                })
                return
            case 'graphState':
                resolve(() => {
                    this.sendGraphState()
                })
                return
            case 'sessionState':
            case 'layouts':
                resolve(() => {
                    this.sendSessionState()
                })
                return
            default:
                reject('Unknown message type')
        }
    }

    private parseUserMessage(message: MessageTypes.InMessage,
        resolve: (value: () => void | PromiseLike<() => void>) => void,
        reject: (reason?: any) => void) {

        switch (message.messageType) {
            case 'get':
                this.parseGetMessage(message as MessageTypes.GetMessage, resolve, reject)
        }
    }

    private async processMessage(message: MessageTypes.InMessage) {
        return await new Promise<() => void>((resolve, reject) => {
            switch (message.messageSource) {
                case 'simulator':
                    this.parseSimulatorMessage(message as MessageTypes.SimulatorMessage, resolve, reject)
                    break
                case 'user':
                    this.parseUserMessage(message, resolve, reject)
                    break
                default:
                    reject('Unknown source')
            }
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

                    this.destroy()
                }
            )
    }

    // Adds a message to the queue, and tries to process it.
    addMessage(message: MessageTypes.InMessage) {
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
    private sendGraphState() {
        console.log('sending graph state')
        this.pruneSessions()

        const graphData = (this.cy.json() as any).elements

        this.users.forEach((user) => {
            const msg: MessageTypes.DataStateMessage = {
                sessionID: this.sessionID,
                sessionState: this.sessionState,
                type: 'data',
                data: graphData
            }

            user.socket.send(JSON.stringify(msg))
        })
    }

    private getSimulatorInfo(userID: string): Simulator[] {
        return this.simulators.map((sim) => {
            if (sim.userID === userID) {
                return sim
            }

            return {...sim, apikey: null}
        })
    }

    // Sends session info to all users.
    private sendSessionState() {
        console.log('Sending session state')
        this.pruneSessions()

        this.users.forEach((user) => {
            const msg: MessageTypes.SessionStateMessage = {
                sessionID: this.sessionID,
                sessionState: this.sessionState,
                userID: user.userID,
                type: 'session',
                data: {
                    url: this.URL,
                    users: this.users.map((user) => {
                        return {
                            username: user.username,
                            userID: user.userID
                        }
                    }),
                    simulators: this.getSimulatorInfo(user.userID),
                    layoutInfo: getAvailableLayouts()
                }
            }
            console.log('Sending session state to user')

            user.socket.send(JSON.stringify(msg))
        })
    }

    registerSimulator(apiKey: string, socket: WebSocket) {

    }

    deRegisterSimulator(apiKey: string) {

    }

    // Adds a user to the session, giving it a random user ID and username.
    addUser(socket: WebSocket): string {
        const userID = uid.sync(4)
        const username = `user${Math.floor(Math.random() * 10)}`

        this.users.push({
            userID: userID,
            socket: socket,
            username: username,
            apikeys: []
        })

        this.sendSessionState()
        this.sendGraphState()

        return userID
    }

    // Removes a user from the session.
    removeUser(userID: string) {

        this.users.forEach((user) => {
            if (user.userID === userID) {
                user.socket.close()
            }
        })

        this.users = this.users.filter((user) => {
            return user.userID !== userID
        })

        this.sendSessionState()
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
        return this.expirationDate < new Date()
    }

    // Destroys the current session with reason given by param.
    destroy() {
        this.simulators.forEach((sim) => {
            sim.socket.close()
        })

        this.users.forEach((user) => {
            user.socket.close()
        })

        this.cy.destroy()

        this.destroyFun(this.sessionID)
    }
}
