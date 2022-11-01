
import { getNodeText } from "@storybook/testing-library"
import * as PIXI from "pixi.js"
import * as d3 from "d3"
import { useContext, useEffect } from 'react'

import { VisGraph } from '../types'
import { SelectionDataReducerAction, SelectionDataState } from "../reducers/selection.reducer"
import { selection } from "d3"

import { API } from '../services/api.service'

interface RenderedNode extends VisGraph.HashedGraphNode {
    gfx: PIXI.Sprite
}

interface RendererProps {
    container: Node,
    nodes: VisGraph.HashedGraphNode[],
    edges: VisGraph.HashedEdge[],
    directed: boolean,
    selectionState: SelectionDataState | null,
    selectionDispatch: React.Dispatch<SelectionDataReducerAction> | null
}

PIXI.settings.GC_MAX_IDLE = 100000;
PIXI.settings.PREFER_ENV = PIXI.ENV.WEBGL2
PIXI.settings.FILTER_MULTISAMPLE = PIXI.MSAA_QUALITY.HIGH

const app = new PIXI.Application({
    width:window.innerWidth,
    height:window.innerHeight,
    resizeTo: window,
    backgroundColor: 0xFFFFFF,
    antialias: true
})

const circleTexture = PIXI.Texture.from('https://dev.visgraph:3001/circle.png')

const SPRITESCALE = 2.5

app.stage.sortableChildren = true;

let nodeDict: {[key: string]: VisGraph.GraphNode} = {}

// Stack for sprites.
let edgeCache: PIXI.Sprite[] = []
let renderedEdges: VisGraph.RenderedEdge[] = []

// Stack for sprites.
let nodeCache: PIXI.Sprite[] = []
let renderedNodes: RenderedNode[] = []
let nodeIndex = 0

let pan = true
let startupFlag = false
let zooming = false

let selectionBox = {
    x0: 0,
    y0: 0,
    x1: 0,
    y1: 0
}

const animationSpeed = 0.04

const edgeStartingCount = 10000
const nodeStartingCount = 5000

const edgesPerContainer = 1500
const nodesPerContainer = 1500

let nodeContainers: PIXI.Container[] = []
let edgeContainers: PIXI.Container[] = []

let transformX = 0;
let transformY = 0;
let transformK = 1.0;

let prevTransform: d3.ZoomTransform | null = null

let transformHandler = (event: any) => {}

let selectionRect = new PIXI.Graphics()

let animatorTriggered = false

let start : DOMHighResTimeStamp | null = null
let previousTimestep : DOMHighResTimeStamp | null = null

/**
 * Transforms nodes and lines on zoom/pan.
 * @param zoomUpdate () => void
 * @param renderUpdate () => void
 * @returns void
 */
function setTransformCallback(transformUpdate: () => void) {
    if (zooming || !pan) {
        return
    }

    transformHandler = (event: any) => {
        if (!pan && prevTransform) {
            selectionRect.destroy()
            selectionRect = new PIXI.Graphics()
            selectionRect.beginFill(0x00B200, 0.3)
            selectionRect.lineStyle(3)
            selectionBox.x1 = event.transform.x - prevTransform.x
            selectionBox.y1 = event.transform.y - prevTransform.y

            selectionRect.drawRect( (selectionBox.x0),
                                    (selectionBox.y0),
                                    (event.transform.x - prevTransform.x)  ,
                                    (event.transform.y - prevTransform.y)  )
            selectionRect.endFill()
            app.stage.addChild(selectionRect)

            return
        }

        transformX = event.transform.x
        transformY = event.transform.y
        transformK = event.transform.k

        transformUpdate()
        API.setPan(transformX, transformY, transformK)
    }

    d3.select('.render')
        // @ts-ignore
        .call(d3.zoom()
        .scaleExtent([0.10, 3])
        .on('start', () => {

            if (prevTransform !== null) {
                console.log("MOVING")

                // @ts-ignore
                d3.select('.render').call(d3.zoom().transform, prevTransform)
            }

            prevTransform = null
        })
        .on('zoom', (event) => {
            transformHandler(event)
        }).on("end", () => {
            zooming = false
        }))
}

function genCircleSprite() {
    let circleSprite = new PIXI.Sprite(circleTexture)

    circleSprite.alpha = 0
    circleSprite.x = 0
    circleSprite.y = 0
    circleSprite.tint = 0xFF00FF
    circleSprite.scale.x = 0.25
    circleSprite.scale.y = 0.25

    circleSprite.anchor.set(0.5)
    return circleSprite
}

function genEdgeSprite() {
    const lineSprite = new PIXI.Sprite(PIXI.Texture.WHITE)

    lineSprite.alpha = 0
    lineSprite.x = 0
    lineSprite.y = 0
    lineSprite.tint = 0xFFFF00
    lineSprite.scale.x = 0.25
    lineSprite.scale.y = 0.25

    return lineSprite
}

/**
 * Generates circles and lines for use in rendering.
 */
function setupRendering() {
    // Starting number of containers.
    let edgeContainerCount = Math.ceil(edgeStartingCount / edgesPerContainer)

    for (let i = 0; i < edgeContainerCount; i++) {
        const container = new PIXI.Container()

        edgeContainers.push(container)

        app.stage.addChild(container)
    }

    let nodeContainerCount = Math.ceil(nodeStartingCount / nodesPerContainer)

    for (let i = 0; i < nodeContainerCount; i++) {
        const container = new PIXI.Container()

        nodeContainers.push(container)

        app.stage.addChild(container)
    }



    // Generate a set of edges.
    for (let i = 0; i < edgeStartingCount; i++) {
        const lineSprite = new PIXI.Sprite(PIXI.Texture.WHITE)

        lineSprite.tint = 0x000000

        lineSprite.alpha = 0

        edgeContainers[Math.floor(i / edgesPerContainer)].addChild(lineSprite)
        edgeCache.push(lineSprite)
    }

    // Generate a set of nodes.
    for (let i = 0; i < nodeStartingCount; i++) {
        const nodeSprite = genCircleSprite()

        nodeContainers[0].addChild(nodeSprite)

        nodeCache.push(nodeSprite)

        nodeContainers[Math.floor(i / nodesPerContainer)].addChild(nodeSprite)
    }
}

function renderBackground(stage: PIXI.Container,
    dispatch: React.Dispatch<SelectionDataReducerAction> | null,
    nodes: RenderedNode[], selectionDispatch: React.Dispatch<SelectionDataReducerAction>) {
    const background = new PIXI.Sprite(PIXI.Texture.WHITE);

    background.width = window.innerWidth
    background.height = window.innerHeight
    background.interactive = true

    background.zIndex = -100

    var timer: ReturnType<typeof setTimeout> | null = null

    background.on(('pointerdown'), (event) => {
        console.log("Pointer down")

        if (timer !== null) {
            return
        }

        if (timer) {
            clearTimeout(timer)
            timer = null
        }

        timer = setTimeout(() => {
            pan = false;
            timer = null;

            selectionBox.x0 = event.data.global.x
            selectionBox.y0 = event.data.global.y
            // @ts-ignore
            prevTransform = d3.zoomTransform(d3.select('.render').node())

            console.log('Pointer pan disabled');
        }, 250)
    })

    background.on(('mouseup'), () => {
        if (prevTransform !== null) {
            console.log("Mouse up")
            selectionRect.destroy()
            selectionRect = new PIXI.Graphics()

            nodes.forEach((node) => {
                if (node.x * transformK + transformX > selectionBox.x0
                    && node.x * transformK + transformX < selectionBox.x0 + selectionBox.x1
                    && node.y * transformK + transformY > selectionBox.y0
                    && node.y * transformK + transformY < selectionBox.y0 + selectionBox.y1) {
                    selectionDispatch({
                        type: 'add',
                        attribute: 'node',
                        value: node.id
                    })
                }
            })
        }

        if (timer) {
            console.log('Mouse up, cleared timer')
            pan = true

            if (dispatch) {
                dispatch({
                    'type': 'reset'
                })
            }

            clearTimeout(timer)
            timer = null

            return
        }
    })

    background.on(('mouseupoutside'), () => {
        if (prevTransform !== null) {

            selectionRect.destroy()
            selectionRect = new PIXI.Graphics()

            nodes.forEach((node) => {
                if (node.x * transformK + transformX > selectionBox.x0
                    && node.x * transformK + transformX < selectionBox.x0 + selectionBox.x1
                    && node.y * transformK + transformY > selectionBox.y0
                    && node.y * transformK + transformY < selectionBox.y0 + selectionBox.y1) {
                    selectionDispatch({
                        type: 'add',
                        attribute: 'node',
                        value: node.id
                    })
                }
            })
        }

        if (timer !== null) {
            console.log("Mouse up outside")
            pan = true

            // d3.select('.render')
            // // @ts-ignore
            // .call(d3.zoom()
            // .on('zoom', (event) => transformHandler(event)))


            // selectionDispatch({
            //     'attribute': 'node',
            //     'type': 'shortClick',
            //     'id': id
            // })

            clearTimeout(timer)
            timer = null

            return
        }
    })

    background.on(('pointermove'), () => {
        if (timer !== null) {
            console.log('Pointer move')
            pan = true

            // selectionDispatch({
            //     'attribute': 'node',
            //     'type': 'shortClick',
            //     'id': id
            // })

            clearTimeout(timer)
            timer = null
        }
    })

    // background.on('pointertap', function() {
    //     if (dispatch === null || zooming) {

    //         return
    //     }

    //     console.log('Pointertap')

        // dispatch({
        //     'type': 'reset'
        // })
    // })

    stage.addChild(background)

    return background
}

function getNode(): PIXI.Sprite {
    if (nodeIndex < nodeCache.length) {
        return nodeCache[nodeIndex++]
    }

    const container = new PIXI.Container()

    nodeContainers.push(container)

    for (let i = 0; i < nodesPerContainer; i++) {
        const nodeSprite = genCircleSprite()

        nodeContainers[nodeContainers.length - 1].addChild(nodeSprite)

        nodeCache.push(nodeSprite)
    }

    return nodeCache[nodeIndex++]
}

function getEdge(): PIXI.Sprite {
    let pop = edgeCache.pop()

    if (pop !== undefined && pop !== null) {
        return pop
    }

    if (edgeContainers[0].children.length === edgesPerContainer) {
        edgeContainers.push(new PIXI.Container())
    }

    for (let i = 0; i < edgesPerContainer - 1; i++) {
        const edgeSprite = genEdgeSprite()

        edgeContainers[0].addChild(edgeSprite)

        edgeCache.push(edgeSprite)
    }

    const edgeSprite = genEdgeSprite()

    edgeContainers[0].addChild(edgeSprite)

    return edgeSprite
}

function cleanRenderedNodes() {
    nodeIndex = 0

    renderedNodes = []
}

function cleanRenderedEdges() {
    renderedEdges.forEach((edge) => {
        if (edge.gfx === null)  {
            return
        }

        edgeCache.push(edge.gfx)
    })

    renderedEdges = []
}

function checkRenderedNodes(nodes: VisGraph.HashedGraphNode[]): boolean {
    cleanRenderedNodes()
    if (nodes.length !== renderedNodes.length) {

        renderedNodes.forEach((node) => {
            node.gfx.alpha = 0
        })

        return true
    }

    // for (let i = 0; i < renderedNodes.length; i++) {
    //     if (renderedNodes[i].id !== nodes[i].id) {
    //         cleanRenderedNodes()

    //         return true
    //     }
    // }

    return true
}

function checkRenderedEdges(edges: VisGraph.HashedEdge[]): boolean {
    if (edges.length !== renderedEdges.length) {
        renderedEdges.forEach((edge) => {
            if (edge.gfx === null)  {
                return
            }

            edge.gfx.alpha = 0
        })

    }
    cleanRenderedEdges()
    if (edges.length !== renderedEdges.length) {

        return true
    }

    // for (let i = 0; i < renderedEdges.length; i++) {
    //     if (renderedEdges[i].hash !== edges[i].hash) {
    //         cleanRenderedEdges()

    //         return true
    //     }
    // }

    return true
}

function cleanMemory() {
    console.log(`Cleaning stage (${app.stage.children.length} objects)`)

    renderedEdges.forEach((edge) => {
        edge.gfx?.destroy()
    })

    renderedNodes.forEach((node) => {
        node.gfx?.destroy()
    })

    app.stage.children.forEach((child) => {
        child.destroy()
    })

    console.log(`Cleaning edge cache (${edgeCache.length} objects)`)
    edgeCache.forEach((edge) => {
        edge.destroy()
    })

    console.log(`Cleaning node cache (${nodeCache.length} objects)`)
    nodeCache.forEach((node) => {
        node.destroy()
    })

    console.log(`Cleaning node containers (${nodeContainers.length} objects)`)
    nodeContainers.forEach((container) => {
        container.destroy()
    })

    console.log(`Cleaning edge containers (${edgeContainers.length} objects)`)
    edgeContainers.forEach((container) => {
        container.destroy()
    })

    app.stage.removeChildren()

    app.stage.destroy()
    console.log('Cleaned Memory')
}

function updateNodePositions(nodes: VisGraph.HashedGraphNode[]) {
    let nodeDict: {[key: string]: VisGraph.GraphNode} = {}

    renderedNodes.forEach((node, index) => {
        node.x = nodes[index].x
        node.y = nodes[index].y

        // node.gfx.x = nodes[index].x * transformK + transformX
        // node.gfx.y = nodes[index].y * transformK + transformY

        node.gfx.scale.x = ((node.visualAttributes.radius) / 16  * transformK ) / SPRITESCALE
        node.gfx.scale.y = ((node.visualAttributes.radius) / 16  * transformK ) / SPRITESCALE

        nodeDict[node.id] = node
    })

    renderedEdges.forEach((edge) => {
        if (edge.gfx === null) {
            return
        }

        const source = {...nodeDict[edge.source]}
        const target = {...nodeDict[edge.target]}

        if (source === null || target === null) {
            return
        }

        edge.sourceNode = source
        edge.targetNode = target
            // Calculate the angles to get the circle border location.
        // let angle = Math.atan2(target.y - source.y, target.x - source.x);

        // let sinSource = Math.sin(angle) * source.visualAttributes.radius;
        // let cosSource = Math.cos(angle) * source.visualAttributes.radius;

        // let sinTarget = Math.sin(angle) * target.visualAttributes.radius;
        // let cosTarget = Math.cos(angle) * target.visualAttributes.radius;

        // let sourceX = (source.x + cosSource) * transformK;
        // let sourceY = (source.y + sinSource) * transformK;

        // let targetX = (target.x - cosTarget) * transformK;
        // let targetY = (target.y - sinTarget) * transformK;

        // let dx = targetX - sourceX;
        // let dy = targetY - sourceY;

        // let lineLength = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

        // let nx = dx / lineLength;
        // let ny = dy / lineLength;

        // let wingLength = 5 * transformK;

        // edge.gfx.x = (source.x + cosSource) * transformK + transformX
        // edge.gfx.y = (source.y + sinSource) * transformK + transformY
        // edge.gfx.width = lineLength
        // edge.gfx.height = edge.visualAttributes.width * transformK
        // edge.gfx.rotation = angle
    })

    if (!animatorTriggered) {

        requestAnimationFrame(animator)
    }
}

function updateTransform() {
    renderedNodes.forEach((node) => {
        node.gfx.x = node.x * transformK + transformX
        node.gfx.y = node.y * transformK + transformY

        node.gfx.scale.x = ((node.visualAttributes.radius) / 16 * transformK) / SPRITESCALE
        node.gfx.scale.y = ((node.visualAttributes.radius) / 16 * transformK) / SPRITESCALE
    })

    renderedEdges.forEach((edge, index) => {
        if (edge.gfx === null) {
            return
        }

        // edge.gfx.x = edge.gfx.x * transformK + transformX
        // edge.gfx.y = edge.gfx.y * transformK + transformY

        // edge.gfx.scale.x = transformK
        // edge.gfx.scale.y = transformK

        const source = {...edge.sourceNode}

        const target = {...edge.targetNode}

            // Calculate the angles to get the circle border location.
        let angle = Math.atan2(target.y - source.y, target.x - source.x);

        let sinSource = Math.sin(angle) * source.visualAttributes.radius / SPRITESCALE;
        let cosSource = Math.cos(angle) * source.visualAttributes.radius / SPRITESCALE;

        let sinTarget = Math.sin(angle) * target.visualAttributes.radius / SPRITESCALE;
        let cosTarget = Math.cos(angle) * target.visualAttributes.radius / SPRITESCALE;

        let sourceX = (source.x + cosSource) * transformK;
        let sourceY = (source.y + sinSource) * transformK;

        let targetX = (target.x - cosTarget) * transformK;
        let targetY = (target.y - sinTarget) * transformK;

        let dx = targetX - sourceX;
        let dy = targetY - sourceY;

        let lineLength = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

        let nx = dx / lineLength;
        let ny = dy / lineLength;

        let wingLength = 5 * transformK;

        edge.gfx.x = (source.x + cosSource) * transformK + transformX
        edge.gfx.y = (source.y + sinSource) * transformK + transformY

        edge.gfx.width = lineLength
        edge.gfx.height = edge.visualAttributes.width * transformK
        edge.gfx.rotation = angle
    })
}

function animator(timestamp: DOMHighResTimeStamp) {
    animatorTriggered = true

    if (start === null) {
        start = timestamp
    }

    const elapsed = timestamp - start;
    let done = true

    if (previousTimestep !== timestamp) {


        let gfxDict: {[key: string]: RenderedNode} = {}

        renderedNodes.forEach((node) => {
            gfxDict[node.id] = node
            let gfx = node.gfx

            let targetX = node.x * transformK + transformX
            let targetY = node.y * transformK + transformY

            if (Math.sqrt((gfx.x - targetX) ** 2 + (gfx.y - targetY) ** 2) > 1) {
                gfx.x += (targetX - gfx.x) *  Math.min(animationSpeed * elapsed, animationSpeed)
                gfx.y += (targetY - gfx.y) * Math.min(animationSpeed * elapsed, animationSpeed)

                done = false

                gfx.scale.x = ((node.visualAttributes.radius / 16) * transformK) / SPRITESCALE
                gfx.scale.y = ((node.visualAttributes.radius / 16) * transformK) / SPRITESCALE
            }
        })

        renderedEdges.forEach((edge) => {
            let source = gfxDict[edge.source]

            let target = gfxDict[edge.target]

            let gfx = edge.gfx

            if (!gfx)
                return

            gfx.alpha = edge.visualAttributes.alpha

            // Calculate the angles to get the circle border location.
            let angle = Math.atan2(target.gfx.y - source.gfx.y, target.gfx.x - source.gfx.x);

            let sinSource = Math.sin(angle) * source.visualAttributes.radius / 16;
            let cosSource = Math.cos(angle) * source.visualAttributes.radius / 16;

            let sinTarget = Math.sin(angle) * target.visualAttributes.radius  / 16;
            let cosTarget = Math.cos(angle) * target.visualAttributes.radius  / 16;

            let sourceX = (source.gfx.x + cosSource);
            let sourceY = (source.gfx.y + sinSource);

            let targetX = (target.gfx.x - cosTarget);
            let targetY = (target.gfx.y - sinTarget);

            let dx = targetX - sourceX;
            let dy = targetY - sourceY;

            let lineLength = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

            let nx = dx / lineLength;
            let ny = dy / lineLength;

            let wingLength = 5 * transformK;

            // Rounds to nearest integer larger than zero. Possibly unnecessary due to ROUND_PIXELS.
            // lineGraphic.lineStyle(Math.round(transform_k * 2) <= 0 ? 1 : Math.round(transform_k * 2), lineColour, alpha);

            // lineGraphic.setTransform(
            //     (source.x + cosSource) * transform_k,
            //     (target.x - cosTarget) * transform_k,
            // )



            gfx.tint = PIXI.utils.rgb2hex(edge.visualAttributes.fillColour)
            gfx.width = lineLength

            gfx.height = edge.visualAttributes.width * transformK
            gfx.x = (source.gfx.x + cosSource)
            gfx.y = (source.gfx.y + sinSource)
            gfx.rotation = angle
        })
    }

    if (!done) {

        requestAnimationFrame(animator)

        return
    }



    animatorTriggered = false
}

export function Renderer({
    container,
    nodes,
    edges,
    directed,
    selectionState,
    selectionDispatch
    }: RendererProps) {

    console.log('Render start')
    if (!startupFlag) {
        setupRendering()

        startupFlag = true
    }

    /* Check if nodes need to be re-rendered. */
    const nodesShouldUpdate = checkRenderedNodes(nodes)
    const edgesShouldUpdate = checkRenderedEdges(edges)

    container.appendChild(app.view)
    app.stage.addChild(selectionRect)

    if (nodesShouldUpdate) {
        nodeDict = {}
        /* Update node gfx. */
        var timer: ReturnType<typeof setTimeout> | null = null

        renderedNodes = nodes.map((node) => {
            const gfx = getNode()

            gfx.tint = PIXI.utils.rgb2hex(node.visualAttributes.fillColour)

            gfx.alpha = node.visualAttributes.alpha

            gfx.interactive = true
            gfx.zIndex = 100

            const id = node.id
            gfx.removeAllListeners()

            // callback?
            gfx.on(('pointerdown'), () => {
                if (selectionDispatch === null) {
                    return
                }

                if (timer !== null) {
                    return
                }

                if (timer) {
                    clearTimeout(timer)
                    timer = null
                }

                timer = setTimeout(() => {selectionDispatch({
                    'attribute': 'node',
                    'type': 'longClick',
                    'id': id
                })}, 250)
            })

            gfx.on(('pointertap'), () => {
                if (selectionDispatch === null) {
                    return
                }

                if (timer !== null) {
                    console.log('clearing timer')
                    clearTimeout(timer)

                    timer = null
                }

                console.log('tap')

                selectionDispatch({
                    'attribute': 'node',
                    'type': 'shortClick',
                    'id': id
                })
            })

            gfx.on(('pointerup'), () => {
                if (selectionDispatch === null) {
                    return
                }

                if (timer !== null) {
                    console.log('click up')

                    // selectionDispatch({
                    //     'attribute': 'node',
                    //     'type': 'shortClick',
                    //     'id': id
                    // })

                    clearTimeout(timer)
                    timer = null
                }
            })

            // gfx.on(('mouseupoutside'), () => {
            //     if (timer !== null) {
            //         clearTimeout(timer)
            //         timer = null
            //     }

            //     if (selectionDispatch) {
            //         selectionDispatch({
            //             'type': 'reset'
            //         })
            //     }
            // })



            nodeDict[node.id] = node

            return {
                id: node.id,
                x: node.x,
                y: node.y,
                attributes: node.attributes,
                hash: node.hash,
                visualAttributes: node.visualAttributes,
                gfx: gfx
            }
        })


    }

    if (edgesShouldUpdate) {
        renderedEdges = edges.map((edge) => {
            const gfx = getEdge()

            const source = nodeDict[edge.source]

            const target = nodeDict[edge.target]



            return {
                ...edge,
                sourceNode: source,
                targetNode: target,
                gfx: gfx
            }
        })
    }

    if (selectionDispatch) {
        renderBackground(app.stage, selectionDispatch, renderedNodes, selectionDispatch)
    }

    /* If there are still rendered nodes, only update the positions. */
    if (renderedNodes.length !== 0) {
        updateNodePositions(nodes)

        setTransformCallback(updateTransform)

        window.addEventListener('beforeunload', cleanMemory);

        console.log('Render end')

        return {
            destroy: () => {
                window.removeEventListener('beforeunload', cleanMemory);
            }
        }
    }

    setTransformCallback(updateTransform)

    window.addEventListener('beforeunload', cleanMemory);

    console.log('Render end')
    return {
        destroy: () => {
            renderedNodes.forEach((node) => {
                nodeCache.push(node.gfx)
            })

            window.removeEventListener('beforeunload', cleanMemory);
        }
    }
}
