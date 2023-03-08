/**
 * @author Miles van der Lely <m.vanderlely@uva.nl>
 *
 * This file contains the Session class, which is the main class of the server.
 *
 */

import uid from 'uid-safe'
import cytoscape from 'cytoscape'
import { WebSocket } from 'ws'
import { Worker } from 'worker_threads'
import { setTimeout } from 'timers/promises'
import { gzip, gunzip } from 'node:zlib'
import { gzipSync } from 'zlib'
import { Logger } from 'winston'
import { IncomingMessage } from 'http'
import fs from 'fs'

type SessionState = 'disconnected' | 'idle' | 'generating layout' | 'simulating' | 'playing'

type User = {
    readonly userID: string,
    socket: WebSocket,
    username: string,
    apikeys: string[],
    headsets: Headset[],
    width: number,
    height: number,
    panX: number,
    panY: number,
    panK: number
}

type Headset = {
    readonly headsetID: string,
    socket: WebSocket | null
}

// Starting parameters for the simulator.
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

// Simulator instance.
type Simulator = {
    readonly apikey: string | null,
    readonly userID: string,
    socket: WebSocket | null,
    params: SimulatorParam[],
    validator: boolean,
    valid: 'valid' | 'invalid' | 'unknown',
    title: string,
    state: 'disconnected' | 'idle' | 'generating' | 'connecting'
}

export module MessageTypes {
    export type GetType = 'graphState' | 'sessionState' | 'layouts' | 'apiKey' | 'QR'
    export type SetType = 'playstate' | 'graphState' | 'simulator' | 'stopSimulator'
                                      | 'simulatorInstance' | 'layout'
                                      | 'username' | 'graphIndex'
                                      | 'headset' | 'windowSize' | 'pan'

    export interface OutMessage {
        sessionID: string,
        sessionState: SessionState,
        type: 'data' | 'session' | 'uid' | 'headset' | 'pan'
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
        validator?: boolean
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

    export interface SetWindowSizeMessage extends InMessage {
        messageSource: 'user'
        messageType: 'set'
        userID: string
        dataType: 'windowSize'
        params: {
            width: number,
            height: number
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

    export interface PanStateMessage extends OutMessage {
        userID: string,
        type: 'pan',
        data: {
            x: number,
            y: number,
            k: number
        }
    }

    export interface SessionStateMessage extends OutMessage {
        userID: string,
        type: 'session',
        data: {
            currentLayout: AvailableLayout | null,
            url: string,
            sessionURL: string,
            graphIndex: number,
            graphIndexCount: number,
            users: {
                username: string,
                userID: string,
                headsetCount: number
            }[],
            simulators: ServerSimulator[],
            headsets: {
                headsetID: string,
                connected: boolean
            }[]
            simState: {
                step: number,
                stepMax: number
            }
            layoutInfo: LayoutInfo[]
            expirationDate: string
            websocketPort: string
            playmode: boolean
        }
    }

    export interface DataStateMessage extends OutMessage {
        type: 'data',
        data: {
            nodes: any
            edges: any
        }
    }

    export interface HeadsetConnectedMessage extends OutMessage {
        type: 'headset'
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
        data: string,
        keys: (string | null)[]
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
        | 'cise'
        | 'spread'
        | 'd3-force'

export type LayoutSetting =
    |   {
            name: string,
            description: string,
            type: 'number',
            defaultValue: number,
            auto: boolean,
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
    name: AvailableLayout,
    randomize: boolean,
    settings: {name: string, value: number | boolean}[]
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
                    defaultValue: 0,
                    auto: true
                },
                {
                    name: 'rows',
                    description: 'Force number of rows in the grid.',
                    type: 'number',
                    defaultValue: 0,
                    auto: true
                },
                {
                    name: 'cols',
                    description: 'Force number of columns in the grid.',
                    type: 'number',
                    defaultValue: 0,
                    auto: true
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
                    defaultValue: 0,
                    auto: true
                },
                {
                    name: 'spacingFactor',
                    description: 'Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up.',
                    type: 'number',
                    defaultValue: 0,
                    auto: true
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
                    defaultValue: 1,
                    auto: false
                },
                {
                    name: 'nodeOverlap',
                    description: 'Node repulsion (overlapping) multiplier.',
                    type: 'number',
                    defaultValue: 4,
                    auto: false
                },
                {
                    name: 'nestingFactor',
                    description: 'Nesting factor (multiplier) to compute ideal edge length for nested edges.',
                    type: 'number',
                    defaultValue: 1.2,
                    auto: false
                },
                {
                    name: 'coolingFactor',
                    description: 'Cooling factor (how the temperature is reduced between consecutive iterations.',
                    type: 'number',
                    defaultValue: 0.99,
                    auto: false
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
                    defaultValue: 0.25,
                    auto: false
                },
                {
                    name: 'gravityRange',
                    description: 'Gravity range (constant).',
                    type: 'number',
                    defaultValue: 3.8,
                    auto: false
                },
                {
                    name: 'idealEdgeLength',
                    description: 'Ideal (intra-graph) edge length.',
                    type: 'number',
                    defaultValue: 50,
                    auto: false
                },
                {
                    name: 'edgeElasticity',
                    description: 'Divisor to compute edge forces.',
                    type: 'number',
                    defaultValue: 0.45,
                    auto: false
                },
                {
                    name: 'nestingFactor',
                    description: 'Nesting factor (multiplier) to compute ideal edge length for nested edges.',
                    type: 'number',
                    defaultValue: 0.1,
                    auto: false
                },
                {
                    name: 'numIter',
                    description: 'Number of iterations.',
                    type: 'number',
                    defaultValue: 2500,
                    auto: false
                },
                {
                    name: 'nodeRepulsion',
                    description: 'Node repulsion (overlapping) multiplier.',
                    type: 'number',
                    defaultValue: 4500,
                    auto: false
                }
            ]
        },
        // {
        //     name: 'cola',
        //     description: 'The cola layout uses a force-directed physics simulation with several sophisticated constraints.',
        //     link: 'https://github.com/cytoscape/cytoscape.js-cola',
        //     settings: [

        //         {
        //             name: 'convergenceThreshold',
        //             description: 'when the alpha value (system energy) falls below this value, the layout stops.',
        //             type: 'number',
        //             defaultValue: 0.01
        //         },
        //         {
        //             name: 'edgeLength',
        //             description: 'sets edge length directly in simulation.',
        //             type: 'number',
        //             defaultValue: 0
        //         },
        //     ]
        // },
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
                        defaultValue: 0,
                        auto: true
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
    private readonly sessionID: string
    private expirationDate: Date

    /* URL of the source file. */
    private readonly sourceURL: string

    /* Connection settings. */
    private readonly localAddress: string
    private readonly websocketPort: string

    /* Used to store current session graph state. */
    private cy: cytoscape.Core

    /* Server idle/busy. */
    private sessionState: SessionState

    private users: User[]
    private simulators: Simulator[]

    private messageQueue: MessageTypes.InMessage[]

    /* Type dec for session destructor. */
    private readonly destroyFun: (sid: string) => void

    /* Simulation state.
     * step: current step
     * stepMax: max (last) step
     * apiKey: API key for the current simulation
     * params: parameters for the current simulation
     */
    private simState: SimState = {
        step: 0,
        stepMax: 0,
        apiKey: null,
        params: []
    }

    /* Stores graph slices for timeline. */
    private graphHistory: [string, AvailableLayout | null][]

    /* Current graph index. */
    private graphIndex = 0

    private logger: Logger

    /* True if session is in 'play mode' used to demonstrate the simulation. */
    private playmode: boolean

    private currentLayout: AvailableLayout | null

    private cancelSim = false

    private simRunID: {[sessionID: string]: number} = {}

    constructor(sid: string,
                destroyFun: (sid: string) => void,
                sourceURL: string,
                nodes: {[key: string]: any}[],
                edges: {[key: string]: any}[],
                localAddress: string,
                websocketPort: string,
                logger: Logger) {

        this.logger = logger
        this.localAddress = localAddress
        this.websocketPort = websocketPort
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
        this.graphHistory = [[gzipSync(JSON.stringify(data)).toString('base64'), null]]

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

        this.logger.log({
            level: 'info',
            message: 'New session',
            timeout: expDate,
            sid: sid
        })

        this.playmode = false

        this.currentLayout = null
    }

    /* Sets session state. */
    private setState(state: SessionState) {
        // If set state to idle check that all simulators are idle.

        if (state === 'idle') {
            this.simulators.forEach((sim) => {
                if (sim.state !== 'idle') {
                    this.logger.log({
                        level: 'error',
                        message: `Session state changed to idle but simulator ${sim.apikey} is not idle.`,
                        sid: this.sessionID
                    })
                }
            })
        }


        this.sessionState = state



        this.logger.log({
            level: 'info',
            message: `Session state changed to ${state}`,
            sid: this.sessionID
        })

        this.sendSessionState()
    }

    /* Updates graph state and sends it to all users. */
    private changeGraphState(data: object) {
        this.cy.json(data)

        // TODO: Implement validation of graph state.
        this.simulators.forEach((sim) => {
                sim.valid = 'unknown'
            }
        )

        this.sendSessionState()
    }

    /* Stores current graph state in timeline history at current index. */
    private async storeCurrentGraphState() {
        const data = this.cy.json()

        return new Promise((resolve) => {gzip(JSON.stringify(data), (err, buffer) => {
            if (err) {
                this.logger.log('error', `Error while zipping current instance: ${err.message}`)
                resolve(err.message)
                return
            }

            this.graphHistory[this.graphIndex] = [buffer.toString('base64'), this.currentLayout]

            resolve('')
        })})
    }

    /* Adds new slice at end of graph timeline. Takes stringified JSON as input.*/
    private async appendGraphState(data: string, layout: AvailableLayout | null) {
        return new Promise((resolve) => {gzip(data, (err, buffer) => {
            if (err) {
                this.logger.log('error', `Error while zipping current instance: ${err.message}`)
                resolve(err.message)
                return
            }

            this.graphHistory.push([buffer.toString('base64'), layout])

            resolve('')
        })})
    }

    private async time(index: number) {
        await setTimeout(3000, () => {

        })

        await this.loadGraphState(index + 1)
    }

    /* Load slice into timeline at index. */
    private async loadGraphState(index: number) {
        return new Promise((resolve) => {gunzip(Buffer.from(this.graphHistory[index][0], 'base64'), (err, buffer) => {
            if (err) {
                console.log(`Error while zipping current instance: ${err.message}`)
                resolve('Error')
                return
            }

            const data = JSON.parse(buffer.toString())

            // Reset graph state.
            this.cy.elements().remove()

            this.currentLayout = this.graphHistory[index][1]

            this.changeGraphState(this.parseJson(data.elements.nodes, data.elements.edges))

            this.graphIndex = index

            if (this.playmode) {
                this.sendGraphState()
                this.sendSessionState()

                if (this.graphIndex == this.graphHistory.length - 1) {
                    this.playmode = false
                    this.setState('idle')

                    resolve('Resolved')

                    return
                }
                else {
                    this.time(index)
                }
            }

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
                        this.logger.log({
                            level: 'info',
                            message: 'Registered API',
                            title: message.title,
                            params: JSON.parse(message.data),
                        })

                        sim.title = message.title!
                        sim.validator = message.validator!
                        sim.params = JSON.parse(message.data)
                        sim.state = 'idle'
                    }
                })

                resolve(() => {
                    this.sendSessionState()
                })
                break
            case 'data':
                this.logger.log({
                    level: 'verbose',
                    message: 'Received data from API',
                })
                const msg = (message as MessageTypes.SimulatorDataMessage)

                const data = this.parseJson(msg.params.nodes, msg.params.edges)

                // If cancel message is received, reset state.
                if (this.cancelSim) {
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

                    this.setState('idle')

                    this.cancelSim = false

                    resolve(() => {
                        this.sendSessionState()
                        this.sendGraphState()
                    })

                    return
                }


                /* Process new data message. */
                this.storeCurrentGraphState().then(() => {
                    const runID = this.simRunID[this.sessionID]

                    // Save current graph state to fs file with filename simRunID + sessionID.
                    fs.writeFileSync(`./logs/graphs/${this.sessionID}_${this.graphHistory.length}_${runID}.json`,
                        JSON.stringify(this.cy.json()))

                    // Append new slice.
                    this.appendGraphState(JSON.stringify(data), this.currentLayout).then(() => {
                        this.graphIndex = this.graphHistory.length - 1

                        this.changeGraphState(data)

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

                            const runID = this.simRunID[this.sessionID]

                            // Save current graph state to fs file with filename simRunID + sessionID.
                            fs.writeFileSync(`./logs/graphs/${this.sessionID}_${this.graphHistory.length - 1}_${runID}.json`,
                                JSON.stringify(this.cy.json()))


                            this.setState('idle')
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
                this.logger.log('verbose', 'Client requested graphState')

                resolve(() => {
                    this.sendGraphState()
                })

                return
            case 'sessionState':
            case 'layouts':
                this.logger.log('verbose', 'Client requested session state')

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
            case 'playstate':
                const newPlayState = message.params.state

                this.logger.log('info', `Play state: ${newPlayState}`)

                if (newPlayState && !this.playmode) {
                    // Set new timeline index.

                    this.setState('playing')

                    var newIndex = this.graphIndex
                    if (newIndex  == this.graphHistory.length) {
                        newIndex = 0

                        this.setState('idle')
                    }

                    this.storeCurrentGraphState().then(() => {
                        this.loadGraphState(newIndex).then(() => {
                            resolve(() => {
                                this.sendGraphState()
                            })
                        })
                    })
                }

                this.playmode = newPlayState
                break

            case 'username':
                this.users = this.users.map((user) => {
                    if (user.userID === message.userID) {
                        // Sanitize username
                        message.params.username = message.params.username.replace(/[^a-zA-Z0-9]/g, '')

                        if (message.params.username.length > 10) {
                            message.params.username = message.params.username.substring(0, 10)
                        }

                        if (message.params.username.length === 0) {
                            return user
                        }

                        user.username = message.params.username
                    }

                    return user
                })

                resolve(() => {
                    this.sendSessionState()
                })

                break
            case 'layout':
                this.setState('generating layout')

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
                    validator: true,
                    valid: 'unknown',
                    state: 'disconnected'
                })

                resolve(() => {
                    this.sendSessionState()
                })

                break
            case 'stopSimulator':
                // Stop simulator instance.
                if (this.sessionState !== 'simulating') {
                    reject('Session is not simulating')
                    return
                }

                this.logger.log('warn', 'Stopping simulator')

                this.cancelSim = true

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

                this.setState('simulating')

                if (this.simRunID[this.sessionID] == undefined) {
                    this.simRunID[this.sessionID] = 0
                } else {
                    this.simRunID[this.sessionID]++
                }

                const runID = this.simRunID[this.sessionID]

                // Save current graph state to fs file with filename simRunID + sessionID.
                fs.writeFileSync(`./logs/graphs/${this.sessionID}_${this.graphIndex + 1}_${runID}.json`,
                    JSON.stringify(this.cy.json()))

                // Discard timeline slices after current index pos.
                this.graphHistory.splice(this.graphIndex + 1, this.graphHistory.length - (this.graphIndex + 1))

                resolve(() => {
                    this.sendSessionState()
                    this.sendSimulatorMessage()
                })
                break
            case 'graphState':
                // Update server graph state.
                this.changeGraphState(this.parseJson(message.params.nodes, message.params.edges))

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

                this.setState('generating layout')

                this.sendSessionState()

                this.storeCurrentGraphState().then(() => {
                    this.loadGraphState(message.params.index).then(() => {
                        resolve(() => {
                            this.setState('idle')
                            this.sendGraphState()
                        })
                    })
                })
                break
            case 'headset':
                this.users.forEach((user) => {
                    if (user.userID === message.userID) {
                        const headsetID = uid.sync(4)

                        user.headsets.push({
                            headsetID: headsetID,
                            socket: null
                        })
                    }
                })

                resolve(() => {this.sendSessionState()})
                break
            case 'windowSize':
                this.users.forEach((user) => {
                    if (user.userID === message.userID) {
                        user.width = message.params.width
                        user.height = message.params.height
                    }
                })

                resolve(() => {this.sendSessionState()})
                break;
            case 'pan':
                this.users.forEach((user) => {
                    if (user.userID === message.userID) {
                        user.panX = message.params.x
                        user.panY = message.params.y
                        user.panK = message.params.k
                    }
                })

                resolve(() => {this.sendPanState(message.userID)})
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

            this.logger.log('warn', "Layout generation timed out")
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
                randomize: settings.randomize,
                width: 5000,
                height: 5000
            })

            worker.on('message', (result) => {
                ac.abort()

                this.currentLayout = settings.name

                this.changeGraphState(result)

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
        if (this.messageQueue.length === 0)
            return

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

        this.users.forEach((user) => {
            user.headsets = user.headsets.map((headset) => {
                if (!headset.socket)
                    return headset

                if (headset.socket.readyState == headset.socket.CLOSING
                    || headset.socket.readyState == headset.socket.CLOSED) {

                    headset.socket = null
                    return headset
                }

                return headset
            })
        })
    }

    public removeHeadset(headsetKey: string) {
        this.users.forEach((user) => {
            user.headsets = user.headsets.map((headset) => {
                if (!headset.socket)
                    return headset

                if (headset.headsetID === headsetKey) {
                    this.logger.log('info', 'Disconnected headset')

                    headset.socket = null
                    return headset
                }

                return headset
            })
        })

        this.sendSessionState()
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

            user.headsets.forEach((headset) => {
                if (headset.socket) {
                    headset.socket.send(JSON.stringify(msg))
                }
            })
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

            this.setState('idle')

            return
        }

        this.simulators.forEach((sim) => {
            if (sim.apikey === this.simState.apiKey) {
                sim.state = 'generating'
            }
        })

        this.setState('simulating')

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

    private sendHeadsetConnectedMessage(userID: string) {
        this.pruneSessions()

        this.users.forEach((user) => {
            if (user.userID === userID) {
                const msg: MessageTypes.HeadsetConnectedMessage = {
                    sessionID: this.sessionID,
                    sessionState: this.sessionState,
                    type: 'headset'
                }

                user.socket.send(JSON.stringify(msg))
            }
        })
    }

    // Sends session info to all users.
    private sendSessionState() {
        this.pruneSessions()

        const dateDiff = new Date(this.expirationDate.getTime() - new Date().getTime())

        this.users.forEach((user) => {
            const msg: MessageTypes.SessionStateMessage = {
                sessionID: this.sessionID,
                sessionState: this.sessionState,
                userID: user.userID,
                type: 'session',
                data: {
                    currentLayout: this.currentLayout,
                    url: this.sourceURL,
                    users: this.users.map((user) => {
                        return {
                            username: user.username,
                            userID: user.userID,
                            headsetCount: user.headsets.filter((headset) => {return headset.socket !== null}).length,
                            width: user.width,
                            height: user.height,
                            panX: user.panX,
                            panY: user.panY,
                            panK: user.panK
                        }
                    }),
                    headsets: user.headsets.map((headset) => {
                        return {
                            headsetID: headset.headsetID,
                            connected: headset.socket !== null
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
                    sessionURL: this.localAddress,
                    layoutInfo: getAvailableLayouts(),
                    expirationDate: `${dateDiff.getHours()} hours, ${dateDiff.getMinutes()} minutes`,
                    websocketPort: this.websocketPort,
                    playmode: this.playmode
                }
            }

            user.socket.send(JSON.stringify(msg))

            user.headsets.forEach((headset) => {
                if (headset.socket) {
                    headset.socket.send(JSON.stringify(msg))
                }
            })
        })
    }

    private sendPanState(userID: string) {
        this.pruneSessions()

        this.users.forEach((user) => {
            if (user.userID !== userID)
                return

            const msg: MessageTypes.PanStateMessage = {
                userID: userID,
                type: 'pan',
                sessionID: this.sessionID,
                sessionState: this.sessionState,
                data: {
                    x: user.panX,
                    y: user.panY,
                    k: user.panK,
                }
            }

            user.headsets.forEach((headset) => {
                if (headset.socket) {
                    headset.socket.send(JSON.stringify(msg))
                }
            })
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

    registerHeadset(headsetKey: string, userID: string, socket: WebSocket) {
        this.users.forEach((user) => {
            if (user.userID === userID) {
                user.headsets.forEach((headset) => {
                    if (headset.headsetID === headsetKey) {
                        this.logger.log('info', 'Registered headset')

                        headset.socket = socket
                    }
                })
            }
        })

        this.sendHeadsetConnectedMessage(userID)
        this.sendGraphState()
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
    addUser(socket: WebSocket, username: string | null, keys: number, req: IncomingMessage): string {
        // const userID = uid.sync(4)
        const userID = req.socket.remoteAddress

        if (userID === undefined) {
            throw new Error('Could not get user ID')
        }

        let tmp_username = `user${Math.floor(Math.random() * 10)}`

        if (username !== null && username.replace(/[^a-zA-Z0-9]/g, '') !== '') {
            // Sanitize username
            username = username.replace(/[^a-zA-Z0-9]/g, '')

            const userNameMaxLength = 10
            // Check username max length
            if (username.length > userNameMaxLength) {
                username = username.substring(0, userNameMaxLength)
            }

            tmp_username = username
        }

        if (keys !== undefined) {
            for (let i = 0; i < keys; i++) {
                this.simulators.push({
                    apikey: uid.sync(4),
                    userID: userID,
                    socket: null,
                    params: [],
                    title: '',
                    validator: true,
                    valid: 'unknown',
                    state: 'disconnected'
                })
            }
        }

        this.users.push({
            userID: userID,
            socket: socket,
            username: tmp_username,
            apikeys: [],
            headsets: [],
            width: 0,
            height: 0,
            panX: 0,
            panY: 0,
            panK: 1
        })

        const msg: MessageTypes.UIDMessage = {
            sessionID: this.sessionID,
            type: 'uid',
            sessionState: this.sessionState,
            data: userID,
            keys: this.simulators.filter((sim) => {
                return ((sim.userID === userID) && sim.apikey)
            }).map((sim) => {
                return sim.apikey
            })
        }

        socket.send(JSON.stringify(msg))

        this.sendGraphState()
        this.sendSessionState()

        return userID
    }

    public getKeys(userID: string) {
        return this.simulators.filter((sim) => {
            return ((sim.userID === userID) && sim.apikey)
        }).map((sim) => {
            return sim.apikey
        })
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
