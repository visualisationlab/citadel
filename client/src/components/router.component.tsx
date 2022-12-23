import { Dispatch, useContext } from 'react'

import { ServerState, SessionReducer, SimulatorParam } from '../reducers/sessiondata.reducer'

import { UserDataContext } from '../components/main.component'

import { MessageTypes, websocketService } from '../services/websocket.service'

import { VisGraph } from '../types'
import { GraphDataReducerAction } from '../reducers/graphdata.reducer'
import { API } from '../services/api.service'

import { QR } from '../services/qrcode.service'
interface RouterProps {
    sessionDataDispatch: Dispatch<SessionReducer>,
    graphDataDispatch: Dispatch<GraphDataReducerAction>
}

let sessionDataDispatch: Dispatch<SessionReducer> | null = null
let graphDataDispatch: Dispatch<GraphDataReducerAction> | null = null

export module Router {
    export function setup(props: RouterProps) {
        sessionDataDispatch = props.sessionDataDispatch
        graphDataDispatch = props.graphDataDispatch
    }

    export function route(message: MessageTypes.OutMessage) {
        if (!sessionDataDispatch || !graphDataDispatch) {
            return
        }

        switch (message.type) {
            case 'data':
                const messageData: {
                    nodes: VisGraph.CytoNode[]
                    edges: VisGraph.CytoEdge[] | undefined
                } = (message as any).data

                const nodes: VisGraph.GraphNode[] = messageData.nodes.map((node: VisGraph.CytoNode) => {
                    return {
                        id: node.data.id,
                        x: node.position.x,
                        y: node.position.y,
                        attributes: node.data,
                        visualAttributes: {
                            radius: 16,
                            alpha: 1,
                            hue: 0,
                            saturation: 1,
                            lightness: 0.5,
                            shape: 'circle',
                            prevShape: 'circle',
                            text: ""
                        }
                    }
                })

                if (messageData.edges === undefined) {
                    graphDataDispatch({
                        property: 'data',
                        type: 'set',
                        value: {
                            nodes: [...nodes],
                            edges: [],
                            directed: false
                        }
                    })

                    return
                }

                const edges: VisGraph.Edge[] = messageData.edges!.map((edge: VisGraph.CytoEdge) => {
                    return {
                        id: edge.data.id,
                        source: edge.data.source,
                        target: edge.data.target,
                        attributes: edge.data,
                        visualAttributes: {
                            alpha: 1,
                            width: 10,
                            hue: 0,
                            saturation: 1,
                            lightness: 0.5,
                            text: ''
                        }
                    }
                })

                graphDataDispatch({
                    property: 'data',
                    type: 'set',
                    value: {
                        nodes: [...nodes],
                        edges: [...edges],
                        directed: false
                    }
                })

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
