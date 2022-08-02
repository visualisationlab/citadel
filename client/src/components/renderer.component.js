"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Renderer = void 0;
const PIXI = __importStar(require("pixi.js"));
const d3 = __importStar(require("d3"));
// PIXI.settings.ROUND_PIXELS = true;
PIXI.settings.GC_MAX_IDLE = 100000;
// PIXI.settings.PRECISION_FRAGMENT = PIXI.PRECISION.LOW;
// PIXI.settings.PRECISION_VERTEX = PIXI.PRECISION.LOW;
PIXI.settings.PREFER_ENV = PIXI.ENV.WEBGL2;
PIXI.settings.FILTER_MULTISAMPLE = PIXI.MSAA_QUALITY.HIGH;
const app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    resizeTo: window,
    backgroundColor: 0xFFFFFF,
    antialias: true
});
const circleTexture = PIXI.Texture.from('http://192.168.0.199:3001/node2.png');
app.stage.sortableChildren = true;
let nodeDict = {};
// Stack for sprites.
let edgeCache = [];
let renderedEdges = [];
// Stack for sprites.
let nodeCache = [];
let renderedNodes = [];
let pan = true;
let startupFlag = false;
let zooming = false;
let selectionBox = {
    x0: 0,
    y0: 0,
    x1: 0,
    y1: 0
};
const edgeStartingCount = 10000;
const nodeStartingCount = 5000;
const edgesPerContainer = 1500;
const nodesPerContainer = 1500;
let nodeContainers = [];
let edgeContainers = [];
let transformX = 0;
let transformY = 0;
let transformK = 1.0;
let prevTransform = null;
let transformHandler = (event) => { };
let selectionRect = new PIXI.Graphics();
/**
 * Transforms nodes and lines on zoom/pan.
 * @param zoomUpdate () => void
 * @param renderUpdate () => void
 * @returns void
 */
function setTransformCallback(transformUpdate) {
    if (zooming || !pan) {
        return;
    }
    transformHandler = (event) => {
        if (!pan && prevTransform) {
            selectionRect.destroy();
            selectionRect = new PIXI.Graphics();
            selectionRect.beginFill(0x00B200, 0.3);
            selectionRect.lineStyle(3);
            selectionBox.x1 = event.transform.x - prevTransform.x;
            selectionBox.y1 = event.transform.y - prevTransform.y;
            selectionRect.drawRect((selectionBox.x0), (selectionBox.y0), (event.transform.x - prevTransform.x), (event.transform.y - prevTransform.y));
            selectionRect.endFill();
            app.stage.addChild(selectionRect);
            return;
        }
        transformX = event.transform.x;
        transformY = event.transform.y;
        transformK = event.transform.k;
        transformUpdate();
    };
    d3.select('.render')
        // @ts-ignore
        .call(d3.zoom()
        .scaleExtent([0.10, 3])
        .on('start', () => {
        if (prevTransform !== null) {
            console.log("MOVING");
            // @ts-ignore
            d3.select('.render').call(d3.zoom().transform, prevTransform);
        }
        prevTransform = null;
    })
        .on('zoom', (event) => {
        // console.log('here')
        transformHandler(event);
    }).on("end", () => {
        zooming = false;
    }));
}
function genCircleSprite() {
    let circleSprite = new PIXI.Sprite(circleTexture);
    circleSprite.alpha = 0;
    circleSprite.x = 0;
    circleSprite.y = 0;
    circleSprite.tint = 0xFF00FF;
    circleSprite.scale.x = 1;
    circleSprite.scale.y = 1;
    circleSprite.anchor.set(0.5);
    return circleSprite;
}
function genEdgeSprite() {
    const lineSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
    lineSprite.alpha = 0;
    lineSprite.x = 0;
    lineSprite.y = 0;
    lineSprite.tint = 0xFFFF00;
    lineSprite.scale.x = 1;
    lineSprite.scale.y = 1;
    return lineSprite;
}
/**
 * Generates circles and lines for use in rendering.
 */
function setupRendering() {
    // Starting number of containers.
    let edgeContainerCount = Math.ceil(edgeStartingCount / edgesPerContainer);
    for (let i = 0; i < edgeContainerCount; i++) {
        const container = new PIXI.Container();
        edgeContainers.push(container);
        app.stage.addChild(container);
    }
    let nodeContainerCount = Math.ceil(nodeStartingCount / nodesPerContainer);
    for (let i = 0; i < nodeContainerCount; i++) {
        const container = new PIXI.Container();
        nodeContainers.push(container);
        app.stage.addChild(container);
    }
    // Generate a set of edges.
    for (let i = 0; i < edgeStartingCount; i++) {
        const lineSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
        lineSprite.tint = 0x000000;
        lineSprite.alpha = 0;
        edgeContainers[Math.floor(i / edgesPerContainer)].addChild(lineSprite);
        edgeCache.push(lineSprite);
    }
    // Generate a set of nodes.
    for (let i = 0; i < nodeStartingCount; i++) {
        const nodeSprite = genCircleSprite();
        nodeContainers[0].addChild(nodeSprite);
        nodeCache.push(nodeSprite);
        nodeContainers[Math.floor(i / nodesPerContainer)].addChild(nodeSprite);
    }
}
function renderBackground(stage, dispatch, nodes, selectionDispatch) {
    const background = new PIXI.Sprite(PIXI.Texture.WHITE);
    background.width = window.innerWidth;
    background.height = window.innerHeight;
    background.interactive = true;
    background.zIndex = -100;
    var timer = null;
    background.on(('pointerdown'), (event) => {
        if (timer !== null) {
            return;
        }
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
        timer = setTimeout(() => {
            pan = false;
            timer = null;
            selectionBox.x0 = event.data.global.x;
            selectionBox.y0 = event.data.global.y;
            // @ts-ignore
            prevTransform = d3.zoomTransform(d3.select('.render').node());
            console.log('disabled pan');
        }, 250);
    });
    background.on(('mouseup'), () => {
        if (prevTransform !== null) {
            console.log(selectionBox);
            selectionRect.destroy();
            selectionRect = new PIXI.Graphics();
            nodes.forEach((node) => {
                if (node.x * transformK + transformX > selectionBox.x0
                    && node.x * transformK + transformX < selectionBox.x0 + selectionBox.x1
                    && node.y * transformK + transformY > selectionBox.y0
                    && node.y * transformK + transformY < selectionBox.y0 + selectionBox.y1) {
                    selectionDispatch({
                        type: 'add',
                        attribute: 'node',
                        value: node.id
                    });
                }
            });
        }
        if (timer !== null) {
            console.log('RECT OFF');
            pan = true;
            // d3.select('.render')
            // // @ts-ignore
            // .call(d3.zoom()
            // .on('zoom', (event) => transformHandler(event)))
            // selectionDispatch({
            //     'attribute': 'node',
            //     'type': 'shortClick',
            //     'id': id
            // })
            clearTimeout(timer);
            timer = null;
            return;
        }
    });
    background.on(('mouseupoutside'), () => {
        if (prevTransform !== null) {
            console.log(selectionBox);
            selectionRect.destroy();
            selectionRect = new PIXI.Graphics();
            nodes.forEach((node) => {
                if (node.x * transformK + transformX > selectionBox.x0
                    && node.x * transformK + transformX < selectionBox.x0 + selectionBox.x1
                    && node.y * transformK + transformY > selectionBox.y0
                    && node.y * transformK + transformY < selectionBox.y0 + selectionBox.y1) {
                    selectionDispatch({
                        type: 'add',
                        attribute: 'node',
                        value: node.id
                    });
                }
            });
        }
        if (timer !== null) {
            console.log('RECT OFF');
            pan = true;
            // d3.select('.render')
            // // @ts-ignore
            // .call(d3.zoom()
            // .on('zoom', (event) => transformHandler(event)))
            // selectionDispatch({
            //     'attribute': 'node',
            //     'type': 'shortClick',
            //     'id': id
            // })
            clearTimeout(timer);
            timer = null;
            return;
        }
    });
    background.on(('pointermove'), () => {
        if (timer !== null) {
            console.log('RECT OFF');
            pan = true;
            // selectionDispatch({
            //     'attribute': 'node',
            //     'type': 'shortClick',
            //     'id': id
            // })
            clearTimeout(timer);
            timer = null;
        }
    });
    background.on('pointertap', function () {
        if (dispatch === null || zooming) {
            console.log(zooming);
            return;
        }
        dispatch({
            'type': 'reset'
        });
    });
    stage.addChild(background);
    return background;
}
function getNode() {
    let pop = nodeCache.pop();
    if (pop !== undefined && pop !== null) {
        return pop;
    }
    const container = new PIXI.Container();
    nodeContainers.push(container);
    for (let i = 0; i < nodesPerContainer; i++) {
        const nodeSprite = genCircleSprite();
        nodeContainers[nodeContainers.length - 1].addChild(nodeSprite);
        nodeCache.push(nodeSprite);
    }
    return nodeCache.pop();
}
function getEdge() {
    let pop = edgeCache.pop();
    if (pop !== undefined && pop !== null) {
        return pop;
    }
    if (edgeContainers[0].children.length === edgesPerContainer) {
        edgeContainers.push(new PIXI.Container());
    }
    for (let i = 0; i < edgesPerContainer - 1; i++) {
        const edgeSprite = genEdgeSprite();
        edgeContainers[0].addChild(edgeSprite);
        edgeCache.push(edgeSprite);
    }
    const edgeSprite = genEdgeSprite();
    edgeContainers[0].addChild(edgeSprite);
    return edgeSprite;
}
function cleanRenderedNodes() {
    renderedNodes.forEach((node) => {
        nodeCache.push(node.gfx);
        node.gfx.alpha = 0;
    });
    renderedNodes = [];
}
function cleanRenderedEdges() {
    renderedEdges.forEach((edge) => {
        if (edge.gfx === null) {
            return;
        }
        edge.gfx.alpha = 0;
        edgeCache.push(edge.gfx);
    });
    renderedEdges = [];
}
function checkRenderedNodes(nodes) {
    cleanRenderedNodes();
    if (nodes.length !== renderedNodes.length) {
        return true;
    }
    // for (let i = 0; i < renderedNodes.length; i++) {
    //     if (renderedNodes[i].id !== nodes[i].id) {
    //         cleanRenderedNodes()
    //         return true
    //     }
    // }
    return true;
}
function checkRenderedEdges(edges) {
    cleanRenderedEdges();
    if (edges.length !== renderedEdges.length) {
        return true;
    }
    // for (let i = 0; i < renderedEdges.length; i++) {
    //     if (renderedEdges[i].hash !== edges[i].hash) {
    //         cleanRenderedEdges()
    //         return true
    //     }
    // }
    return true;
}
function cleanMemory() {
    console.log(`Cleaning stage (${app.stage.children.length} objects)`);
    renderedEdges.forEach((edge) => {
        var _a;
        (_a = edge.gfx) === null || _a === void 0 ? void 0 : _a.destroy();
    });
    renderedNodes.forEach((node) => {
        var _a;
        (_a = node.gfx) === null || _a === void 0 ? void 0 : _a.destroy();
    });
    app.stage.children.forEach((child) => {
        child.destroy();
    });
    console.log(`Cleaning edge cache (${edgeCache.length} objects)`);
    edgeCache.forEach((edge) => {
        edge.destroy();
    });
    console.log(`Cleaning node cache (${nodeCache.length} objects)`);
    nodeCache.forEach((node) => {
        node.destroy();
    });
    console.log(`Cleaning node containers (${nodeContainers.length} objects)`);
    nodeContainers.forEach((container) => {
        container.destroy();
    });
    console.log(`Cleaning edge containers (${edgeContainers.length} objects)`);
    edgeContainers.forEach((container) => {
        container.destroy();
    });
    app.stage.removeChildren();
    app.stage.destroy();
    console.log('Cleaned Memory');
}
function updateNodePositions(nodes) {
    let nodeDict = {};
    renderedNodes.forEach((node, index) => {
        node.x = nodes[index].x;
        node.y = nodes[index].y;
        node.gfx.x = nodes[index].x * transformK + transformX;
        node.gfx.y = nodes[index].y * transformK + transformY;
        node.gfx.scale.x = (node.visualAttributes.radius) / 16 * transformK;
        node.gfx.scale.y = (node.visualAttributes.radius) / 16 * transformK;
        nodeDict[node.id] = node;
    });
    renderedEdges.forEach((edge) => {
        if (edge.gfx === null) {
            return;
        }
        const source = Object.assign({}, nodeDict[edge.source]);
        const target = Object.assign({}, nodeDict[edge.target]);
        if (source === null || target === null) {
            return;
        }
        edge.sourceNode = source;
        edge.targetNode = target;
        // Calculate the angles to get the circle border location.
        let angle = Math.atan2(target.y - source.y, target.x - source.x);
        let sinSource = Math.sin(angle) * source.visualAttributes.radius;
        let cosSource = Math.cos(angle) * source.visualAttributes.radius;
        let sinTarget = Math.sin(angle) * target.visualAttributes.radius;
        let cosTarget = Math.cos(angle) * target.visualAttributes.radius;
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
        edge.gfx.x = (source.x + cosSource) * transformK + transformX;
        edge.gfx.y = (source.y + sinSource) * transformK + transformY;
        edge.gfx.width = lineLength;
        edge.gfx.height = edge.visualAttributes.width * transformK;
        edge.gfx.rotation = angle;
    });
}
function updateTransform() {
    renderedNodes.forEach((node) => {
        node.gfx.x = node.x * transformK + transformX;
        node.gfx.y = node.y * transformK + transformY;
        node.gfx.scale.x = (node.visualAttributes.radius) / 16 * transformK;
        node.gfx.scale.y = (node.visualAttributes.radius) / 16 * transformK;
    });
    renderedEdges.forEach((edge, index) => {
        if (edge.gfx === null) {
            return;
        }
        // edge.gfx.x = edge.gfx.x * transformK + transformX
        // edge.gfx.y = edge.gfx.y * transformK + transformY
        // edge.gfx.scale.x = transformK
        // edge.gfx.scale.y = transformK
        const source = Object.assign({}, edge.sourceNode);
        const target = Object.assign({}, edge.targetNode);
        // Calculate the angles to get the circle border location.
        let angle = Math.atan2(target.y - source.y, target.x - source.x);
        let sinSource = Math.sin(angle) * source.visualAttributes.radius;
        let cosSource = Math.cos(angle) * source.visualAttributes.radius;
        let sinTarget = Math.sin(angle) * target.visualAttributes.radius;
        let cosTarget = Math.cos(angle) * target.visualAttributes.radius;
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
        edge.gfx.x = (source.x + cosSource) * transformK + transformX;
        edge.gfx.y = (source.y + sinSource) * transformK + transformY;
        edge.gfx.width = lineLength;
        edge.gfx.height = edge.visualAttributes.width * transformK;
        edge.gfx.rotation = angle;
    });
}
function Renderer({ container, nodes, edges, directed, selectionState, selectionDispatch }) {
    if (!startupFlag) {
        setupRendering();
        startupFlag = true;
    }
    /* Check if nodes need to be re-rendered. */
    const nodesShouldUpdate = checkRenderedNodes(nodes);
    const edgesShouldUpdate = checkRenderedEdges(edges);
    container.appendChild(app.view);
    app.stage.addChild(selectionRect);
    if (nodesShouldUpdate) {
        nodeDict = {};
        /* Update node gfx. */
        var timer = null;
        renderedNodes = nodes.map((node) => {
            const gfx = getNode();
            gfx.tint = PIXI.utils.rgb2hex(node.visualAttributes.fillColour);
            gfx.alpha = node.visualAttributes.alpha;
            gfx.interactive = true;
            gfx.zIndex = 100;
            const id = node.id;
            gfx.removeAllListeners();
            // callback?
            gfx.on(('pointerdown'), () => {
                if (selectionDispatch === null) {
                    return;
                }
                if (timer !== null) {
                    return;
                }
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                }
                timer = setTimeout(() => {
                    selectionDispatch({
                        'attribute': 'node',
                        'type': 'longClick',
                        'id': id
                    });
                }, 250);
            });
            gfx.on(('pointertap'), () => {
                if (selectionDispatch === null) {
                    return;
                }
                if (timer !== null) {
                    console.log('clearing timer');
                    clearTimeout(timer);
                    timer = null;
                }
                console.log('tap');
                selectionDispatch({
                    'attribute': 'node',
                    'type': 'shortClick',
                    'id': id
                });
            });
            gfx.on(('pointerup'), () => {
                if (selectionDispatch === null) {
                    return;
                }
                if (timer !== null) {
                    console.log('click up');
                    // selectionDispatch({
                    //     'attribute': 'node',
                    //     'type': 'shortClick',
                    //     'id': id
                    // })
                    clearTimeout(timer);
                    timer = null;
                }
            });
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
            gfx.x = node.x * transformK + transformX;
            gfx.y = node.y * transformK + transformY;
            gfx.scale.x = node.visualAttributes.radius * transformK;
            gfx.scale.y = node.visualAttributes.radius * transformK;
            nodeDict[node.id] = node;
            return {
                id: node.id,
                x: node.x,
                y: node.y,
                attributes: node.attributes,
                hash: node.hash,
                visualAttributes: node.visualAttributes,
                gfx: gfx
            };
        });
    }
    if (edgesShouldUpdate) {
        renderedEdges = edges.map((edge) => {
            const gfx = getEdge();
            const source = nodeDict[edge.source];
            const target = nodeDict[edge.target];
            // Calculate the angles to get the circle border location.
            let angle = Math.atan2(target.y - source.y, target.x - source.x);
            let sinSource = Math.sin(angle) * source.visualAttributes.radius;
            let cosSource = Math.cos(angle) * source.visualAttributes.radius;
            let sinTarget = Math.sin(angle) * target.visualAttributes.radius;
            let cosTarget = Math.cos(angle) * target.visualAttributes.radius;
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
            // Rounds to nearest integer larger than zero. Possibly unnecessary due to ROUND_PIXELS.
            // lineGraphic.lineStyle(Math.round(transform_k * 2) <= 0 ? 1 : Math.round(transform_k * 2), lineColour, alpha);
            // lineGraphic.setTransform(
            //     (source.x + cosSource) * transform_k,
            //     (target.x - cosTarget) * transform_k,
            // )
            gfx.alpha = edge.visualAttributes.alpha;
            gfx.tint = PIXI.utils.rgb2hex(edge.visualAttributes.fillColour);
            gfx.width = lineLength;
            gfx.height = edge.visualAttributes.width * transformK;
            gfx.x = (source.x + cosSource) * transformK + transformX;
            gfx.y = (source.y + sinSource) * transformK + transformY;
            gfx.rotation = angle;
            return Object.assign(Object.assign({}, edge), { sourceNode: source, targetNode: target, gfx: gfx });
        });
    }
    if (selectionDispatch) {
        renderBackground(app.stage, selectionDispatch, renderedNodes, selectionDispatch);
    }
    /* If there are still rendered nodes, only update the positions. */
    if (renderedNodes.length !== 0) {
        updateNodePositions(nodes);
        return {
            destroy: () => {
                window.removeEventListener('beforeunload', cleanMemory);
            }
        };
    }
    setTransformCallback(updateTransform);
    window.addEventListener('beforeunload', cleanMemory);
    return {
        destroy: () => {
            renderedNodes.forEach((node) => {
                nodeCache.push(node.gfx);
            });
            window.removeEventListener('beforeunload', cleanMemory);
        }
    };
}
exports.Renderer = Renderer;
