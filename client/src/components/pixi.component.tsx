// /**
//  * Miles van der Lely, 2022.
//  *
//  * Implements a graph visualization renderer.
//  */

// import * as d3 from "d3";
// import * as PIXI from "pixi.js";
// import { websocketService } from "../services/websocket.service";
// import { VisGraph } from '../types'
// PIXI.settings.ROUND_PIXELS = true;
// PIXI.settings.GC_MAX_IDLE = 100000;
// PIXI.settings.PRECISION_FRAGMENT = PIXI.PRECISION.LOW;
// PIXI.settings.PRECISION_VERTEX = PIXI.PRECISION.LOW;
// PIXI.settings.PREFER_ENV = PIXI.ENV.WEBGL2

// const app = new PIXI.Application({
//     width:window.innerWidth,
//     height:window.innerHeight - 56,
//     resizeTo: window,
//     backgroundColor: 0x000000,
//     antialias: true
// })

// // Stack for sprites.
// let lineCache: PIXI.Sprite[] = []
// let lineStack: PIXI.Sprite[] = []

// const lineStartingCount = 30000

// const linesPerContainer = 1500

// let circleContainers: PIXI.Container[] = []
// let lineContainers: PIXI.ParticleContainer[] = []

// /**
//  * Generates circles and lines for use in rendering.
//  */
// function setupRendering() {
//     // Starting number of containers.
//     let lineContainerCount = Math.ceil(lineStartingCount / linesPerContainer)

//     for (let i = 0; i < lineContainerCount; i++) {
//         const container = new PIXI.ParticleContainer()

//         container.autoResize = true
//         container.setProperties({
//             rotation: true,
//             tint: true,
//             vertices: true
//         })

//         lineContainers.push(container)

//         app.stage.addChild(container)
//     }

//     // Generate a set of lines.
//     for (let i = 0; i < lineStartingCount; i++) {

//         const lineSprite = new PIXI.Sprite(PIXI.Texture.WHITE);

//         lineSprite.tint = 0x000000

//         lineSprite.alpha = 0

//         lineContainers[Math.floor(i / linesPerContainer)].addChild(lineSprite)
//         lineCache.push(lineSprite)
//     }
// }

// /**
//  * Gets a line from the stack.
//  * @returns Sprite or null
//  */
//  function getLineSprite(): PIXI.Sprite | null {
//     const x = lineCache.pop()

//     return (x === undefined) ? null : x
// }

// setupRendering()

// app.stage.sortableChildren = true;

// // Used to gauge whether lines need to re-render.
// let prevScale = 1.0;

// // Stored globally to update transform handler.
// let transform_x = 0;
// let transform_y = 0;
// let transform_k = 1.0;

// // For some reason, zooming breaks on mobile when continuously updating the Zoom
// // .transform handler. So this flag exists.
// let zooming = false;

// let tapping = true;

// let background : PIXI.Sprite;

// /**
//  * Transforms nodes and lines on zoom/pan.
//  * @param zoomUpdate () => void
//  * @param renderUpdate () => void
//  * @returns void
//  */
// function setTransformCallback(  zoomUpdate : () => void,
//                                 renderUpdate : () => void) : void {
//     if (zooming) {
//         return;
//     }

//     // Typescript doesn't like this part, but it works.
//     // BEWARE: HERE BE DRAGONS.
//     d3.select(".graph")
//     // @ts-ignore
    // .call(d3.zoom().scaleExtent([0.10, 3])
    //     .on("start", () => {
    //         zooming = true;
    //     })
    //     .on("zoom", function () {
    //         prevScale = transform_k;

    //         // @ts-ignore
    //         transform_x = d3.event.transform.x;
    //         // @ts-ignore
    //         transform_y = d3.event.transform.y;
    //         // @ts-ignore
    //         transform_k = d3.event.transform.k;
    //         // @ts-ignore
    //         websocketService.updateGraphTransform(d3.event.transform);
    //         zoomUpdate();
    //     }).on("end", () => {
    //         zooming = false;
    //         renderUpdate();
    // }))
// }

// /**
//  * Returns whether node is off screen.
//  * @param node GraphNode
//  * @returns boolean
//  */
// function nodeOffScreen(node : GraphComponent.GraphNode) {
//     return ((node.x * transform_k + transform_x < 0 || node.x * transform_k + transform_x > window.innerWidth
//         || node.y * transform_k + transform_y < 0 || node.y * transform_k + transform_y > window.innerHeight));
// }

// /**
//  * Compares old and new graph states.
//  * @param {Array} prevNodes
//  * @param {Array} newNodes
//  * @returns boolean
//  */
// function graphHasChanged(prevNodes: GraphComponent.PixiNode[], newNodes: GraphComponent.GraphNode[]) {
//     if (prevNodes.length !== newNodes.length) {
//         return true;
//     }

//     for (let i = 0; i < prevNodes.length; i++) {
//         if (prevNodes[i].id !== newNodes[i].id) {
//             return true;
//         }
//     }

//     return false;
// }

// /**
//  * Renders a circle at position 0,0.
//  *
//  * @param {PIXI.Container} stage
//  * @param {string} id
//  * @param {int} radius
//  * @param {int} lineWidth
//  * @param {float} alpha
//  * @param {*} fillColour
//  * @param {function id} onClick
//  * @returns PIXI.Graphics();
//  */
// function renderCircle(
//     stage : PIXI.Container,
//     id : string,
//     radius : number,
//     lineWidth : number,
//     alpha : number,
//     fillColour : number,
//     onClick : (id: string, selectionState: VisGraph.SelectionState) => void,
//     edgeColour : number,
//     selectionState : VisGraph.SelectionState) {

//     const gfx = new PIXI.Graphics()

//     gfx.beginFill(fillColour, alpha);
//     gfx.lineStyle(lineWidth, edgeColour);
//     gfx.drawCircle(0, 0, Math.round(radius));

//     gfx.endFill();

//     gfx.zIndex = 10;

//     gfx.interactive = true;
//     gfx.buttonMode = true;

//     // Hit area is larger than node for touch screen compatibility.
//     gfx.hitArea = new PIXI.Circle(0, 0, Math.round(radius) * 2.5);
//     gfx.on('pointerdown', () => onClick(id, selectionState))

//     stage.addChild(gfx);

//     circleContainers[0].addChild(gfx)

//     return gfx;
// }

// /**
//  * Renders all links in array, up to max links count.
//  * @param {PIXI.Graphics} lineContainers
//  * @param {Array} links
//  * @param {int} maxLinks
//  */
// function renderLines(links : GraphComponent.Link[],
//     maxLinks : number,
//     getRadius : GraphComponent.attributeCallback,
//     getLineAlpha : GraphComponent.linkCallback,
//     getLineColour: GraphComponent.linkCallback,
//     rendering : boolean,
//     isDirected : boolean,
//     renderEdges : boolean,
//     selectionState : GraphComponent.SelectionState,
//     graphSettings: GraphComponent.GraphSettings) {
//     // destroyLines();
//     while (lineStack.length > 0) {
//         const line = lineStack.pop()

//         if (line === undefined) {

//             return
//         }

//         line.visible = false

//         lineCache.push(line)
//     }

//     links.forEach((link, index) => {
//         // if (nodeOffScreen(link.source) && nodeOffScreen(link.target)) {
//         //     return;
//         // }

//         renderLine(index,
//             link.source,
//             link.target,
//             Math.min(getLineAlpha(link, curState), curSettings.lineOpacity),
//             getLineColour(link, curState), getRadius, isDirected);
//     })
// }

// /**
//  * Updates line positions when scrolling.
//  */
// function transformLines() {
//     lineContainers.forEach((container) => {
//         container.x = transform_x
//         container.y = transform_y
//     })
// }

// /**
//  * Renders a line on screen from source to target.
//  * @param {node} source
//  * @param {node} target
//  * @param {float} alpha
//  * @param {int} lineColour
//  */
// function renderLine(
//     index : number,
//     source : GraphComponent.GraphNode,
//     target : GraphComponent.GraphNode,
//     alpha : number,
//     lineColour : number,
//     getRadius : GraphComponent.attributeCallback,
//     isDirected : boolean) {

//     // Calculate the angles to get the circle border location.
//     let angle = Math.atan2(target.y - source.y, target.x - source.x);

//     let sinSource = Math.sin(angle) * getRadius(source.id);
//     let cosSource = Math.cos(angle) * getRadius(source.id);

//     let sinTarget = Math.sin(angle) * getRadius(target.id);
//     let cosTarget = Math.cos(angle) * getRadius(target.id);

//     let sourceX = (source.x + cosSource) * transform_k;
//     let sourceY = (source.y + sinSource) * transform_k;

//     let targetX = (target.x - cosTarget) * transform_k;
//     let targetY = (target.y - sinTarget) * transform_k;

//     let dx = targetX - sourceX;
//     let dy = targetY - sourceY;

//     let lineLength = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

//     let nx = dx / lineLength;
//     let ny = dy / lineLength;

//     let lineGraphic = getLineSprite()

//     if (lineGraphic === null) {

//         return
//     }

//     let wingLength = 5 * transform_k;

//     // Rounds to nearest integer larger than zero. Possibly unnecessary due to ROUND_PIXELS.
//     // lineGraphic.lineStyle(Math.round(transform_k * 2) <= 0 ? 1 : Math.round(transform_k * 2), lineColour, alpha);

//     // lineGraphic.setTransform(
//     //     (source.x + cosSource) * transform_k,
//     //     (target.x - cosTarget) * transform_k,
//     // )

//     lineGraphic.visible = true
//     lineGraphic.alpha = 1
//     lineGraphic.width = lineLength
//     lineGraphic.height = 2
//     lineGraphic.x = (source.x + cosSource) * transform_k
//     lineGraphic.y = (source.y + sinSource) * transform_k
//     lineGraphic.rotation = angle

//     lineStack.push(lineGraphic)

//     // Draw arrow wings.
//     // if (isDirected) {
//     //     lineGraphic.moveTo(Math.round(targetX), Math.round(targetY));

//     //     lineGraphic.lineTo(targetX - nx*wingLength - (-ny) * wingLength, targetY - ny*wingLength - nx * wingLength)

//     //     lineGraphic.moveTo(Math.round(targetX), Math.round(targetY));

//     //     lineGraphic.lineTo(targetX - nx*wingLength + (-ny) * wingLength, targetY - ny*wingLength + nx * wingLength)
//     // }

//     // Distribute across containers.
//     // const containerIndex = Math.floor(index / MAX_LINES_PER_CONTAINER);

//     // Keep generating containers until need is met.
//     // while (containerIndex >= lineContainers.length) {
//     //     let newContainer = new PIXI.Container();
//     //     newContainer.interactive = false;

//     //     lineContainers.push(newContainer);

//     //     app.stage.addChild(newContainer);
//     // }

//     // lineContainers[containerIndex].addChild(lineGraphic);
// }

// /**
//  * Updates node position with x y.
//  * @param {PIXI.Graphics} gfx
//  * @param {float} x
//  * @param {float} y
//  */
// function updateNodePosition(gfx : PIXI.Graphics, x : number, y : number) {
//     gfx.position.x = x * transform_k + transform_x;
//     gfx.position.y = y * transform_k + transform_y;
//     gfx.scale.x = transform_k;
//     gfx.scale.y = transform_k;
// }

// let prevNodes : GraphComponent.PixiNode[] = [];

// /**
//  * When a change occurs, the new attributes are checked and compared.
//  * If the attributes change, the node is updated.
//  * Position isn't stored. Instead, the graphics object is created, moved,
//  * or destroyed.
//  * @param prevNodes
//  * @param nodes
//  * @param selectionState
//  * @returns updated nodes
//  */
// function updateNodeHistory( prevNodes : GraphComponent.PixiNode[],
//                             nodes : GraphComponent.GraphNode[],
//                             selectionState: GraphComponent.SelectionState) : [GraphComponent.PixiNode[], boolean] {

//     let updatedNodes : GraphComponent.PixiNode[] = [];

//     if (graphHasChanged(prevNodes, nodes)) {

//         // for (var i = app.stage.children.length - 1; i >= 0; i--) {
//         //     app.stage.removeChild(app.stage.children[i])
//         // }

//         // Set clean state for nodes.
//         nodes.forEach((node) => {
//             updatedNodes.push({
//                 x: node.x,
//                 y: node.y,
//                 id: node.id,
//                 attributes: node.attributes,
//                 gfx: null,
//                 fillColour: 0,
//                 edgeColour: 0,
//                 alpha: 1,
//                 radius: 0,
//                 lineWidth: 0,
//                 selectionState: selectionState
//             })
//         });

//         return [updatedNodes, true];
//     }

//     let positionsChanged = true;

//     // Just update the positions.
//     for (let i = 0; i < prevNodes.length; i++) {
//         prevNodes[i].x = nodes[i].x;
//         prevNodes[i].y = nodes[i].y;
//     }

//     return [prevNodes, positionsChanged];
// }

// let prevState: GraphComponent.NodeID[] = []

// // AWFUL CODE
// let curState: GraphComponent.SelectionState
// let curSettings: GraphComponent.GraphSettings

// /**
//  * Returns true if state is the same, false if it's changed.
//  * @param state NodeID array
//  * @param prevState NodeID array
//  * @returns
//  */
// function compareSelectedNodes(state: GraphComponent.NodeID[]) {
//     if (state.length !== prevState.length) {
//         prevState = [...state];

//         return false;
//     }

//     for (let i = 0; i < state.length; i++) {
//         if (state[i] !== prevState[i]) {
//             prevState = [...state];

//             return false;
//         }
//     }

//     return true;
// }

// /**
//  * I would perform a deep compare here, but that would count the gfx...
//  * @param node
//  * @param fillColour
//  * @param alpha
//  * @param radius
//  * @param lineWidth
//  * @param edgeColour
//  * @param selectionState
//  * @returns
//  */
// function nodeShouldUpdate(node : GraphComponent.PixiNode,
//     fillColour : number,
//     alpha : number,
//     radius : number,
//     lineWidth : number,
//     edgeColour : number,
//     selectionState : GraphComponent.SelectionState) {
//     return (node.gfx === null || fillColour !== node.fillColour
//         || alpha !== node.alpha || radius !== node.radius ||
//         lineWidth !== node.lineWidth || edgeColour !== node.edgeColour)
//         // !deepEqual(selectionState, node.selectionState));
// }

// /**
//  * Renders nodes in node array.
//  * @param stage
//  * @param nodes
//  * @param getFillColour
//  * @param onClick
//  * @param getAlpha
//  * @param getRadius
//  * @param getLineWidth
//  * @param transform
//  * @param getEdgeColour
//  * @param selectionState
//  */
// function renderNodes(   stage : PIXI.Container,
//                         nodes : GraphComponent.PixiNode[],
//                         getFillColour : GraphComponent.fillColourCallback,
//                         onClick : (id: string, selectionState : GraphComponent.SelectionState) => void,
//                         getAlpha : GraphComponent.attributeCallback,
//                         getRadius : GraphComponent.attributeCallback,
//                         getLineWidth : GraphComponent.attributeCallback,
//                         transform : boolean,
//                         getEdgeColour : GraphComponent.attributeCallback,
//                         selectionState : GraphComponent.SelectionState,
//                         markers: GraphComponent.MarkerDict,
//                         colourDict : GraphComponent.ColourDict,
//                         ) {

//     let radiusHasChanged = false;

//     nodes.forEach((node) => {
//         // If node is off screen, don't draw it.
//         if (nodeOffScreen(node)) {
//             if (node.gfx === null) return;

//             node.gfx.destroy();
//             node.gfx = null;

//             return;
//         }

//         // If the node already exists, just update the position.
//         if (transform && !nodeOffScreen(node) && node.gfx !== null) {
//             updateNodePosition(node.gfx, node.x, node.y);

//             return;
//         }

//         const fillColour = getFillColour(node.id, markers[GraphComponent.Marker.FillColour], colourDict[GraphComponent.Marker.FillColour]);
//         const alpha = getAlpha(node.id);
//         const radius = getRadius(node.id);
//         const lineWidth = getLineWidth(node.id);
//         const edgeColour = getEdgeColour(node.id);

//         if (radius !== node.radius) {
//             radiusHasChanged = true;
//         }

//         if (nodeShouldUpdate(node, fillColour, alpha, radius, lineWidth, edgeColour,
//             selectionState)) {

//             if (node.gfx !== null) {
//                 node.gfx.destroy();
//             }

//             node.fillColour = fillColour;
//             node.alpha = alpha;
//             node.radius = radius;
//             node.lineWidth = lineWidth;
//             node.edgeColour = edgeColour;
//             node.selectionState = selectionState;
//             node.gfx = null
//             node.gfx = renderCircle(stage, node.id, radius, lineWidth, alpha,
//                 fillColour, onClick, edgeColour, selectionState);
//         }

//         if (node.gfx === null) {
//             return;
//         }

//         updateNodePosition(node.gfx, node.x, node.y);
//     });

//     return radiusHasChanged;
// }

// /**
//  * Generates a clickable background.
//  * @param {Container} stage
//  * @param {function} onClickBackground
//  */
// function renderBackground(stage : PIXI.Container,
//     onClickBackground : () => void) {
//     const background = new PIXI.Sprite(PIXI.Texture.WHITE);

//     background.width = window.innerWidth;
//     background.height = window.innerHeight - 56;
//     background.interactive = true;

//     background.on('pointerdown', function() {
//         tapping = true;
//     });

//     background.on('pointermove', function() {
//         tapping = false;
//     });

//     background.on('pointertap', function() {
//         if (tapping)
//             onClickBackground();
//     });

//     background.zIndex = -100;

//     stage.addChild(background);

//     return background;
// }

// let prevGenerating = false
// let flag = false

// /**
//  * Callback for useEffect.
//  *
//  * @param param0 props
//  * @returns Destroy function
//  */
// export function ForceGraphPixi ({
//     container,
//     nodes,
//     links,
//     graphSettings,
//     isDirected,
//     onClickHandler,
//     onClickBackground,
//     getFillColour,
//     getRadius,
//     getAlpha,
//     getLineWidth,
//     getLineAlpha,
//     getEdgeColour,
//     getLineColour,
//     rendering,
//     selectionState,
//     mappings,
//     colourDict,
//     generating
//     } : GraphComponent.PixiProps)
//     {

//     // if (prevGenerating && !generating) {
//     //     if (fpsLog.length > 0) {
//     //         console.log(fpsLog.reduce((x, y) => x + y) / fpsLog.length, 0)
//     //     }

//     //     fpsLog = []
//     // }

//     prevGenerating = generating

//     curState = selectionState
//     curSettings = graphSettings

//     // Add the app to the container.
//     container.appendChild(app.view)

//     const selectionHasChanged = !compareSelectedNodes([selectionState.selectedNodeID, ...selectionState.highlightedNodeIDs]);

//     // Update the nodes with existing GFX.
//     const [updatedNodes, positionsHaveChanged] = updateNodeHistory(prevNodes, nodes, selectionState);

//     // Render the new nodes.
//     const radiusHasChanged = renderNodes(app.stage, updatedNodes, getFillColour, onClickHandler,
//         getAlpha, getRadius, getLineWidth, false, getEdgeColour, selectionState, mappings, colourDict);

//     // Render the clickable background.
//     background = renderBackground(app.stage, onClickBackground)

//     const updateTransform = function() {
//         renderNodes(app.stage, updatedNodes, getFillColour, onClickHandler,
//             getAlpha, getRadius, getLineWidth, true, getEdgeColour, selectionState, mappings, colourDict);

//         // Line caching.
//         if (prevScale !== transform_k || graphSettings.smoothScroll) {
//             renderLines(links, graphSettings.maxLinesDrawn, getRadius,
//                 getLineAlpha, getLineColour, rendering, isDirected, graphSettings.renderEdges, selectionState, graphSettings);
//         }

//         transformLines()
//     }

//     const scrollTransform = function() {
//         if (!graphSettings.smoothScroll) {
//             renderLines(links, graphSettings.maxLinesDrawn, getRadius, getLineAlpha, getLineColour, rendering,
//                 isDirected, graphSettings.renderEdges, selectionState, graphSettings)

//             transformLines()
//         }
//     }

//     setTransformCallback(updateTransform, scrollTransform);

//     // if (positionsHaveChanged || radiusHasChanged || selectionHasChanged) {
//         // Re-render the lines.
//     renderLines(links, graphSettings.maxLinesDrawn, getRadius, getLineAlpha, getLineColour, rendering, isDirected,
//         graphSettings.renderEdges, selectionState, graphSettings);
//     // }

//     transformLines()

//     return {
//         destroy: () => {
//             prevNodes = updatedNodes;

//             for (var i = circleContainers.length - 1; i >= 0; i--) {
//                 circleContainers[i].removeChildren()
//             }

//             // for (var i = 0; i < cons.length; i++) {
//             //     cons[i].removeChildren()

//             //     cons[i].destroy()
//             // }

//             // cons = []
//             while (lineStack.length > 0) {
//                 const line = lineStack.pop()

//                 if (line === undefined) {

//                     return
//                 }

//                 line.alpha = 0

//                 lineCache.push(line)
//             }


//             if (background) {
//                 background.destroy()
//             }
//         }
//     }
// }

