/**
 * @author Miles van der Lely <m.vanderlely@uva.nl>
 *
 * This file contains the Session class, which is the main class of the server.
 *
 */

import uid from 'uid-safe'
import cytoscape from 'cytoscape'
import WebSocket from 'ws'
import { Worker } from 'worker_threads'
import { setTimeout } from 'timers/promises'
import { gzip, gunzip } from 'node:zlib'
import { gzipSync } from 'zlib'
import { Logger } from 'winston'
import { IncomingMessage } from 'http'
import fs from 'fs'

import * as MessageTypes from './messagetypes'
import * as Parser from './parser'

import * as Types from 'shared'
// import { BasicGraph } from 'shared/graph'
// import { BasicGraph } from 'shared/src/graph/BasicGraph'

export type AvailableLayout =
        | 'null'
        | 'random'
        | 'cose'
        | 'grid'
        | 'circle'
        | 'breadthfirst'
        | 'fcose'
        | 'euler'

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

export interface LayoutSettings {
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
        // {
        //     name: 'cise',
        //     description: 'CiSE(Circular Spring Embedder) is an algorithm based on the traditional force-directed layout scheme with extensions to move and rotate nodes in the same cluster as a group.',
        //     link: 'https://github.com/iVis-at-Bilkent/cytoscape.js-cise',
        //     settings: []
        // },
        // {
        //     name: 'spread',
        //     description: '',
        //     link: '',
        //     settings: [
        //             {
        //                 name: 'minDist',
        //                 description: 'Minimum distance between nodes.',
        //                 type: 'number',
        //                 defaultValue: 0,
        //                 auto: true
        //             },
        //     ]
        // }
    ]
}

export class Session {
    private readonly sessionID: string
    private expirationDate: Date

    /* URL of the source file. */
    private readonly sourceURL: string

    /* Connection settings. */
    private readonly localAddress: string
    // private readonly websocketPort: number
    private readonly websocketPort: string

    /* Used to store current session graph state. */
    private cy: cytoscape.Core

    /* Server idle/busy. */
    private sessionState: Types.SessionState

    private users: Types.User[]
    private simulators: Types.Simulator.Simulator[]

    private messageQueue: MessageTypes.Message<keyof MessageTypes.MessageTypeMap>[]

    /* Type dec for session destructor. */
    private readonly destroyFun: (sid: string) => void

    /* Stores global variables for the session. */
    private globals: Record<string, Types.Graph.Attribute<Types.Graph.AttributeType>>


    private globalsGeneratedOn = 0

    /* Simulation state.
     * step: current step
     * stepMax: max (last) step
     * apiKey: API key for the current simulation
     * params: parameters for the current simulation
     */
    private simState: Types.Simulator.SimulatorState | null = null
    //private simulatorState: Types.Simulator.SimulatorState | null = null //LAU

    /* Stores graph slices for timeline. */
    private graphHistory: [string, AvailableLayout | null][]

    /* Current graph index. */
    private graphIndex = 0

    private logger: Logger

    /* True if session is in 'play mode' used to demonstrate the simulation. */
    private playmode: boolean

    private currentLayout: AvailableLayout | null

    private cancelSim = false

    private simRunID: Record<string, number> = {}

    // private parseJson: (edges,nodes) => {}

    constructor(sid: string,
                destroyFun: (sid: string) => void,
                sourceURL: string,
                graph: Types.Graph.BasicGraph,
                //graph: Types.CytoGraph,//Types.Graph.BasicGraph, //LAU
                localAddress: string,
                websocketPort: string,
                logger: Logger) {

        this.logger = logger
        this.localAddress = localAddress
        this.websocketPort = websocketPort
        this.sourceURL = sourceURL
        this.destroyFun = destroyFun
        this.sessionID = sid
        const expDate = new Date()

        /* Session expires in six hours. */
        expDate.setHours(expDate.getHours() + 6)

        this.expirationDate = expDate



        /* Startup cytoscape session. */
        this.cy = cytoscape({
            headless: true,
            styleEnabled: true,
        })

        /* Load graph data. */
        const data = this.parseJson(graph.nodes, graph.edges)

        /* Compress graph state and store it. */

        this.cy.json(data) //Added by LAU
        
        console.log('data in session constructor')
        console.log(data)
        this.graphHistory = [[gzipSync(JSON.stringify(data)).toString('base64'), null]]


        this.users = []
        this.simulators = []
        this.messageQueue = []
        this.sessionState = 'idle'
        this.simState = {
            startTime: new Date,
            currentStep: 0,
            steps: 0,
            simulatorKey: 'None',
            userID: 'no user',
            parameters: 'none'
        }//new Types.Simulator.SimulatorState

        this.logger.log({
            level: 'info',
            message: 'New session',
            timeout: expDate,
            sid: sid
        })

        this.playmode = false

        this.currentLayout = null

        // this.globals = globals //COMMENTED BY LAU
    }

    /* Sets session state. */
    private setState(state: Types.SessionState) {
        // If set state to idle check that all simulators are idle.

        if (state === 'idle') {
            this.simulators.forEach((sim) => {
                if (sim.state !== 'idle') {
                    this.logger.log({
                        level: 'error',
                        message: `Session state changed to idle but simulator ${sim.key} is not idle.`,
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
            this.logger.log('info', 'Timeout')
        })

        await this.loadGraphState(index + 1)
    }

    private parseJson(
        nodes: {[key: string]: any}[],
        edges: {[key: string]: any}[]) {
        return {
            elements: {
                nodes: nodes.map((node) => {
                    if (!Object.keys(node).includes('data')) {
                        node['data'] = {}
                    }

                    if (Object.keys(node).includes('attributes')) {
                        node['data'] = node['attributes']
                    }

                    if (Object.keys(node).includes('id')) {
                        node['data']['id'] = node['id'].toString()
                    }

                    return node
                }),
                edges: edges.map((edge, index) => {
                    // IF edge contains data, edgekeys is data, otherwise just edgekeys
                    const edgeData = (edge['data']) ? {...edge['data']} : {...edge}
                    const edgeKeys = Object.keys(edgeData)

                    if (!Object.keys(edge).includes('data')) {
                        edge['data'] = {}
                    }

                    if (edgeKeys.includes('attributes')) {
                        edge['data'] = edgeData.attributes
                        edge['attributes'] = {}
                    }

                    if (edgeKeys.includes('id')) {
                        edge['data']['id'] = edgeData.id.toString()
                    }

                    if (!edgeKeys.includes('id')) {
                        edge['data']['id'] = `e${index}`
                    }

                    if (edgeKeys.includes('source')) {
                        edge['data']['source'] = edgeData.source.toString()
                    }

                    if (edgeKeys.includes('target')) {
                        edge['data']['target'] = edgeData.target.toString()
                    }

                    return edge
                })
            }
        }
    }

    /* Load slice into timeline at index. */
    private async loadGraphState(index: number) {
        return new Promise((resolve) => {gunzip(Buffer.from(this.graphHistory[index][0], 'base64'), (err, buffer) => {
            if (err) {
                this.logger.log('error', `Error while zipping current instance: ${err.message}`)
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

    private handleRegisterSimulatorMessage(
        message: MessageTypes.Message<'registerSimulator'>,
        resolve: (value: () => void) => void,
        reject: (error: Error) => void) {

        const payload = message.payload

        // /* Check if simulator is already registered. */
        // for (const sim of this.simulators) {
        //     if (sim.key === payload.apikey) {
        //         this.logger.log({
        //             level: 'error',
        //             message: 'Simulator already registered',
        //             title: payload.title,
        //             params: payload.params,
        //         })

        //         reject('Simulator already registered')
        //     }
        // }

        /* Register new simulator. */
        this.simulators.forEach((sim) => {
            if (sim.key === payload.apikey) {
                this.logger.log({
                    level: 'info',
                    message: 'Registered API',
                    title: payload.title,
                    params: payload.params,
                })

                sim.title = payload.title
                sim.validator = payload.validator
                sim.params = payload.params
                sim.state = 'idle'
            }
        })

        this.logger.log({
            level: 'info',
            message: 'Registered Simulator Instance',
            title: payload.title,
            params: payload.params,
            validator: payload.validator,
        })

        resolve(() => {
            this.sendSessionState()
        })
    }

    private handleSimulatorDataMessage(message: MessageTypes.Message<'simulatorResponse'>,
        resolve: (value: () => void) => void,
        reject: (error: Error) => void)  {

        const payload = message.payload

        const data = this.parseJson(payload.nodes,
            payload.edges)

        // If cancel message is received, reset state.
        if (this.cancelSim) {
            this.simulators.forEach((sim) => {
                if (sim.key === this.simState.apiKey) {
                    sim.state = 'idle'
                }
            })

            this.simState = {
                step: 0,
                stepMax: 0,
                name: '',
                apiKey: null,
                params: payload.params,
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

                this.globals = payload.globals

                this.globalsGeneratedOn = this.graphIndex

                this.changeGraphState(data)

                // Update sim state.
                this.simState = {
                    ...this.simState,
                    step: this.simState.step + 1,
                }

                // If simulation is done, reset state.
                if (this.simState.step >= this.simState.stepMax) {
                    this.simulators.forEach((sim) => {
                        if (sim.key === this.simState.apiKey) {
                            sim.state = 'idle'
                        }
                    })

                    this.simState = {
                        step: 0,
                        stepMax: 0,
                        apiKey: null,
                        name: '',
                        params: payload.params
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

    /* Parse message sent by simulator. */
    private parseSimulatorMessage<Type extends keyof MessageTypes.MessageTypeMap>(message: MessageTypes.Message<Type>,
        resolve: (value: () => void | PromiseLike<() => void>) => void,
        reject: (reason?: any) => void) {

        switch (message.type) {
            case 'registerSimulator':
                this.handleRegisterSimulatorMessage(message as MessageTypes.Message<'registerSimulator'>, resolve, reject)

                break
            case 'getData':  //used to be data --> changed by lau
                this.handleSimulatorDataMessage(message as MessageTypes.Message<'simulatorResponse'>, resolve, reject)
        }
    }

    /* Parse get message from client. */
    private parseGetMessage(message: MessageTypes.Message<'getData'>,
        resolve: (value: () => void | PromiseLike<() => void>) => void,
        reject: (reason?: any) => void) {

        switch (message.payload) {
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

    private handlePlayStateMessage(message: MessageTypes.Message<'setPlayState'>,
        resolve: (value: () => void | PromiseLike<() => void>) => void,
        reject: (reason?: any) => void) {

        const newPlayState = message.payload.playState

        this.logger.log('info', `Play state: ${newPlayState}`)

        if (newPlayState && !this.playmode) {
            // Set new timeline index.

            this.setState('playing')

            let newIndex = this.graphIndex
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
    }

    private handleChangeUsernameMessage(message: MessageTypes.Message<'changeUsername'>,
        resolve: (value: () => void | PromiseLike<() => void>) => void,
        reject: (reason?: any) => void) {

        const payload = message.payload

        this.users = this.users.map((user) => {
            if (user.userID === message.senderID) {
                // Sanitize username
                payload.username = payload.username.replace(/[^a-zA-Z0-9]/g, '')

                if (payload.username.length > 10) {
                    payload.username = payload.username.substring(0, 10)
                }

                if (payload.username.length === 0) {
                    return user
                }

                user.username = payload.username
            }

            return user
        })

        resolve(() => {
            this.sendSessionState()
        })
    }

    private handleStartSimulator(message: MessageTypes.Message<'startSimulator'>,
        resolve: (value: () => void | PromiseLike<() => void>) => void,
        reject: (reason?: any) => void) {

        const payload = message.payload

        // Start new simulation on existing sim.
        if (this.sessionState !== 'idle') {
            reject('Session is currently busy')
            return
        }

        this.simState = {
            step: 0,
            stepMax: payload.stepCount,
            apiKey: payload.apiKey,
            params: payload.params,
            name: payload.name
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
    }

    async layoutTimer(resolve: (resolveMessage:string) => void, worker: Worker, signal: AbortSignal ) { //LAU added resolve message Honestly don't really get what happens here
        try {
            await setTimeout(60000, null, {
                signal: signal
            })

            this.logger.log('warn', "Layout generation timed out")
            await worker.terminate().then(() => {
                console.log('thingy')
            }).catch((reason) => {
                console.log(reason)
            })

            resolve('')
        } catch(error) {
            console.log(error)
            this.logger.log('error',error)
            // if (error typeof Error) {

            // }
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
            }).then().catch()

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

    private async processMessage<Type extends keyof MessageTypes.MessageTypeMap>(message: MessageTypes.Message<Type>) {
        return await new Promise<() => void>((resolve, reject) => {
            switch (message.type) {
                case 'registerSimulator':
                    this.handleRegisterSimulatorMessage(message as MessageTypes.Message<'registerSimulator'>, resolve, reject)

                    break
                case 'getData':  //data LAU
                    this.handleSimulatorDataMessage(message as MessageTypes.Message<'simulatorResponse'>, resolve, reject)
                    break
                case 'setPlayState':
                    this.handlePlayStateMessage(message as MessageTypes.Message<'setPlayState'>, resolve, reject)
                    break
                case 'changeUsername':
                    this.handleChangeUsernameMessage(message as MessageTypes.Message<'changeUsername'>, resolve, reject)

                    break
                case 'generateLayout':
                    this.setState('generating layout')

                    const layoutMessage = message as MessageTypes.Message<'generateLayout'>

                    this.setLayout(layoutMessage.payload.layout).then(() => {
                        resolve(() => {
                            this.setState('idle')
                            this.sendGraphState()
                        })
                    })

                    break
                case 'createSimulator':
                    this.logger.log('warn', 'Creating simulator')
                    // Request new simulator instance.
                    this.simulators.push({
                        key: uid.sync(4),
                        userID: message.senderID,
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
                case 'startSimulator':
                    this.handleStartSimulator(message as MessageTypes.Message<'startSimulator'>, resolve, reject)

                    break
                case 'createTestSimulator':
                    this.logger.log('warn', 'Creating test simulator')

                    if (this.simulators.filter((simulator) => {
                        return simulator.userID === message.senderID
                    }).length > 0) {
                        reject('User already has a simulator')

                        return
                    }

                    // Request new simulator instance.
                    this.simulators.push({
                        key: 'test',
                        userID: message.senderID,
                        // Set socket to non null placeholder
                        socket: null,
                        params: [{
                            'attribute': 'Number of Steps',
                            'type': 'integer',
                            'defaultValue': 365,
                            'value': 365,
                            "limits": {
                                "min": 1,
                                "max": 1000
                            }
                        },
                        {
                            'attribute': 'Float',
                            'type': 'float',
                            'defaultValue': 0.5,
                            'value': 0.5,
                            "limits": {
                                "min": 0.1,
                                "max": 1.0
                            }
                        },
                        {
                            'attribute': 'Bool',
                            'type': 'boolean',
                            'defaultValue': true,
                            'value': true,
                            "limits": null
                        },
                        {
                            'attribute': 'String',
                            'type': 'string',
                            'defaultValue': 'test',
                            'value': 'test',
                            "limits": null
                        }],
                        title: 'TEST SIMULATOR',
                        validator: true,
                        valid: 'unknown',
                        state: 'idle'
                    })

                    resolve(() => {
                        this.sendSessionState()
                    })

                    break
                case 'setGlobal':
                    const globalMessage = message as MessageTypes.Message<'setGlobal'>

                    if (this.globals[globalMessage.payload.key] == undefined) {
                        this.globals[globalMessage.payload.key] = {}
                    }

                    this.globals[globalMessage.payload.key][globalMessage.payload.param] = globalMessage.payload.value

                    this.sendSessionState()
                    break
                case 'setGraphState':
                    const graphMessage = message as MessageTypes.Message<'setGraphState'>

                    // Update server graph state.
                    this.changeGraphState(
                        this.parseJson(graphMessage.payload.nodes,
                            graphMessage.payload.edges))

                    resolve(() => {
                        this.sendGraphState()
                    })
                    break
                case 'setSliceIndex':
                    const indexMessage = message as MessageTypes.Message<'setSliceIndex'>

                    // Set new timeline index.
                    if (indexMessage.payload.index < 0
                        || indexMessage.payload.index >= this.graphHistory.length) {
                        reject(`Graph index ${indexMessage.payload.index} out of bounds`)

                        return
                    }

                    this.setState('generating layout')

                    this.sendSessionState()

                    this.storeCurrentGraphState().then(() => {
                        this.loadGraphState(indexMessage.payload.index).then(() => {
                            resolve(() => {
                                this.setState('idle')
                                this.sendGraphState()
                            })
                        })
                    })
                    break
                case 'addHeadset':
                    this.users.forEach((user) => {
                        if (user.userID === message.senderID) {
                            const headsetID = uid.sync(4)

                            user.headsets.push({
                                headsetID: headsetID,
                                socket: null
                            })
                        }
                    })

                    resolve(() => {this.sendSessionState()})
                    break
                case 'changeWindowSize':
                    const windowMessage = message as MessageTypes.Message<'changeWindowSize'>
                    console.log('did I change the window size?')
                    console.log(this.users)
                    this.users.forEach((user) => {
                        if (user.userID === windowMessage.senderID) {
                            user.width = windowMessage.payload.width
                            user.height = windowMessage.payload.height
                        }
                    })

                    resolve(() => {this.sendSessionState()})
                    break;
                case 'pan':
                    const panMessage = message as MessageTypes.Message<'pan'>

                    this.users.forEach((user) => {
                        if (user.userID === message.senderID) {
                            user.panX = panMessage.payload.x
                            user.panY = panMessage.payload.y
                            user.panK = panMessage.payload.k
                        }
                    })

                    resolve(() => {this.sendPanState(message.senderID)})
                    break
                case 'removeSimulator':
                    const removeMessage = message as MessageTypes.Message<'removeSimulator'>

                    this.simulators = this.simulators.filter((sim) => {
                        const match = sim.key === removeMessage.payload.apikey

                        if (match) {
                            if (sim.socket !== null) {
                                sim.socket.close()
                            }
                        }

                        return !match
                    })

                    resolve(() => {this.sendSessionState()} )

                    break
                case 'getData':
                    const dataMessage = message as MessageTypes.Message<'getData'>

                    this.parseGetMessage(dataMessage, resolve, reject)
                    break
                case 'simulatorResponse':
                    const responseMessage = message as MessageTypes.Message<'simulatorResponse'>

                    this.handleSimulatorDataMessage(responseMessage, resolve, reject)
                    break
                default:
                    reject('Unknown message type ' + message.type)
            }
        })
    }

    private getMessage() {
        if (this.messageQueue.length === 0)
            return

        const message = this.messageQueue.splice(0, 1)[0]

        if (message === undefined)
            return

        // Get the first message in the queue.
        this.processMessage(message)
            .then(
                (result) => {
                    result()

                    // Get the next message.
                    this.getMessage()
                },
                // TODO: ERROR TYPES
                (error) => {
                    console.log(error.stack)
                    // Log an error and close the session.
                    this.logger.log('error', error)

                    // this.destroy()
                }
            )
    }

    // Adds a message to the queue, and tries to process it.
    addMessage<Type extends keyof MessageTypes.MessageTypeMap>(message: MessageTypes.Message<Type>) {
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

    private sendMessage<Type extends keyof MessageTypes.MessageTypeMap>(
        socket: WebSocket,
        message: MessageTypes.Message<Type>) {

        socket.send(JSON.stringify(message))
    }

    // Sends graph data to all users.
    private sendGraphState() {
        this.pruneSessions()

        const graphData = this.cy.json() as Types.CytoGraph
        console.log('sending graph state')
        console.log(graphData)

        const payload = {
            nodes: graphData.elements.nodes.map((node) => {
                return {
                    id: node.data.id!,
                    position: node.position!,
                    ...node.data,
                }}),
            edges: graphData.elements.edges.map((edge) => {
                return {
                    id: edge.data.id!,
                    ...edge.data,
                }}
            ),
            globals: this.globals,
        }
        console.log('created payload for sending graphdata')
        console.log(this.users)
        // TODO: id and position checks
        this.users.forEach((user) => {
            const message: MessageTypes.Message<'sendGraphState'> = {
                type: 'sendGraphState',
                payload: payload,
                senderType: 'server',
                senderID: 'server',
                receiverType: 'user',
                receiverID: user.userID,
                sessionID: this.sessionID,
                timestamp: new Date,
            }
            console.log('created message')
            this.sendMessage(user.socket, message)
            console.log('message send')
            // user.headsets.forEach((headset) => {
            //     if (headset.socket) {
            //         message.receiverID = headset.headsetID
            //         message.receiverType = 'headset'

            //         this.sendMessage(headset.socket, message)
            //     }
            // })
        })
    }

    runDummySimulator(message: MessageTypes.Message<'simulatorData'>) {
        // Perform a dummy simulation, then add a response to the message queue

        const sim = this.simulators.filter((sim) => {
            return sim.key === message.payload.apikey
        })

        if (sim.length === 0) {
            this.logger.log('error', 'Simulator not found')
            return
        }

        // Add a random node
        const node = {
            data: {
                id: 'test' + Math.random(),
                label: 'test',
                type: 'test',
                position: {
                    x: Math.random() * 1000,
                    y: Math.random() * 1000,
                },
            },
        }

        message.payload.nodes.push(node)

        message.payload.globals = {
            ...message.payload.globals,
            // test: {
            //     value: Math.random(),
            // }
        }

        // Create a response message
        const response: MessageTypes.Message<'simulatorResponse'> = {
            type: 'simulatorResponse',
            sessionID: this.sessionID,
            senderID: 'test',
            senderType: 'simulator',
            receiverID: 'server',
            receiverType: 'server',
            timestamp: new Date,
            payload: {
                apikey: 'test',
                nodes: message.payload.nodes,
                edges: message.payload.edges,
                globals: message.payload.globals,
                params: message.payload.params,
            },
        }

        this.addMessage(response)
    }

    sendSimulatorMessage() {
        const sim = this.simulators.filter((sim) => {


            return sim.key === this.simState.apiKey
        })

        if (sim.length === 0) {
            this.logger.log('error', 'Simulator not found')
            return
        }

        if (sim[0].key === 'test') {
            const message: MessageTypes.Message<'simulatorData'> = {
                type: 'simulatorData',
                sessionID: this.sessionID,
                senderID: 'server',
                senderType: 'server',
                receiverID: 'test',
                receiverType: 'simulator',
                timestamp: new Date,
                payload: {
                    apikey: 'test',
                    nodes: (this.cy.json() as any).elements.nodes,
                    edges: (this.cy.json() as any).elements.edges,
                    globals: this.globals,
                    params: this.simState.params
                }
            }

            this.runDummySimulator(message)
        }

        if (sim.length === 0 || this.simState.apiKey === null || sim[0].socket === null) {
            this.simState = {
                step: 0,
                stepMax: 0,
                name: '',
                apiKey: null,
                params: []
            }

            this.setState('idle')

            return
        }

        this.simulators.forEach((sim) => {
            if (sim.key === this.simState.apiKey) {
                sim.state = 'generating'
            }
        })

        this.setState('simulating')

        const message: MessageTypes.Message<'simulatorData'> = {
            type: 'simulatorData',
            sessionID: this.sessionID,
            senderID: 'server',
            senderType: 'server',
            receiverID: this.simState.apiKey,
            receiverType: 'simulator',
            timestamp: new Date,
            payload: {
                apikey: this.simState.apiKey,
                nodes: (this.cy.json() as any).elements.nodes,
                edges: (this.cy.json() as any).elements.edges,
                globals: this.globals,
                params: this.simState.params
            }
        }

        this.sendMessage(sim[0].socket!, message)
    }

    private getSimulatorInfo(userID: string): Types.Simulator[] {
        return this.simulators.map((sim) => {
            if (sim.userID === userID) {
                return sim
            }

            return {...sim, apikey: null}
        })
    }

    // private sendHeadsetState(headsetID: string, connected: boolean) {
    //     this.pruneSessions()

    //     this.users.forEach((user) => {
    //         if (user.userID === userID) {
    //             const msg: MessageTypes.Message<'headsetConnected'> = {
    //                 type: 'headsetConnected'
    //                 sessionID: this.sessionID,
    //                 sessionState: this.sessionState,
    //             }

    //             user.socket.send(JSON.stringify(msg))
    //         }
    //     })
    // }

    // Sends session info to all users.
    private sendSessionState() {
        console.log('pruning sessions')
        this.pruneSessions()

        const dateDiff = new Date(this.expirationDate.getTime() - new Date().getTime())
        console.log(this.simState)
        console.log('looping over users')
        this.users.forEach((user) => {
            const message: MessageTypes.Message<'sendSessionState'> = {
                type: 'sendSessionState',
                sessionID: this.sessionID,
                senderType: 'server',
                senderID: 'server',
                receiverType: 'user',
                receiverID: user.userID,
                timestamp: new Date,
                payload: {
                    globals: this.globals,
                    globalsGeneratedOn: this.globalsGeneratedOn,
                    state: this.sessionState,
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
                            apikey: sim.key,
                            username: this.users.filter((user) => {
                                return (user.userID === sim.userID)
                            }).map((user) => {
                                return user.username
                            })[0],
                            params: sim.params,
                            state: sim.state,
                            title: sim.title,
                            valid: sim.valid,
                            validator: sim.validator
                        }
                    }),
                    simState: {
                        step: this.simState.currentStep,
                        stepMax:this.simState.steps,
                        name: 'no simulator connected' //this.simState.name | 
                    },
                    sessionURL: this.localAddress,
                    layoutInfo: getAvailableLayouts(),
                    expirationDate: dateDiff,
                    websocketPort: this.websocketPort,
                    playmode: this.playmode
                }
            }

            this.sendMessage(user.socket, message)

            user.headsets.forEach((headset) => {
                if (headset.socket) {
                    message.receiverID = headset.headsetID
                    message.receiverType = 'headset'

                    this.sendMessage(headset.socket, message)
                }
            })
        })
    }

    private sendPanState(userID: string) {
        this.pruneSessions()

        this.users.forEach((user) => {
            if (user.userID !== userID)
                return

            user.headsets.forEach((headset) => {
                const message: MessageTypes.Message<'pan'> = {
                    receiverID: headset.headsetID,
                    receiverType: 'headset',
                    senderID: 'server',
                    senderType: 'server',
                    type: 'pan',
                    sessionID: this.sessionID,
                    timestamp: new Date,
                    payload: {
                        x: user.panX,
                        y: user.panY,
                        k: user.panK,
                    }
                }

                if (headset.socket) {
                    this.sendMessage(headset.socket, message)
                }
            })
        })
    }

    registerSimulator(apiKey: string, socket: WebSocket) {
        this.simulators.forEach((sim) => {
            if (sim.key === apiKey && sim.state === 'disconnected') {
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

        // this.sendHeadsetState(userID)
        this.sendGraphState()
        this.sendSessionState()
    }

    deRegisterSimulator(apiKey: string) {
        // If the simulator was running, stop it.
        this.simulators.forEach((sim) => {
            if (sim.key === apiKey) {
                if (sim.state === 'generating') {
                    this.simState = {
                        step: 0,
                        stepMax: 0,
                        name: '',
                        apiKey: null,
                        params: []
                    }

                    this.setState('idle')

                }

                sim.socket = null
                sim.params = []
                sim.state = 'disconnected'
            }
        })

        this.sendSessionState()
    }

    // Adds a user to the session, giving it a random user ID and username.
    addUser(socket: WebSocket, username: string | null, keys: number, req: IncomingMessage): string {
        //const userID = uid.sync(4)
        console.log('in adduser')
        const userID = req.socket.remoteAddress
        console.log('userID',userID)

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

        for (let i = 0; i < keys; i++) {
            this.simulators.push({
                key: uid.sync(4),
                userID: userID,
                socket: null,
                params: [],
                title: '',
                validator: true,
                valid: 'unknown',
                state: 'disconnected'
            })
        }
        console.log('added simulators info in addUser')

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
        console.log('added users info in addUser')

        const initMessage: MessageTypes.Message<'userInitialization'> = {
            sessionID: this.sessionID,
            type: 'userInitialization',
            senderID: 'server',
            senderType: 'server',
            receiverID: userID,
            receiverType: 'user',
            timestamp: new Date,
            payload: {
                uid: userID,
                data: userID,
                keys: this.simulators.filter((sim) => {
                    return ((sim.userID === userID) && sim.key)
                }).map((sim) => {
                    return sim.key
                }),
                sessionState: this.sessionState,
            }
        }
        console.log('created init message')
        this.sendMessage(socket, initMessage)
        console.log(' Send init message')
        this.sendGraphState()
        console.log('managed to send grpah data')
        this.sendSessionState()
        console.log('send graph and session state')
        return userID
    }

    public getKeys(userID: string) {
        return this.simulators.filter((sim) => {
            return ((sim.userID === userID) && sim.key)
        }).map((sim) => {
            return sim.key
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
                if (sim.state === 'generating') {
                    this.simState = {
                        step: 0,
                        stepMax: 0,
                        name: '',
                        apiKey: null,
                        params: []
                    }

                    this.setState('idle')
                }

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







    // Extends the expiration date by current time + 6 hrs.
    extendExpirationDate() {
        const expDate = new Date()

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