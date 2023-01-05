
import * as PIXI from "pixi.js"
import * as d3 from "d3"

import { VisGraph } from '../types'
import { SelectionDataReducerAction, SelectionDataState } from "../reducers/selection.reducer"

import { API } from '../services/api.service'

// Create and load bitmap font.
PIXI.BitmapFont.from('font', {
    fontFamily: 'sans-serif',
    fontSize: 20,
    align: 'center',
    stroke: 'white',
    strokeThickness: 4,
    wordWrap: true,
    wordWrapWidth: 5,
    breakWords: true
})

interface RenderedNode extends VisGraph.HashedGraphNode {
    nodesprite: PIXI.Sprite,
    textsprite: PIXI.BitmapText,
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
PIXI.settings.FILTER_RESOLUTION = PIXI.MSAA_QUALITY.HIGH

const app = new PIXI.Application({
    width:window.innerWidth,
    height:window.innerHeight,
    resizeTo: window,
    backgroundColor: 0xFFFFFF,
    antialias: true
})

const SPRITESCALE = 2.5

let nodeDict: {[key: string]: VisGraph.GraphNode} = {}

let renderedEdges: VisGraph.RenderedEdge[] = []

let renderedNodes: RenderedNode[] = []
let panEnabled = true
let startupFlag = false

let selectionBox = {
    x0: 0,
    y0: 0,
    x1: 0,
    y1: 0
}

const animationSpeed = 0.04
const multiSelectDelay = 250

let transformX = 0
let transformY = 0
let transformK = 1.0

let prevTransform: d3.ZoomTransform | null = null

let transformHandler = (event: any) => {}

let selectionRect = new PIXI.Graphics()

let animatorTriggered = false

let start : DOMHighResTimeStamp | null = null
let previousTimestep : DOMHighResTimeStamp | null = null

class SpriteCache {
    static cache: {[key: string]: PIXI.Sprite[]} = {}

    static pushSprite(sprite: PIXI.Sprite, shape: VisGraph.Shape) {

        if (this.cache[shape.toString()] === undefined) {
            this.cache[shape.toString()] = []
        }

        app.stage.removeChild(sprite)

        sprite.removeAllListeners()

        this.cache[shape.toString()].unshift(sprite)

        // Disable the sprite
        sprite.visible = false
    }

    static getSprite(shape: VisGraph.Shape) {
        let shapeString = shape.toString()
        if (this.cache[shapeString] === undefined) {
            this.cache[shapeString] = []
        }

        if (this.cache[shapeString].length === 0) {
            if (shape === 'line') {
                return new PIXI.Sprite(PIXI.Texture.WHITE)
            }

            return new PIXI.Sprite(PIXI.Texture.from(`https://dev.visgraph:3001/${shape}.png`))
        }

        return this.cache[shapeString].pop()!
    }

    static clearCache() {
        Object.values(this.cache).forEach((sprites) => {
            sprites.forEach((sprite) => {
                sprite.destroy()
        })})

        this.cache = {}
    }
}

/**
 * Transforms nodes and lines on zoom/pan.
 * @returns void
 */
function setTransformCallback(transformUpdate: () => void) {
    if (!panEnabled) {
        return
    }

    transformHandler = (event: any) => {
        if (!panEnabled && prevTransform) {
            // Draw selection box.
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

        if (!panEnabled) {
            return
        }

        transformX = event.transform.x
        transformY = event.transform.y
        transformK = event.transform.k

        transformUpdate()

        // Update server pan.
        API.setPan(transformX, transformY, transformK)
    }

    d3.select('.render')
        // @ts-ignore
        .call(d3.zoom()
        .scaleExtent([0.01, 3])
        .on('start', () => {
            if (prevTransform) {
                console.log('Resetting view')
                // @ts-ignore
                d3.select('.render').call(d3.zoom().transform, prevTransform)
            }

            prevTransform = null
        })
        .on('zoom', (event) => {
            transformHandler(event)
        }).on("end", () => {
    }))
}

function getSprite(shape: VisGraph.Shape) {
    const edgeZ = 2
    const nodeZ = 3

    let newSprite = SpriteCache.getSprite(shape)

    newSprite.visible = true

    if (shape === 'line') {
        newSprite.zIndex = edgeZ
    }
    else {
        newSprite.zIndex = nodeZ
        newSprite.anchor.set(0.5, 0.5)
    }

    app.stage.addChild(newSprite)

    return newSprite
}

/**
 * Generates circles and lines for use in rendering.
 */
function setupRendering() {
    app.stage.sortableChildren = true

    // Generate a set of edges.
    // for (let i = 0; i < edgeStartingCount; i++) {
    //     let lineSprite = getSprite('line')

    //     app.stage.addChild(lineSprite)
    // }

    // Generate a set of nodes.
    // for (let i = 0; i < nodeStartingCount; i++) {

    // }
}

function renderBackground(stage: PIXI.Container,
    dispatch: React.Dispatch<SelectionDataReducerAction> | null,
    nodes: RenderedNode[], selectionDispatch: React.Dispatch<SelectionDataReducerAction>) {

    const background = new PIXI.Sprite(PIXI.Texture.WHITE);

    background.width = window.innerWidth
    background.height = window.innerHeight
    background.interactive = true

    background.zIndex = -1

    stage.addChild(background)

    var multiSelectTimer: ReturnType<typeof setTimeout> | null = null

    // Pointer down event.
    background.on(('pointerdown'), (event: any) => {
        // If timer is running, clear it.
        if (multiSelectTimer) {
            clearTimeout(multiSelectTimer)
            multiSelectTimer = null
            prevTransform = null
        }

        // Start timer.
        multiSelectTimer = setTimeout(() => {
            // If timer is still running, it's a multi-select.
            panEnabled = false

            multiSelectTimer = null

            selectionBox.x0 = event.data.global.x
            selectionBox.y0 = event.data.global.y

            // @ts-ignore
            prevTransform = d3.zoomTransform(d3.select('.render').node())
        }, multiSelectDelay)
    })

    // Pointer up event.
    background.on(('pointerup'), () => {
        if (!panEnabled) {
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

        if (multiSelectTimer) {
            console.log('Single select')
            panEnabled = true

            if (dispatch) {
                dispatch({
                    'type': 'reset'
                })
            }

            clearTimeout(multiSelectTimer)
            multiSelectTimer = null
            prevTransform = null

            return
        }
    })

    background.on(('pointerupoutside'), () => {
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

        if (multiSelectTimer !== null) {

            panEnabled = true

            clearTimeout(multiSelectTimer)
            multiSelectTimer = null

            return
        }
    })

    background.on(('pointermove'), () => {
        if (multiSelectTimer) {
            panEnabled = true

            clearTimeout(multiSelectTimer)

            multiSelectTimer = null
            prevTransform = null
        }
    })

    stage.addChild(background)

    return background
}

function cleanMemory() {
    console.log(`Cleaning stage (${app.stage.children.length} objects)`)

    renderedEdges.forEach((edge) => {
        edge.gfx?.destroy()
    })

    renderedNodes.forEach((renderedNode) => {
        renderedNode.nodesprite?.destroy()
        renderedNode.textsprite?.destroy()
    })

    app.stage.children.forEach((child) => {
        child.destroy()
    })

    app.stage.removeChildren()

    app.stage.destroy()
    console.log('Cleaned Memory')
}

function updateNodePositions(nodes: VisGraph.HashedGraphNode[]) {
    let nodeDict: {[key: string]: VisGraph.GraphNode} = {}

    renderedNodes.forEach((renderedNode, index) => {
        renderedNode.x = nodes[index].x
        renderedNode.y = nodes[index].y

        // node.gfx.x = nodes[index].x * transformK + transformX
        // node.gfx.y = nodes[index].y * transformK + transformY

        renderedNode.nodesprite.scale.x = ((renderedNode.visualAttributes.radius) / 16  * transformK ) / SPRITESCALE
        renderedNode.nodesprite.scale.y = ((renderedNode.visualAttributes.radius) / 16  * transformK ) / SPRITESCALE

        nodeDict[renderedNode.id] = renderedNode
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
    renderedNodes.forEach((renderedNode) => {
        renderedNode.nodesprite.x = renderedNode.x * transformK + transformX
        renderedNode.nodesprite.y = renderedNode.y * transformK + transformY

        renderedNode.textsprite.x = ((renderedNode.x) * transformK + transformX) - renderedNode.textsprite.textWidth / 2
        renderedNode.textsprite.y = (renderedNode.y * transformK + transformY) - renderedNode.textsprite.textHeight / 2

        renderedNode.nodesprite.scale.x = ((renderedNode.visualAttributes.radius) / 16 * transformK) / SPRITESCALE
        renderedNode.nodesprite.scale.y = ((renderedNode.visualAttributes.radius) / 16 * transformK) / SPRITESCALE
    })

    renderedEdges.forEach((edge, index) => {
        if (edge.gfx === null) {
            return
        }

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
        edge.gfx.height = edge.visualAttributes.width
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

        renderedNodes.forEach((renderedNode) => {
            gfxDict[renderedNode.id] = renderedNode

            let gfx = renderedNode.nodesprite

            let targetX = renderedNode.x * transformK + transformX
            let targetY = renderedNode.y * transformK + transformY

            if (renderedNode.visualAttributes.prevShape !== renderedNode.visualAttributes.shape) {
                console.log('Spriteflip')

                gfx.x = targetX
                gfx.y = targetY

                renderedNode.textsprite.x = targetX
                renderedNode.textsprite.y = targetY

                gfx.scale.x = ((renderedNode.visualAttributes.radius / 16) * transformK) / SPRITESCALE
                gfx.scale.y = ((renderedNode.visualAttributes.radius / 16) * transformK) / SPRITESCALE

                renderedNode.visualAttributes.prevShape = renderedNode.visualAttributes.shape
                return
            }

            if (Math.sqrt((gfx.x - targetX) ** 2 + (gfx.y - targetY) ** 2) > 1) {
                let dx = (targetX - gfx.x) *  Math.min(animationSpeed * elapsed, animationSpeed)
                let dy = (targetY - gfx.y) *  Math.min(animationSpeed * elapsed, animationSpeed)

                gfx.x += dx
                gfx.y += dy

                renderedNode.textsprite.x += dx
                renderedNode.textsprite.y += dy

                done = false

                gfx.scale.x = ((renderedNode.visualAttributes.radius / 16) * transformK) / SPRITESCALE
                gfx.scale.y = ((renderedNode.visualAttributes.radius / 16) * transformK) / SPRITESCALE
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
            let angle = Math.atan2(target.nodesprite.y - source.nodesprite.y,
                                   target.nodesprite.x - source.nodesprite.x);

            let sinSource = Math.sin(angle) * source.visualAttributes.radius / 16;
            let cosSource = Math.cos(angle) * source.visualAttributes.radius / 16;

            let sinTarget = Math.sin(angle) * target.visualAttributes.radius  / 16;
            let cosTarget = Math.cos(angle) * target.visualAttributes.radius  / 16;

            let sourceX = (source.nodesprite.x + cosSource);
            let sourceY = (source.nodesprite.y + sinSource);

            let targetX = (target.nodesprite.x - cosTarget);
            let targetY = (target.nodesprite.y - sinTarget);

            let dx = targetX - sourceX;
            let dy = targetY - sourceY;

            let lineLength = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

            let nx = dx / lineLength;
            let ny = dy / lineLength;

            let wingLength = 5 * transformK;

            gfx.tint = PIXI.utils.rgb2hex(hsltorgb(edge.visualAttributes.hue,
                edge.visualAttributes.saturation,
                edge.visualAttributes.lightness))
            gfx.width = lineLength

            gfx.height = edge.visualAttributes.width
            gfx.x = (source.nodesprite.x + cosSource)
            gfx.y = (source.nodesprite.y + sinSource)
            gfx.rotation = angle
        })
    }

    if (!done) {

        requestAnimationFrame(animator)

        return
    }

    animatorTriggered = false
}

// HSL to RGB
// H: [0:360] S: [0:1] L: [0:1]
// Returns [r, g, b] in [0:1]
// https://www.30secondsofcode.org/js/s/hsl-to-rgb
const hsltorgb = (h: number, s: number, l: number) => {
    s /= 1;
    l /= 1;

    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) =>
       l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

    return [f(0), f(8), f(4)];
}

export function Renderer({
    container,
    nodes,
    edges,
    directed,
    selectionState,
    selectionDispatch
    }: RendererProps) {

    if (!startupFlag) {
        setupRendering()

        startupFlag = true
    }

    container.appendChild(app.view)
    app.stage.addChild(selectionRect)

    renderedNodes.forEach((renderedNode) => {
        SpriteCache.pushSprite(renderedNode.nodesprite, renderedNode.visualAttributes.shape)

        renderedNode.textsprite.destroy()

        app.stage.removeChild(renderedNode.textsprite)})

    renderedEdges.forEach((renderedEdge) => {
        if (renderedEdge.gfx)
            SpriteCache.pushSprite(renderedEdge.gfx, 'line')
    })

    app.render()

    nodeDict = {}

    /* Update node gfx. */
    var multiSelectTimer: ReturnType<typeof setTimeout> | null = null

    renderedNodes = nodes.map((node) => {
        const nodeSprite = getSprite(node.visualAttributes.shape)

        const text = new PIXI.BitmapText('ABCD', {fontName: 'font'})

        // nodeSprite.x = node.x * transformK + transformX
        // nodeSprite.y = node.y * transformK + transformY

        nodeSprite.tint = PIXI.utils.rgb2hex(hsltorgb(node.visualAttributes.hue,
            node.visualAttributes.saturation,
            node.visualAttributes.lightness))

        nodeSprite.alpha = node.visualAttributes.alpha
        nodeSprite.interactive = true

        text.text = node.visualAttributes.text

        text.x = (node.x * transformK + transformX) - text.textWidth / 2
        text.y = (node.y * transformK + transformY) - text.textHeight / 2

        text.zIndex = 100

        app.stage.addChild(text)

        const id = node.id
        nodeSprite.on(('pointerdown'), () => {
            if (selectionDispatch === null) {
                return
            }

            if (multiSelectTimer !== null) {
                return
            }

            if (multiSelectTimer) {
                clearTimeout(multiSelectTimer)
                multiSelectTimer = null
            }

            multiSelectTimer = setTimeout(() => {selectionDispatch({
                'attribute': 'node',
                'type': 'longClick',
                'id': id
            })}, 250)
        })

        nodeSprite.on(('pointertap'), () => {
            if (selectionDispatch === null) {
                return
            }

            if (multiSelectTimer !== null) {

                clearTimeout(multiSelectTimer)

                multiSelectTimer = null
            }



            selectionDispatch({
                'attribute': 'node',
                'type': 'shortClick',
                'id': id
            })
        })

        nodeSprite.on(('pointerup'), () => {
            if (selectionDispatch === null) {
                return
            }

            if (multiSelectTimer !== null) {
                clearTimeout(multiSelectTimer)
                multiSelectTimer = null
            }
        })

        nodeDict[node.id] = node

        return {
            id: node.id,
            x: node.x,
            y: node.y,
            attributes: {...node.attributes},
            hash: node.hash,
            visualAttributes: {...node.visualAttributes},
            nodesprite: nodeSprite,
            textsprite: text
        }
    })

    if (selectionDispatch) {
        renderBackground(app.stage, selectionDispatch, renderedNodes, selectionDispatch)
    }

    renderedEdges = edges.map((edge) => {
        const gfx = getSprite('line')

        const source = nodeDict[edge.source]

        const target = nodeDict[edge.target]

        return {
            ...edge,
            sourceNode: source,
            targetNode: target,
            gfx: gfx
        }
    })


    /* If there are still rendered nodes, only update the positions. */
    if (renderedNodes.length !== 0) {
        updateNodePositions(nodes)

        setTransformCallback(updateTransform)

        window.addEventListener('beforeunload', cleanMemory);

        return {
            destroy: () => {
                window.removeEventListener('beforeunload', cleanMemory);
            }
        }
    }

    setTransformCallback(updateTransform)

    window.addEventListener('beforeunload', cleanMemory);

    app.stage.sortChildren()

    return {
        destroy: () => {
            // TODO REPLACE
            // renderedNodes.forEach(([node) => {
            //     nodeCache.push(node.gfx)
            // })

            window.removeEventListener('beforeunload', cleanMemory);
        }
    }
}
