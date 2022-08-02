import cytoscape from 'cytoscape'
// // @ts-ignore
// import fcose from 'cytoscape-fcose'
// // @ts-ignore
// import euler from 'cytoscape-euler'
// // @ts-ignore
// import cola from 'cytoscape-cola'
// // @ts-ignore
// import spread from 'cytoscape-spread'
// // @ts-ignore
// import cise from 'cytoscape-cise'
// // @ts-ignore
// import d3Force from 'cytoscape-d3-force'

// cytoscape.use(fcose)
// cytoscape.use(euler)
// cytoscape.use(cola)
// cytoscape.use(spread)
// cytoscape.use(cise)
// cytoscape.use(d3Force)

import { Session } from './sessions'

import { Worker } from 'worker_threads'
import {
    setTimeout
  } from 'timers/promises';


export module Cyto {
    type AvailableLayout =
        | 'null'
        | 'random'
        | 'cose'
        | 'grid'
        | 'circle'
        | 'breadthfirst'
        | 'cose'
        | 'fcose'
        | 'cola'
        | 'cise'
        | 'spread'
        | 'd3-force'

    export type LayoutSetting =
        |   {
                name: string,
                description: string,
                type: 'number',
                defaultValue: number
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

    export function loadJson(cy: cytoscape.Core | null,
            nodes: {[key: string]: any}[], edges: {[key: string]: any}[]) {

        if (cy === null) {
            console.log('NO CYTO')
            return
        }

        const json = {
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
                    if (index === 0) {
                        console.log(edge)
                    }

                    return edge
                })
            }
        }

        cy.json(json)
    }

    async function layoutTimer(resolve: any, worker: Worker, signal: AbortSignal ) {
        try {
            await setTimeout(60000, null, {
                signal: signal
            })

            console.log('TERMINATING')
            worker.terminate()

            resolve('')
        } catch {

        }
    }

    export async function setLayout(cy: cytoscape.Core, settings: Session.LayoutSettings) {

        return new Promise((layoutResolve) => {
            if (!(Cyto.getAvailableLayouts().map((layoutInfo) => {return layoutInfo.name}).includes(settings.name as AvailableLayout))) {
                return
            }

            const worker = new Worker('./src/workers/layout.worker.js')
            const ac = new AbortController()

            layoutTimer(layoutResolve, worker, ac.signal).finally(() => {
                ac.abort()
            })

            worker.postMessage({
                graphData: cy.json(),
                settings: settings,
                width: 3000,
                height: 3000
            })

            worker.on('message', (result) => {
                ac.abort()

                cy.json(result)

                layoutResolve('')
            })
        })
    }

    export function getAvailableLayouts(): LayoutInfo[] {
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
                        defaultValue: 0
                    },
                    {
                        name: 'rows',
                        description: 'Force number of rows in the grid.',
                        type: 'number',
                        defaultValue: 0,
                    },
                    {
                        name: 'cols',
                        description: 'Force number of columns in the grid.',
                        type: 'number',
                        defaultValue: 0,
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
                        defaultValue: 0
                    },
                    {
                        name: 'spacingFactor',
                        description: 'Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up.',
                        type: 'number',
                        defaultValue: 0
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
                        defaultValue: 1
                    },
                    {
                        name: 'nodeOverlap',
                        description: 'Node repulsion (overlapping) multiplier.',
                        type: 'number',
                        defaultValue: 4
                    },
                    {
                        name: 'nestingFactor',
                        description: 'Nesting factor (multiplier) to compute ideal edge length for nested edges.',
                        type: 'number',
                        defaultValue: 1.2
                    },
                    {
                        name: 'coolingFactor',
                        description: 'Cooling factor (how the temperature is reduced between consecutive iterations.',
                        type: 'number',
                        defaultValue: 0.99
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
                        defaultValue: 0.25
                    },
                    {
                        name: 'gravityRange',
                        description: 'Gravity range (constant).',
                        type: 'number',
                        defaultValue: 3.8
                    },
                    {
                        name: 'nestingFactor',
                        description: 'Nesting factor (multiplier) to compute ideal edge length for nested edges.',
                        type: 'number',
                        defaultValue: 0.1
                    },
                    {
                        name: 'numIter',
                        description: 'Number of iterations.',
                        type: 'number',
                        defaultValue: 2500
                    }
                ]
            },
            {
                name: 'cola',
                description: 'The cola layout uses a force-directed physics simulation with several sophisticated constraints.',
                link: 'https://github.com/cytoscape/cytoscape.js-cola',
                settings: [
                    {
                        name: 'randomize',
                        description: 'Randomizes initial node positions.',
                        type: 'boolean',
                        defaultValue: true
                    },
                    {
                        name: 'convergenceThreshold',
                        description: 'when the alpha value (system energy) falls below this value, the layout stops.',
                        type: 'number',
                        defaultValue: 0.01
                    },
                    {
                        name: 'edgeLength',
                        description: 'sets edge length directly in simulation.',
                        type: 'number',
                        defaultValue: 0
                    },
                ]
            },
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
                            defaultValue: 0
                        },
                ]
            }
        ]
    }

    export function addNode(
        cy: cytoscape.Core,
        id: string,
        data: {[key: string]: any},
        position: {x: number, y: number} | undefined) {

        cy.add({
            group: 'nodes',
            data: Object.assign({}, {id: id}, data),
            position: position
        })
    }

    export function addEdge(
        cy: cytoscape.Core,
        id: string,
        source: string,
        target: string,
        data: {[key: string]: any}) {

        cy.add({
            group: 'edges',
            data: Object.assign({}, {
                id: id,
                source: source,
                target: target
            }, data)
        })
    }

    export function removeElement(
        cy: cytoscape.Core,
        id: string) {

        cy.remove(id)
    }

    export function destroyGraph(
        cy: cytoscape.Core) {

        cy.destroy()
    }
}
