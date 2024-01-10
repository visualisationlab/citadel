import { Dispatch } from 'react'

import { LayoutInfo, ParamType, ServerState, SessionReducer, SessionState, SimulatorParam } from '../reducers/sessiondata.reducer'

import { VisGraph } from '../types'
import { GraphDataReducerAction } from '../reducers/graphdata.reducer'
import { API } from '../services/api.service'

import { QR } from '../services/qrcode.service'
import { SelectionDataReducerAction } from '../reducers/selection.reducer'
import { AvailableLayout } from '../reducers/layoutsettings.reducer'
interface RouterProps {
    sessionDataDispatch: Dispatch<SessionReducer>,
    graphDataDispatch: Dispatch<GraphDataReducerAction>,
    selectionDataDispatch: Dispatch<SelectionDataReducerAction>
}

export type BasicNode = {
    id: string,
    position: {
        x: number,
        y: number
    },
    [key: string]: any
}

export type BasicEdge = {
    id: string,
    source: string,
    target: string,
    [key: string]: any
}

export type GlobalsType = {[key: string]: {[key: string]: string}}

export type BasicGraph = {
    nodes: BasicNode[],
    edges: BasicEdge[],
    globals: {
        [key: string]: any
    }
}

export type CytoNode = {
    data: {
        id: string,
        [key: string]: any,
    }
    position: {x: number, y: number}
}

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

type LayoutSettings = {
    name: AvailableLayout,
    randomize: boolean,
    settings: {name: string, value: number | boolean}[]
}

export type CytoEdge = {
    data: {
        id: string,
        source: string,
        target: string,
        [key: string] : any
    }
}

export type CytoGraph = {
    elements: {
        nodes: CytoNode[],
        edges: CytoEdge[],
    }
    data: {
        [key: string]: any
    }
}

export module MessageTypes {
    type ServerDataType = 'graphState' | 'sessionState' | 'layouts' | 'apiKey' | 'QR'
    export type SetType = 'playstate' | 'graphState' | 'simulator' | 'stopSimulator'
                                      | 'simulatorInstance' | 'layout'
                                      | 'username' | 'graphIndex'
                                      | 'headset' | 'windowSize' | 'pan'

    export type MessageTypeMap = {
        'registerSimulator': RegisterSimulatorPayload,
        'simulatorResponse': SimulatorDataPayload,
        'changeUsername': {username: string},
        'pan': PanPayload,
        'removeSimulator': {apikey: string},
        'changeWindowSize': WindowSizePayload,
        'getData': ServerDataType,
        'startSimulator': StartSimulatorPayload,
        'createSimulator': {},
        'stopSimulator': {},
        'sendSessionState': SessionStatePayload,
        'sendGraphState': BasicGraph,
        'headsetConnected': {headsetID: string, connected: boolean},
        'simulatorData': SimulatorDataPayload,
        'setPlayState': {playState: boolean},
        'generateLayout': {layout: LayoutSettings},
        'setGraphState': BasicGraph,
        'setSliceIndex': {index: number},
        'addHeadset': {},
        'userInitialization': UserInitializationPayload,
        'setGlobal': {key: string, param: string, value: string},
        'createTestSimulator': {},
    }

    type SimulatorDataPayload = {
        nodes: any,
        edges: any,
        apikey: string,
        globals: {[key: string]: any}
        params: Array<SimulatorParam<ParamType>>
    }

    type StartSimulatorPayload = {
        stepCount: number,
        apiKey: string,
        params: Array<SimulatorParam<ParamType>>,
        name: string,
    }

    type WindowSizePayload = {
        width: number,
        height: number
    }

    type PanPayload = {
        x: number,
        y: number,
        k: number
    }

    // Register a new simulator instance.
    type RegisterSimulatorPayload = {
        apikey: string,
        params: Array<SimulatorParam<ParamType>>,
        title: string,
        validator: boolean
    }

    export interface Message<T extends keyof MessageTypeMap> {
        type: T,
        payload: MessageTypeMap[T],
        senderType: 'user' | 'simulator' | 'server' | 'headset'
        senderID: string,
        receiverType: 'user' | 'simulator' | 'server' | 'headset'
        receiverID: string,
        sessionID: string,
        timestamp: Date
    }

    type UserInitializationPayload = {
        uid: string,
        data: string,
        keys: (string | null)[],
        sessionState: SessionState,
    }

    export type SessionStatePayload = {
        globals: GlobalsType,
        globalsGeneratedOn: number,
        state: ServerState,
        currentLayout: AvailableLayout | null,
        /** Session URL for sharing. */
        url: string,
        /** Session data origin. */
        sessionURL: string,
        /** Current index in dynamic graph. */
        graphIndex: number,
        /** Total number of graphs in dynamic graph. */
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
            /** The current simulation step. */
            step: number,
            /** The number of steps to calculate. */
            stepMax: number,
            /** Running sim name. */
            name: string
        }
        /** Layout information for graph layout generation. */
        layoutInfo: LayoutInfo[]
        /** Time session expires. */
        expirationDate: Date
        websocketPort: string
        playmode: boolean
    }

    type ServerSimulator = {
        readonly apikey: string | null,
        username: string,
        params: Array<SimulatorParam<ParamType>>,
        title: string,
        state: 'disconnected' | 'idle' | 'generating' | 'connecting',
        valid: 'valid' | 'invalid' | 'unknown',
        validator: boolean
    }
}

let sessionDataDispatch: Dispatch<SessionReducer> | null = null
let graphDataDispatch: Dispatch<GraphDataReducerAction> | null = null
let selectionDataDispatch: Dispatch<SelectionDataReducerAction> | null = null

export module Router {
    export function setup(props: RouterProps) {
        sessionDataDispatch = props.sessionDataDispatch
        graphDataDispatch = props.graphDataDispatch
        selectionDataDispatch = props.selectionDataDispatch
    }

    export function route<T extends keyof MessageTypes.MessageTypeMap>(message: MessageTypes.Message<T>) {
        if (!sessionDataDispatch || !graphDataDispatch || !selectionDataDispatch) {
            return
        }

        switch (message.type) {
            case 'sendGraphState':
                const messageData: BasicGraph = (message as MessageTypes.Message<'sendGraphState'>).payload

                const nodes: BasicNode[] = messageData.nodes

                if (messageData.edges === undefined) {
                    graphDataDispatch({
                        property: 'data',
                        type: 'set',
                        value: {
                            nodes: [...nodes],
                            edges: [],
                            globals: messageData.globals,
                        }
                    })

                    return
                }

                const edges: BasicEdge[] = messageData.edges

                console.log(messageData.globals)
                graphDataDispatch({
                    property: 'data',
                    type: 'set',
                    value: {
                        nodes: [...nodes],
                        edges: [...edges],
                        globals: messageData.globals,
                    }
                })

                selectionDataDispatch({type: 'selection/clean', payload: {
                    nodeIDs: nodes.map((node) => node.id),
                    edgeIDs: edges.map((edge) => edge.id)
                }})

                break
            case 'sendSessionState':
                sessionDataDispatch({attribute: 'all', value: (message as MessageTypes.Message<'sendSessionState'>)})
                break
            case 'userInitialization':
                API.setUserID((message as MessageTypes.Message<'userInitialization'>).payload.uid)

                break
            case 'headsetConnected':
                QR.clearQR()
                API.sendPan()
                break

            default:
                break
        }
    }

    export function setState(state: ServerState) {
        if (!sessionDataDispatch)
            return

        sessionDataDispatch({attribute: 'state', value: state})
    }

    export function setSimulatorSettings(key: string, params: Array<SimulatorParam<ParamType>>) {
        if (!sessionDataDispatch)
            return

        sessionDataDispatch({attribute: 'simulatorSettings', key: key, params: params})
    }
}
