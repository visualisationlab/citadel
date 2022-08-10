import { GraphDataState } from '../reducers/graphdata.reducer'
import { LayoutState } from '../reducers/layoutsettings.reducer'
import { VisGraph } from '../types'
import { websocketService } from './websocket.service'

export module API {
    let sid: null | string = null
    let userID: null | string = null

    export function setSID(newSID: string) {
        sid = newSID
    }

    export function setUserID(newUserID: string) {
        userID = newUserID
    }

    export function step(stepCount: number) {
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
                stepCount: stepCount
            }
        })
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
            return
        }

        websocketService.sendSetMessage({
            messageType: 'set',
            dataType: 'graphState',
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
}
