import uid from 'uid-safe'
import cytoscape from 'cytoscape'
import { WebSocket } from 'ws';
import { Worker } from 'worker_threads'
import { setTimeout } from 'timers/promises'
import { gzip, gunzip } from 'node:zlib'
import { gzipSync } from 'zlib';
import QRCode from 'qrcode'

type SessionState = 'idle' | 'busy'

type User = {
    readonly userID: string,
    socket: WebSocket,
    username: string,
    apikeys: string[],
    headsetIDs: string[]
}

type Headset = {
    readonly headsetID: string,
    socket: WebSocket,
    readonly userID: string
}

type SimulatorParam =
    {
        attribute: string,
        type: 'boolean'
        defaultValue: boolean
        value: boolean
    }
    | {
        attribute: string,
        type: 'integer' | 'float'
        defaultValue: number
        value: number
    }
    | {
        attribute: string,
        type: 'string'
        defaultValue: string
        value: string
    }

type Simulator = {
    readonly apikey: string | null,
    readonly userID: string,
    socket: WebSocket | null,
    params: SimulatorParam[],
    title: string,
    state: 'disconnected' | 'idle' | 'generating' | 'connecting'
}

export module MessageTypes {
    export interface OutMessage {
        sessionID: string,
        sessionState: SessionState,
        type: 'data' | 'session' | 'uid'
    }

    export interface InMessage {
        sessionID: string,
        userID: string,
        messageSource: 'simulator' | 'user'
        messageType: 'get' | 'set'
        apiKey?: string
        data?: any
        dataType?: any
        title?: string
    }

    export interface RegisterSimulatorMessage extends InMessage {
        sessionID: string,
        messageSource: 'simulator'
        messageType: 'set'
        dataType: 'register'
        apiKey: string
        params: SimulatorParam[]
    }

    export interface SimulatorDataMessage extends InMessage {
        sessionID: string,
        messageSource: 'simulator',
        messageType: 'set',
        dataType: 'data'
        apiKey: string,
        params: {
            nodes: any,
            edges: any,
            params: any
        }
    }

    export type GetType = 'graphState' | 'sessionState' | 'layouts' | 'apiKey' | 'QR'
    export type SetType = 'graphState' | 'simulator' | 'simulatorInstance' | 'layout' | 'username' | 'graphIndex'

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

    export interface SetUsernameMessage extends InMessage {
        messageSource: 'user'
        messageType: 'set'
        userID: string
        dataType: 'username'
        params: {
            username: string
        }
    }

    export interface SetSimulatorMessage extends InMessage {
        messageSource: 'user'
        messageType: 'set'
        userID: string,
        dataType: 'simulator'
        params: {
            stepCount: number,
            apiKey: string
        }
    }

    export interface SetSimulatorInstanceMessage extends InMessage {
        messageSource: 'user'
        messageType: 'set'
        userID: string,
        dataType: 'simulatorInstance'
    }

    type ServerSimulator = {
        readonly apikey: string | null,
        username: string,
        params: SimulatorParam[],
        title: string,
        state: 'disconnected' | 'idle' | 'generating' | 'connecting'
    }

    export interface SessionStateMessage extends OutMessage {
        userID: string,
        type: 'session',
        data: {
            url: string,
            graphIndex: number,
            graphIndexCount: number,
            users: {

            },
            simulators: ServerSimulator[],
            simState: {
                step: number,
                stepMax: number
            }
            layoutInfo: LayoutInfo[]
            expirationDate: Date
        }
    }

    export interface DataStateMessage extends OutMessage {
        type: 'data',
        data: {
            nodes: any
            edges: any
        }
    }

    export interface SimulatorSetMessage extends OutMessage {
        type: 'data',
        data: {
            nodes: any
            edges: any
            params: SimulatorParam[]
        }
    }

    export interface UIDMessage extends OutMessage {
        type: 'uid',
        data: string
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

type LayoutSettings = {
    name: string,
    settings: {[key: string]: number | boolean}
}

/* Returns layout information to be sent to client. */
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

type SimState = {
    step: number,
    stepMax: number,
    apiKey: null | string,
    params: SimulatorParam[]
}

export class Session {
    private readonly sourceURL: string
    private readonly sessionID: string

    private readonly localAddress: string

    private expirationDate: Date
    private cy: cytoscape.Core

    /* Server idle/busy. */
    private sessionState: SessionState

    private users: User[]
    private simulators: Simulator[]

    private messageQueue: MessageTypes.InMessage[]

    /* Session destructor function. */
    private readonly destroyFun: (sid: string) => void

    /* Simulation state. */
    private simState: SimState = {
        step: 0,
        stepMax: 0,
        apiKey: null,
        params: []
    }

    /* Stores graph slices for timeline. */
    private graphHistory: string[]
    private graphIndex = 0

    constructor(sid: string,
                destroyFun: (sid: string) => void,
                sourceURL: string,
                nodes: {[key: string]: any}[],
                edges: {[key: string]: any}[],
                localAddress: string) {

        this.localAddress = localAddress
        this.sourceURL = sourceURL
        this.destroyFun = destroyFun
        this.sessionID = sid
        let expDate = new Date()

        /* Session expires in six hours. */
        expDate.setHours(expDate.getHours() + 6)

        this.expirationDate = expDate

        /* Load graph data. */
        const data = this.parseJson(nodes, edges)

        /* Compress graph state and store it. */
        this.graphHistory = [gzipSync(JSON.stringify(data)).toString('base64')]

        /* Startup cytoscape session. */
        this.cy = cytoscape({
            headless: true,
            styleEnabled: true,
        })

        this.cy.json(data)

        this.users = []
        this.simulators = []
        this.messageQueue = []
        this.sessionState = 'idle'
    }

    /* Sets session state. */
    private setState(state: SessionState) {
        this.sessionState = state

        this.sendSessionState()
    }

    /* Stores current graph state in timeline history at current index. */
    private async storeCurrentGraphState() {
        const data = this.cy.json()

        return new Promise((resolve) => {gzip(JSON.stringify(data), (err, buffer) => {
            if (err) {
                console.log(`Error while zipping current instance: ${err.message}`)
                resolve(err.message)
                return
            }

            this.graphHistory[this.graphIndex] = buffer.toString('base64')

            resolve('')
        })})
    }

    /* Adds new slice at end of graph timeline. Takes stringified JSON as input.*/
    private async appendGraphState(data: string) {
        return new Promise((resolve) => {gzip(data, (err, buffer) => {
            if (err) {
                console.log(`Error while zipping current instance: ${err.message}`)
                resolve(err.message)
                return
            }

            this.graphHistory.push(buffer.toString('base64'))

            resolve('')
        })})
    }

    /* Load slice into timeline at index. */
    private async loadGraphState(index: number) {
        console.log(`Loading state ${index}`)

        return new Promise((resolve) => {gunzip(Buffer.from(this.graphHistory[index], 'base64'), (err, buffer) => {
            if (err) {
                console.log(`Error while zipping current instance: ${err.message}`)
                resolve('Error')
                return
            }

            const data = JSON.parse(buffer.toString())

            // Reset graph state.
            this.cy.elements().remove()

            this.cy.json(this.parseJson(data.elements.nodes, data.elements.edges))

            this.graphIndex = index

            resolve('Resolved')
        })})
    }

    /* Parse message sent by simulator. */
    private parseSimulatorMessage(message: MessageTypes.InMessage,
        resolve: (value: () => void | PromiseLike<() => void>) => void,
        reject: (reason?: any) => void) {

        switch (message.dataType) {
            case 'register':
                /* Register new simulator. */
                this.simulators.forEach((sim) => {
                    if (sim.apikey === message.apiKey) {
                        sim.title = message.title!
                        sim.params = JSON.parse(message.data)
                        sim.state = 'idle'
                    }
                })

                resolve(() => {
                    this.sendSessionState()
                })
                break
            case 'data':
                /* Process new data message. */
                this.storeCurrentGraphState().then(() => {
                    const msg = (message as MessageTypes.SimulatorDataMessage)

                    const data = this.parseJson(msg.params.nodes, msg.params.edges)

                    // Append new slice.
                    this.appendGraphState(JSON.stringify(data)).then(() => {
                        this.graphIndex = this.graphHistory.length - 1

                        this.cy.json(data)

                        // Update sim state.
                        this.simState = {
                            ...this.simState,
                            step: this.simState.step + 1,
                        }

                        // If simulation is done, reset state.
                        if (this.simState.step >= this.simState.stepMax) {
                            this.simulators.forEach((sim) => {
                                if (sim.apikey === this.simState.apiKey) {
                                    sim.state = 'idle'
                                }
                            })

                            this.simState = {
                                step: 0,
                                stepMax: 0,
                                apiKey: null,
                                params: msg.params.params
                            }

                            this.sessionState = 'idle'
                        } else {
                            // Otherwise send new message to sim.
                            this.sendSimulatorMessage()
                        }

                        resolve(() => {
                            this.sendSessionState()
                            this.sendGraphState()
                        })
                    })
                })
        }
    }

    /* Parse get message from client. */
    private parseGetMessage(message: MessageTypes.GetMessage,
        resolve: (value: () => void | PromiseLike<() => void>) => void,
        reject: (reason?: any) => void) {

        switch (message.dataType) {
            case 'QR':
                break
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

    /* Parse set message from client. */
    private parseSetMessage(message: MessageTypes.SetMessage,
        resolve: (value: () => void | PromiseLike<() => void>) => void,
        reject: (reason?: any) => void) {

        switch (message.dataType) {
            case 'username':
                this.users = this.users.map((user) => {
                    if (user.userID === message.userID) {
                        user.username = message.params.username
                    }

                    return user
                })

                resolve(() => {
                    this.sendSessionState()
                })

                break
            case 'layout':
                this.setState('busy')

                this.setLayout(message.params.layout).then(() => {
                    resolve(() => {
                        this.setState('idle')
                        this.sendGraphState()
                    })
                })

                break
            case 'simulatorInstance':
                // Request new simulator instance.
                this.simulators.push({
                    apikey: uid.sync(4),
                    userID: message.userID,
                    socket: null,
                    params: [],
                    title: '',
                    state: 'disconnected'
                })

                resolve(() => {
                    this.sendSessionState()
                })

                break
            case 'simulator':
                // Start new simulation on existing sim.
                if (this.sessionState !== 'idle') {
                    reject('Session is currently busy')
                    return
                }

                this.simState = {
                    step: 0,
                    stepMax: message.params.stepCount,
                    apiKey: message.params.apiKey,
                    params: message.params.params
                }

                this.sessionState = 'busy'

                // Discard timeline slices after current index pos.
                this.graphHistory.splice(this.graphIndex + 1, this.graphHistory.length - (this.graphIndex + 1))

                resolve(() => {
                    this.sendSessionState()
                    this.sendSimulatorMessage()
                })
                break
            case 'graphState':
                // Update server graph state.
                this.cy.json(this.parseJson(message.params.nodes, message.params.edges))

                resolve(() => {
                    this.sendGraphState()
                })
                break
            case 'graphIndex':
                // Set new timeline index.
                if (message.params.index < 0 || message.params.index >= this.graphHistory.length) {
                    reject(`Graph index ${message.params.index} out of bounds`)

                    return
                }

                this.sessionState = 'busy'

                this.sendSessionState()

                this.storeCurrentGraphState().then(() => {
                    this.loadGraphState(message.params.index).then(() => {
                        resolve(() => {
                            this.sessionState = 'idle'

                            this.sendSessionState()
                            this.sendGraphState()
                        })
                    })
                })
        }
    }

    private parseUserMessage(message: MessageTypes.InMessage,
        resolve: (value: () => void | PromiseLike<() => void>) => void,
        reject: (reason?: any) => void) {

        switch (message.messageType) {
            case 'get':
                this.parseGetMessage(message as MessageTypes.GetMessage, resolve, reject)
                break
            case 'set':
                this.parseSetMessage(message as MessageTypes.SetMessage, resolve, reject)
                break
        }
    }

    async layoutTimer(resolve: any, worker: Worker, signal: AbortSignal ) {
        try {
            await setTimeout(60000, null, {
                signal: signal
            })

            worker.terminate()

            resolve('')
        } catch {

        }
    }

    async setLayout(settings: LayoutSettings) {
        return new Promise((layoutResolve) => {
            if (!(getAvailableLayouts().map((layoutInfo) => {return layoutInfo.name}).includes(settings.name as AvailableLayout))) {
                return
            }

            const worker = new Worker('./lib/workers/layout.worker.js')
            const ac = new AbortController()

            this.layoutTimer(layoutResolve, worker, ac.signal).finally(() => {
                ac.abort()
            })

            worker.postMessage({
                graphData: this.cy.json(),
                settings: settings,
                width: 3000,
                height: 3000
            })

            worker.on('message', (result) => {
                ac.abort()

                this.cy.json(result)

                layoutResolve('')
            })
        })
    }

    private async processMessage(message: MessageTypes.InMessage) {
        return await new Promise<() => void>((resolve, reject) => {
            switch (message.messageSource) {
                case 'simulator':
                    this.parseSimulatorMessage(message, resolve, reject)
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

                    // this.destroy()
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

    sendSimulatorMessage() {
        const sim = this.simulators.filter((sim) => {
            return sim.apikey === this.simState.apiKey
        })

        if (sim.length === 0 || this.simState.apiKey === null || sim[0].socket === null) {
            this.simState = {
                step: 0,
                stepMax: 0,
                apiKey: null,
                params: []
            }

            this.sessionState = 'idle'

            this.sendSessionState()

            return
        }

        this.simulators.forEach((sim) => {
            if (sim.apikey === this.simState.apiKey) {
                sim.state = 'generating'
            }
        })

        this.sessionState = 'busy'

        const msg: MessageTypes.SimulatorSetMessage = {
            sessionID: this.sessionID,
            sessionState: this.sessionState,
            type: 'data',
            data: {
                nodes: (this.cy.json() as any).elements.nodes,
                edges: (this.cy.json() as any).elements.edges,
                params: this.simState.params
            }
        }

        sim[0].socket?.send(JSON.stringify(msg))
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
        this.pruneSessions()

        this.users.forEach((user) => {
            const msg: MessageTypes.SessionStateMessage = {
                sessionID: this.sessionID,
                sessionState: this.sessionState,
                userID: user.userID,
                type: 'session',
                data: {
                    url: this.sourceURL,
                    users: this.users.map((user) => {
                        return {
                            username: user.username,
                            userID: user.userID
                        }
                    }),
                    graphIndex: this.graphIndex,
                    graphIndexCount: this.graphHistory.length,
                    simulators: this.getSimulatorInfo(user.userID).map((sim) => {
                        return {
                            apikey: sim.apikey,
                            username: this.users.filter((user) => {
                                return (user.userID === sim.userID)
                            }).map((user) => {
                                return user.username
                            })[0],
                            params: sim.params,
                            state: sim.state,
                            title: sim.title
                        }
                    }),
                    simState: {
                        step: this.simState.step,
                        stepMax: this.simState.stepMax
                    },
                    layoutInfo: getAvailableLayouts(),
                    expirationDate: this.expirationDate
                }
            }

            user.socket.send(JSON.stringify(msg))
        })
    }

    registerSimulator(apiKey: string, socket: WebSocket) {
        this.simulators.forEach((sim) => {
            if (sim.apikey === apiKey && sim.state === 'disconnected') {
                sim.socket = socket
                sim.state = 'connecting'
            }
        })

        this.sendSessionState()
    }

    deRegisterSimulator(apiKey: string) {
        this.simulators.forEach((sim) => {
            if (sim.apikey === apiKey) {
                sim.socket = null
                sim.params = []
                sim.state = 'disconnected'
            }
        })

        this.sendSessionState()
    }

    // Adds a user to the session, giving it a random user ID and username.
    addUser(socket: WebSocket): string {
        const userID = uid.sync(4)
        const username = `user${Math.floor(Math.random() * 10)}`

        this.users.push({
            userID: userID,
            socket: socket,
            username: username,
            apikeys: [],
            headsetIDs: []
        })

        const msg: MessageTypes.UIDMessage = {
            sessionID: this.sessionID,
            type: 'uid',
            sessionState: this.sessionState,
            data: userID
        }

        socket.send(JSON.stringify(msg))

        this.sendGraphState()
        this.sendSessionState()

        return userID
    }

    // Removes a user from the session.
    removeUser(userID: string) {
        this.users.forEach((user) => {
            if (user.userID === userID) {
                user.socket.close()
            }
        })

        this.simulators.forEach((sim) => {
            if (!sim.socket)
                return

            if (sim.userID === userID) {
                sim.socket.close()
            }
        })

        this.simulators = this.simulators.filter((sim) => {
            return (sim.userID !== userID)
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
            if (!sim.socket)
                return

            sim.socket.close()
        })

        this.users.forEach((user) => {
            user.socket.close()
        })

        this.cy.destroy()

        this.destroyFun(this.sessionID)
    }
}
