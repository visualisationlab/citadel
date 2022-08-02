"use strict";
// /**
//  * Miles van der Lely (12206970), 2022.
//  *
//  * Exports functional component returning the graph visualization.
//  */
// import React, {useRef, useState} from 'react';
// import { ForceGraphPixi } from './pixi.component';
// import { Render } from './renderer.component'
// import * as d3 from 'd3';
// import { websocketService } from "../services/websocket.service";
// // import {GraphComponent} from '../types'
// /**
//  * Returns a container, which is updated by reference to contain the graph.
//  * @param param0 props
//  * @returns JSX
//  */
// export function ForceGraph({
//     graphState,
//     graphSettings,
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
//     setParentRendering,
//     selectionState,
//     colourDict} : GraphComponent.ForceGraphProps) {
//     const containerRef = useRef(null)
//     let [graphData, setGraphData] = useState<[GraphComponent.GraphNode[], GraphComponent.Link[]]>([[], []])
//     let [tickInterval, setTickInterval] = useState(1)
//     let [generating, setGenerating] = useState(false)
//     // Use effect for node positioning simulation.
//     React.useEffect(() => {
//         websocketService.setGraphUpdateFunction((nodes: GraphComponent.GraphNode[], edges: GraphComponent.Link[]) => setGraphData([[...nodes], [...localLinks]]))
//         const localNodes = [...graphState.nodes];
//         const localLinks = [...graphState.links];
//         const simulation = d3.forceSimulation(localNodes)
//             .force("link", d3.forceLink(localLinks)
//                 .id((d: any) => d.id)
//                 .distance(50)
//             )
//             .force("charge", d3.forceManyBody().strength(graphSettings.charge))
//             .force("x", d3.forceX(window.innerWidth / 2))
//             .force("y", d3.forceY(window.innerHeight / 2))
//             .force("collision", d3.forceCollide().radius((d) => 15));
//             if (graphSettings.radialForce > 0) {
//                 simulation.force("radial", d3.forceRadial(graphSettings.radialForce));
//             }
//         // simulation.alpha(1).restart();
//         setParentRendering(true);
//         let i = 0;
//         /**
//          * Updates remote state every tick, and sets the local graph information.
//          */
//         simulation.on("tick", function() {
//             setGenerating(true)
//             websocketService.updateGraphState(localNodes, graphState.selectedGraph);
//             // if ((localNodes.length > 9000 || localLinks.length > 9000) && tickInterval !== 12) {
//             //     setTickInterval(20);
//             // }
//             // if (localNodes.length < 9000 && localLinks.length < 9000 && tickInterval === 20) {
//             //     setTickInterval(1);
//             // }
//             //Updates node only every x ticks.
//             // if (i % tickInterval !== 0) {
//             //     i++;
//             //     return;
//             // }
//             setGraphData([[...localNodes], [...localLinks]])
//         })
//         /**
//          * Updates parent rendering state.
//          */
//         simulation.on("end", function(){
//             setParentRendering(false)
//             setGenerating(false)
//         })
//         return () => {
//             simulation.stop();
//         }
//     }, [graphState.nodes, graphState.links, graphState.selectedGraph,
//         graphSettings.charge, graphSettings.radialForce, setParentRendering, tickInterval])
//     /**
//      * Updates the tickinterval when graph settings change.
//      */
//     React.useEffect(() => {
//         setTickInterval(graphSettings.tickInterval);
//     }, [graphSettings.tickInterval])
//     /**
//      * Updates the container reference with graph visualization.
//      */
//     React.useEffect(() => {
//         console.log('Generating...')
//         const { destroy } = Render({
//             container: containerRef.current!,
//             nodes: graphData[0],
//             links: graphData[1],
//             graphSettings: graphSettings,
//             isDirected: graphState.graphType === GraphComponent.GraphType.Directed,
//             onClickHandler,
//             onClickBackground,
//             getFillColour,
//             getRadius,
//             getAlpha,
//             getLineWidth,
//             getLineAlpha,
//             getEdgeColour,
//             getLineColour,
//             rendering,
//             selectionState,
//             mappings: graphState.mappings,
//             colourDict,
//             generating})
//         return destroy
//     }, [onClickHandler,
//         onClickBackground,
//         getFillColour,
//         getRadius,
//         getAlpha,
//         getLineWidth,
//         getLineAlpha,
//         getEdgeColour,
//         getLineColour,
//         graphData,
//         graphState.graphType,
//         graphSettings,
//         rendering,
//         selectionState,
//         graphState.mappings,
//         colourDict]);
//     return <div><script src="http://d3js.org/d3.v3.min.js" charSet="utf-8"></script><div ref={containerRef} className="graph" /></div>;
// }
