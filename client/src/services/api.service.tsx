import { GlobalsType, MessageTypes } from '../components/router.component'
import { GraphDataState } from '../reducers/graphdata.reducer'
import { LayoutState } from '../reducers/layoutsettings.reducer'
import { ParamType, SimulatorParam } from '../reducers/sessiondata.reducer'
// import { VisGraph } from '../types'
import { websocketService } from './websocket.service'
import {QR} from '../services/qrcode.service'
import { BasicEdge, BasicNode, CytoEdge, CytoNode } from '../components/router.component'
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
        console.log('setUserID', newUserID)
        userID = newUserID

        const newMessage: MessageTypes.Message<'changeWindowSize'> = {
            type: 'changeWindowSize',
            payload: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            sessionID: sid!,
            receiverID: 'server',
            receiverType: 'server',
            senderID: userID!,
            senderType: 'user',
            timestamp: new Date()
        }

        websocketService.sendMessageToServer(newMessage)
    }

    export function addTestSim() {
        if (sid === null || userID === null) {
            return
        }

        const newMessage: MessageTypes.Message<'createTestSimulator'> = {
            type: 'createTestSimulator',
            payload: {
            },
            sessionID: sid!,
            receiverID: 'server',
            receiverType: 'server',
            senderID: userID!,
            senderType: 'user',
            timestamp: new Date()
        }

        websocketService.sendMessageToServer(newMessage)
    }

    export function addSim() {
        if (sid === null || userID === null) {
            return
        }

        const newMessage: MessageTypes.Message<'createSimulator'> = {
            type: 'createSimulator',
            payload: {
            },
            sessionID: sid!,
            receiverID: 'server',
            receiverType: 'server',
            senderID: userID!,
            senderType: 'user',
            timestamp: new Date()
        }

        websocketService.sendMessageToServer(newMessage)
    }

    export function addHeadset() {
        if (sid === null || userID === null) {
            return
        }

        const newMessage: MessageTypes.Message<'addHeadset'> = {
            type: 'addHeadset',
            payload: {
            },
            sessionID: sid!,
            receiverID: 'server',
            receiverType: 'server',
            senderID: userID!,
            senderType: 'user',
            timestamp: new Date()
        }

        websocketService.sendMessageToServer(newMessage)
    }

    export function validate(apiKey: string) {
        if (sid == null || userID == null) {
            return
        }

        // websocketService.sendSetMessage({
        //     userID: userID,
        //     sessionID: sid,
        //     messageType: 'set',
        //     dataType: 'validate',
        //     messageSource: 'user',
        //     params: {
        //         apiKey: apiKey
        //     }
        // })
    }

    export function step<T extends ParamType>(stepCount: number, apiKey: string,
        params: Array<SimulatorParam<T>>, simName: string) {
        if (sid === null || userID === null) {
            return
        }

        const newMessage: MessageTypes.Message<'startSimulator'> = {
            type: 'startSimulator',
            payload: {
                stepCount: stepCount,
                params: params,
                apiKey: apiKey,
                name: simName
            },
            sessionID: sid!,
            receiverID: 'server',
            receiverType: 'server',
            senderID: userID!,
            senderType: 'user',
            timestamp: new Date()
        }

        websocketService.sendMessageToServer(newMessage)
    }

    export function stop() {
        if (sid === null || userID === null) {
            return
        }

        const newMessage: MessageTypes.Message<'stopSimulator'> = {
            type: 'stopSimulator',
            payload: {

            },
            sessionID: sid!,
            receiverID: 'server',
            receiverType: 'server',
            senderID: userID!,
            senderType: 'user',
            timestamp: new Date()
        }

        websocketService.sendMessageToServer(newMessage)
    }

    export function removeSim(simKey: string) {
        if (sid === null || userID === null) {
            return
        }

        const newMessage: MessageTypes.Message<'removeSimulator'> = {
            type: 'removeSimulator',
            payload: {
                apikey: simKey
            },
            sessionID: sid!,
            receiverID: 'server',
            receiverType: 'server',
            senderID: userID!,
            senderType: 'user',
            timestamp: new Date()
        }

        websocketService.sendMessageToServer(newMessage)
    }

    export function removeNode(nodeID: string, graphState: GraphDataState) {
        if (sid === null || userID === null) {
            return
        }

        console.log('removing node: ' + nodeID)

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

        console.log('removing edge: ' + edgeID)

        const newState = {...graphState}

        newState.edges.data = graphState.edges.data.filter((edge) => {
            return (edge.id !== edgeID)
        })

        updateGraph(newState)
    }

    export function editGlobal(globalID: string, parameter: string,
        value: string) {
        if (sid === null || userID === null) {
            return
        }


        const newMessage: MessageTypes.Message<'setGlobal'> = {
            type: 'setGlobal',
            payload: {
                key: globalID,
                param: parameter,
                value: value
            },
            sessionID: sid!,
            receiverID: 'server',
            receiverType: 'server',
            senderID: userID!,
            senderType: 'user',
            timestamp: new Date()
        }

        websocketService.sendMessageToServer(newMessage)
    }

    export function updateGraph(graphState: GraphDataState) {
        if (sid === null || userID === null) {
            return
        }

        const newMessage: MessageTypes.Message<'setGraphState'> = {
            type: 'setGraphState',
            payload: {
                edges: graphState.edges.data,
                nodes: graphState.nodes.data,
                globals: graphState.globals
            },
            sessionID: sid!,
            receiverID: 'server',
            receiverType: 'server',
            senderID: userID!,
            senderType: 'user',
            timestamp: new Date()
        }

        websocketService.sendMessageToServer(newMessage)
    }

    export function sendGraphPositions(graphState: GraphDataState,currentSimStep) {
        if (sid === null || userID === null) {
            return
        }

        const newMessage: MessageTypes.Message<'setGraphPositions'> = {
            type: 'setGraphPositions',
            payload: {
                nodes: graphState.nodes.data,
                step: currentSimStep
            },
            sessionID: sid!,
            receiverID: 'server',
            receiverType: 'server',
            senderID: userID!,
            senderType: 'user',
            timestamp: new Date()
        }

        websocketService.sendMessageToServer(newMessage)
    }

    export function updateUsername(name: string) {
        if (sid === null || name === '' || userID === null) {
            console.log(userID)

            return
        }

        // Store in localStorage
        localStorage.setItem('username', name)

        const newMessage: MessageTypes.Message<'changeUsername'> = {
            type: 'changeUsername',
            payload: {
                username: name
            },
            sessionID: sid!,
            receiverID: 'server',
            receiverType: 'server',
            senderID: userID!,
            senderType: 'user',
            timestamp: new Date()
        }

        websocketService.sendMessageToServer(newMessage)
    }

    export function getInfo() {
        if (sid === null || userID === null) {
            return
        }

        const newMessage: MessageTypes.Message<'getData'> = {
            type: 'getData',
            payload: 'sessionState',
            sessionID: sid!,
            receiverID: 'server',
            receiverType: 'server',
            senderID: userID!,
            senderType: 'user',
            timestamp: new Date()
        }

        websocketService.sendMessageToServer(newMessage)
    }

    export function getLayouts() {
        if (sid === null || userID === null) {
            return
        }

        const newMessage: MessageTypes.Message<'getData'> = {
            type: 'getData',
            payload: 'layouts',
            sessionID: sid!,
            receiverID: 'server',
            receiverType: 'server',
            senderID: userID!,
            senderType: 'user',
            timestamp: new Date()
        }

        websocketService.sendMessageToServer(newMessage)
    }

    export function setLayout(layout: LayoutState) {
        if (sid === null || userID === null) {
            return
        }

        console.log({
            messageType: 'set',
            dataType: 'layout',
            params: {
                layout: {...layout,
                    settings: layout.settings.filter((setting) => {
                        return (setting.type === 'boolean') || !setting.auto
                    })
                }
            },
            sessionID: sid,
            userID: userID,
            messageSource: 'user'
        })

        const newMessage: MessageTypes.Message<'generateLayout'> = {
            type: 'generateLayout',
            payload: {
                layout: {...layout,
                            settings: layout.settings.filter((setting) => {
                                return (setting.type === 'boolean') || !setting.auto
                            })
                        }
            },
            sessionID: sid!,
            receiverID: 'server',
            receiverType: 'server',
            senderID: userID!,
            senderType: 'user',
            timestamp: new Date()
        }

        websocketService.sendMessageToServer(newMessage)
    }

    export function setGraphIndex(index: number) {
        if (sid === null || userID === null) {
            return
        }

        const newMessage: MessageTypes.Message<'setSliceIndex'> = {
            type: 'setSliceIndex',
            payload: {
                index: index
            },
            sessionID: sid!,
            receiverID: 'server',
            receiverType: 'server',
            senderID: userID!,
            senderType: 'user',
            timestamp: new Date()
        }

        websocketService.sendMessageToServer(newMessage)
    }

    export function setWindowSize(width: number, height: number) {
        if (sid === null || userID === null) {
            return
        }

        const newMessage: MessageTypes.Message<'changeWindowSize'> = {
            type: 'changeWindowSize',
            payload: {
                width: width,
                height: height
            },
            sessionID: sid!,
            receiverID: 'server',
            receiverType: 'server',
            senderID: userID!,
            senderType: 'user',
            timestamp: new Date()
        }

        websocketService.sendMessageToServer(newMessage)
    }

    export function setPan(x: number, y: number, k: number) {
        if (sid === null || userID === null) {
            return
        }

        panX = x
        panY = y
        panK = k

        const newMessage: MessageTypes.Message<'pan'> = {
            type: 'pan',
            payload: {
                x: x,
                y: y,
                k: k
            },
            sessionID: sid!,
            receiverID: 'server',
            receiverType: 'server',
            senderID: userID!,
            senderType: 'user',
            timestamp: new Date()
        }

        websocketService.sendMessageToServer(newMessage)
    }

    export function play() {
        if (sid === null || userID === null) {
            return
        }

        const newMessage: MessageTypes.Message<'setPlayState'> = {
            type: 'setPlayState',
            payload: {
                playState: true
            },
            sessionID: sid!,
            receiverID: 'server',
            receiverType: 'server',
            senderID: userID!,
            senderType: 'user',
            timestamp: new Date()
        }

        websocketService.sendMessageToServer(newMessage)
    }

    export function pause() {
        if (sid === null || userID === null) {
            return
        }

        const newMessage: MessageTypes.Message<'setPlayState'> = {
            type: 'setPlayState',
            payload: {
                playState: false
            },
            sessionID: sid!,
            receiverID: 'server',
            receiverType: 'server',
            senderID: userID!,
            senderType: 'user',
            timestamp: new Date()
        }

        websocketService.sendMessageToServer(newMessage)
    }

    export function sendPan() {
        if (sid === null || userID === null) {
            return
        }

        const newMessage: MessageTypes.Message<'pan'> = {
            type: 'pan',
            payload: {
                x: panX,
                y: panY,
                k: panK
            },
            sessionID: sid!,
            receiverID: 'server',
            receiverType: 'server',
            senderID: userID!,
            senderType: 'user',
            timestamp: new Date()
        }

        websocketService.sendMessageToServer(newMessage)
    }
}
