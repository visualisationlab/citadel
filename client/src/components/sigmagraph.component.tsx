/**
 * @author Laurens Stuurman <l.w.a.stuurman@uva.nl>
 *
 * Uses react-force-graph to visualize the network
 */


import React, { useRef, useContext,useEffect } from 'react';

// import { Renderer } from './renderer.component'
import { GraphDataContext } from './main.component'
import ForceSupervisor from "graphology-layout-force/worker";
import { SigmaContainer, useLoadGraph } from "@react-sigma/core";
import "@react-sigma/core/lib/react-sigma.min.css";

// import { SigmaContainer, ZoomControl, FullScreenControl } from "react-sigma-v2"
import Graph from "graphology";
import Sigma from "sigma";
// import ForceGraph3D from 'react-force-graph-3d';

// import { SelectionDataContext, GlobalSettingsContext } from "./main.component"
// import { MappingContext } from './main.component'
// import { MappingType } from '../reducers/selectedmappings.reducer';
// import { BasicEdge, BasicNode } from './router.component';
import {themeContext} from './darkmode.component';

export default function LoadSigmaGraph(){
    const { graphState } = useContext(GraphDataContext)
    const loadGraph = useLoadGraph();
    const containerRef = useRef(null)

    useEffect(() => {
        const graph = new Graph();

        graphState.nodes.data.forEach(basicNode =>{
            graph.addNode(
                basicNode.id,
                // {bas
            )
        })
     
        graphState.edges.data.forEach(basicEdge =>{
            graph.addEdge(
                basicEdge.source,
                basicEdge.target
            )
        })

        loadGraph(graph);
    },[loadGraph])

    return null
    // const layout = new ForceSupervisor(graph, { isNodeFixed: (_, attr) => attr['highlighted'] });
    // layout.start();

    // const renderer = new Sigma(graph, containerRef.current!);

}

export const DisplaySigmaGraph = () => {
    return (
      <SigmaContainer style={{ height: "500px", width: "500px" }}>
        <LoadSigmaGraph />
      </SigmaContainer>
    );
  };