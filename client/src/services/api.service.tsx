import { GraphDataState } from '../reducers/graphdata.reducer'
import { LayoutState } from '../reducers/layoutsettings.reducer'
import { VisGraph } from '../types'
import { websocketService } from './websocket.service'

export module API {
    let sid: null | string = null

    export function setSID(newSID: string) {
        sid = newSID
    }

    export function step() {
        if (sid === null) {
            return
        }

        websocketService.sendMessage({
            type: 'set',
            contents: {
                attribute: 'sim',
                value: 1
            },
            sid: sid
        })
    }

    export function updateGraph(graphState: GraphDataState) {
        if (sid === null) {
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

        websocketService.sendMessage({
            type: 'set',
            contents: {
                attribute: 'data',
                value: {
                    nodes: nodes,
                    edges: edges
                }
            },
            sid: sid
        })
    }

    export function updateUsername(name: string) {
        if (sid === null) {
            return
        }

        if (name === '') {
            return
        }

        console.log(`Updating username`)

        websocketService.sendMessage({
            type: 'set',
            contents: {
                attribute: 'username',
                value: name
            },
            sid: sid
        })
    }

    export function getInfo() {
        if (sid === null) {
            return
        }

        console.log(`Getting info`)

        websocketService.sendMessage({
            type: 'get',
            contents: {
                attribute: 'info'
            },
            sid: sid
        })
    }

    export function getLayouts() {
        if (sid === null) {
            return
        }

        console.log(`Getting layout`)

        websocketService.sendMessage({
            type: 'get',
            contents: {
                attribute: 'layouts'
            },
            sid: sid
        })
    }

    export function setLayout(layout: LayoutState) {
        if (sid === null) {
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

        websocketService.sendMessage({
            type: 'set',
            contents: {
                attribute: 'layout',
                value: {
                    settings: {name: layout.name, settings: res}
                }
            },
            sid: sid
        })
    }
}
