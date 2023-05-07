import { Dispatch } from 'react'

import { LayoutInfo, ServerState, SessionReducer, SessionState, SimulatorParam } from '../reducers/sessiondata.reducer'

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

export type BasicGraph = {
    nodes: BasicNode[],
    edges: BasicEdge[],
    metadata: {
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
        messageType: 'get' | 'set' | 'remove'
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

    export interface RemoveMessage extends InMessage {
        messageSource: 'user'
        messageType: 'remove'
        userID: string,
        dataType: 'simulator'
        params: {
            apikey: string
        }
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
            apiKey: string,
            name: string,
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
                stepMax: number,
                name: string
            }
            layoutInfo: LayoutInfo[]
            expirationDate: string
            websocketPort: string
            playmode: boolean
        }
    }

    export interface DataStateMessage extends OutMessage {
        type: 'data',
        data: BasicGraph
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
let sessionDataDispatch: Dispatch<SessionReducer> | null = null
let graphDataDispatch: Dispatch<GraphDataReducerAction> | null = null
let selectionDataDispatch: Dispatch<SelectionDataReducerAction> | null = null

export module Router {
    export function setup(props: RouterProps) {
        sessionDataDispatch = props.sessionDataDispatch
        graphDataDispatch = props.graphDataDispatch
        selectionDataDispatch = props.selectionDataDispatch
    }

    export function route(message: MessageTypes.OutMessage) {
        if (!sessionDataDispatch || !graphDataDispatch || !selectionDataDispatch) {
            return
        }

        switch (message.type) {
            case 'data':
                const messageData: BasicGraph = (message as MessageTypes.DataStateMessage).data

                const nodes: BasicNode[] = messageData.nodes

                if (messageData.edges === undefined) {
                    graphDataDispatch({
                        property: 'data',
                        type: 'set',
                        value: {
                            nodes: [...nodes],
                            edges: [],
                            metadata: messageData.metadata,
                        }
                    })

                    return
                }

                const edges: BasicEdge[] = messageData.edges

                console.log(messageData.metadata)
                graphDataDispatch({
                    property: 'data',
                    type: 'set',
                    value: {
                        nodes: [...nodes],
                        edges: [...edges],
                        metadata: messageData.metadata,
                    }
                })

                selectionDataDispatch({type: 'selection/clean', payload: {
                    nodeIDs: nodes.map((node) => node.id),
                    edgeIDs: edges.map((edge) => edge.id)
                }})

                break
            case 'session':
                sessionDataDispatch({attribute: 'all', value: message as any})
                break
            case 'uid':
                API.setUserID((message as MessageTypes.UIDMessage).data)

                break
            case 'headset':
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

    export function setSimulatorSettings(key: string, params: SimulatorParam[]) {
        if (!sessionDataDispatch)
            return

        sessionDataDispatch({attribute: 'simulatorSettings', key: key, params: params})
    }
}
