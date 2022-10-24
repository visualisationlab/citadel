import { quantumOfCirculationDependencies } from 'mathjs'
import { GraphDataState } from '../reducers/graphdata.reducer'
import { LayoutState } from '../reducers/layoutsettings.reducer'
import { SimulatorParam } from '../reducers/sessiondata.reducer'
import { VisGraph } from '../types'
import { websocketService } from './websocket.service'
import {QR} from '../services/qrcode.service'
export module API {
    let sid: null | string = null
    let userID: null | string = null
    let panX = 0
    let panY = 0
    let panK = 0

    export function getUID() {
        return userID
    }

    export function setSID(newSID: string) {
        sid = newSID
    }

    export function setUserID(newUserID: string) {
        userID = newUserID


        websocketService.sendSetMessage({
            messageType: 'set',
            dataType: 'windowSize',
            params: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            sessionID: sid!,
            userID: userID,
            messageSource: 'user'
        })
    }

    export function addSim() {
        if (sid === null || userID === null) {
            return
        }

        websocketService.sendSetMessage({
            userID: userID,
            sessionID: sid,
            messageType: 'set',
            dataType: 'simulatorInstance',
            messageSource: 'user',
            params: null
        })
    }

    export function addHeadset() {

        if (sid === null || userID === null) {
            return
        }

        websocketService.sendSetMessage({
            userID: userID,
            sessionID: sid,
            messageType: 'set',
            dataType: 'headset',
            messageSource: 'user',
            params: null
        })
    }

    export function step(stepCount: number, apiKey: string, params: SimulatorParam[]) {
        if (sid === null || userID === null) {
            return
        }

        websocketService.sendSetMessage({
            userID: userID,
            sessionID: sid,
            messageType: 'set',
            dataType: 'simulator',
            messageSource: 'user',
            params: {
                stepCount: stepCount,
                params: params,
                apiKey: apiKey
            }
        })
    }

    export function removeNode(nodeID: string, graphState: GraphDataState) {
        if (sid === null || userID === null) {
            return
        }

        const newState = {...graphState}

        newState.nodes.data = graphState.nodes.data.filter((node) => {
            return node.id !== nodeID
        })

        newState.edges.data = graphState.edges.data.filter((edge) => {
            return (edge.source !== nodeID && edge.target !== nodeID)
        })

        updateGraph(newState)
    }

    export function removeEdge(edgeID: string, graphState: GraphDataState) {
        if (sid === null || userID === null) {
            return
        }

        const newState = {...graphState}

        newState.edges.data = graphState.edges.data.filter((edge) => {
            return (edge.id !== edgeID)
        })

        updateGraph(newState)
    }

    export function updateGraph(graphState: GraphDataState) {
        if (sid === null || userID === null) {
            return
        }

        const nodes: VisGraph.CytoNode[] = graphState.nodes.data.map((node: VisGraph.GraphNode) => {
            return {
                position: {
                    x: node.x,
                    y: node.y,
                },
                data: {
                    ...node.attributes,
                    id: node.id},
            }
        })

        const edges: VisGraph.CytoEdge[] = graphState.edges.data.map((edge: VisGraph.Edge) => {
            return {
                data: {
                    ...edge.attributes,
                    source: edge.source,
                    target: edge.target,
                    id: edge.attributes.id}
            }
        })

        websocketService.sendSetMessage({
            messageType: 'set',
            dataType: 'graphState',
            params: {
                nodes: nodes,
                edges: edges
            },
            sessionID: sid,
            userID: userID,
            messageSource: 'user'
        })
    }

    export function updateUsername(name: string) {
        if (sid === null || name === '' || userID === null) {
            console.log(name)
            return
        }
        console.log('here')

        websocketService.sendSetMessage({
            messageType: 'set',
            dataType: 'username',
            params: {
                username: name
            },
            sessionID: sid,
            userID: userID,
            messageSource: 'user'
        })
    }

    export function getInfo() {
        if (sid === null || userID === null) {
            return
        }

        websocketService.sendGetMessage({
            userID: userID,
            sessionID: sid,
            messageType: 'get',
            dataType: 'sessionState',
            messageSource: 'user',
        })
    }

    export function getLayouts() {
        if (sid === null || userID === null) {
            return
        }

        console.log(`Getting layout`)

        websocketService.sendGetMessage({
            userID: userID,
            sessionID: sid,
            messageType: 'get',
            dataType: 'layouts',
            messageSource: 'user',
        })
    }

    export function setLayout(layout: LayoutState) {
        if (sid === null || userID === null) {
            return
        }

        console.log(`Setting layout`)

        let res: {[key: string]: (boolean | number)} = {}

        layout.settings.forEach((setting) => {
            if (setting.type === 'number' && setting.value === 0) {
                return
            }
            res[setting.name] = setting.value
        })

        websocketService.sendSetMessage({
            messageType: 'set',
            dataType: 'layout',
            params: {
                layout: layout
            },
            sessionID: sid,
            userID: userID,
            messageSource: 'user'
        })
    }

    export function setGraphIndex(index: number) {
        if (sid === null || userID === null) {
            return
        }

        console.log(`Setting index to ${index}`)

        websocketService.sendSetMessage({
            messageType: 'set',
            dataType: 'graphIndex',
            params: {
                index: index
            },
            sessionID: sid,
            userID: userID,
            messageSource: 'user'
        })
    }

    export function setWindowSize(width: number, height: number) {
        if (sid === null || userID === null) {
            return
        }

        websocketService.sendSetMessage({
            messageType: 'set',
            dataType: 'windowSize',
            params: {
                width: width,
                height: height
            },
            sessionID: sid,
            userID: userID,
            messageSource: 'user'
        })
    }

    export function setPan(x: number, y: number, k: number) {
        if (sid === null || userID === null) {
            return
        }

        panX = x
        panY = y
        panK = k

        websocketService.sendSetMessage({
            messageType: 'set',
            dataType: 'pan',
            params: {
                x: x,
                y: y,
                k: k
            },
            sessionID: sid,
            userID: userID,
            messageSource: 'user'
        })
    }

    export function play() {
        if (sid === null || userID === null) {
            return
        }

        websocketService.sendSetMessage({
            messageType: 'set',
            dataType: 'playstate',
            params: {
                state: true
            },
            sessionID: sid,
            userID: userID,
            messageSource: 'user'
        })
    }

    export function pause() {
        if (sid === null || userID === null) {
            return
        }

        websocketService.sendSetMessage({
            messageType: 'set',
            dataType: 'playstate',
            params: {
                state: false
            },
            sessionID: sid,
            userID: userID,
            messageSource: 'user'
        })
    }

    export function sendPan() {
        if (sid === null || userID === null) {
            return
        }

        websocketService.sendSetMessage({
            messageType: 'set',
            dataType: 'pan',
            params: {
                x: panX,
                y: panY,
                k: panK
            },
            sessionID: sid,
            userID: userID,
            messageSource: 'user'
        })
    }
}
