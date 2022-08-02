import { Dispatch, useContext } from 'react'

import { SessionReducer } from '../reducers/sessiondata.reducer'

import { UserDataContext } from '../components/main.component'

import { ServerMessage } from '../services/websocket.service'

import { VisGraph } from '../types'
import { GraphDataReducerAction } from '../reducers/graphdata.reducer'

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

    export function route(message: ServerMessage) {
        if (!sessionDataDispatch || !graphDataDispatch) {
            return
        }

        switch (message.type) {
            case 'data':
                const messageData: {
                    nodes: VisGraph.CytoNode[]
                    edges: VisGraph.CytoEdge[] | undefined
                } = message.contents as any

                const nodes: VisGraph.GraphNode[] = messageData.nodes.map((node: VisGraph.CytoNode) => {
                    return {
                        id: node.data.id,
                        x: node.position.x,
                        y: node.position.y,
                        attributes: node.data,
                        visualAttributes: {
                            radius: 16,
                            alpha: 1,
                            fillColour: [0, 1, 0],
                            edgeColour: [0, 1, 0]
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
                            fillColour: [0, 0, 0],
                            edgeColour: [0, 0, 0]
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
            case 'info':
                sessionDataDispatch({attribute: 'all', value: message.contents as any})
                break
            case 'layouts':
                sessionDataDispatch({attribute: 'layouts', value: message.contents as any})
        }
    }
}