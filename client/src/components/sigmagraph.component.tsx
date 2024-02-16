/**
 * @author Laurens Stuurman <l.w.a.stuurman@uva.nl>
 *
 * Uses react-force-graph to visualize the network
 */

import React, { useRef, useContext,useEffect,useState } from 'react';
import { Container} from 'react-bootstrap'

import { GraphDataContext } from './main.component'
import { SigmaContainer, useLoadGraph, useSigma,useRegisterEvents,useSetSettings} from "@react-sigma/core";
import { useWorkerLayoutForce,useLayoutForce } from "@react-sigma/layout-force";
import { useWorkerLayoutForceAtlas2,useLayoutForceAtlas2 } from "@react-sigma/layout-forceatlas2";
import {random,floor} from "mathjs"

import "@react-sigma/core/lib/react-sigma.min.css";

import Graph from "graphology";
import { Attributes } from "graphology-types";


import {themeContext} from './darkmode.component';

export function LoadSigmaGraph(){
    const { graphState } = useContext(GraphDataContext)
    const loadGraph = useLoadGraph();
    const registerEvents = useRegisterEvents();
    const sigma = useSigma()
    const setSettings = useSetSettings();
    const { positions, assign } = useLayoutForceAtlas2();
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);

    console.log('renddering LoadSigmagraph')

    useEffect(() => {
        if (graphState == null){return}
        console.log('useeffect in loadsigma')
        console.log(graphState.nodes.data)
        const graph = new Graph();

        graphState.nodes.data.forEach(basicNode =>{
            console.log('adding node')
            graph.addNode(
                basicNode.id,
                {
                    label:basicNode["Business Role"],
                    size:basicNode["Criminal Capital"]*30,
                    x:floor(random(1500)),//basicNode.position.x,
                    y:floor(random(900))//basicNode.position.y
                }
            )
        })
     
        graphState.edges.data.forEach(basicEdge =>{
            graph.addEdge(
                basicEdge.source,
                basicEdge.target
            )
        })

        loadGraph(graph);
        assign()
        console.log(graph);
        console.log(positions())

        registerEvents({
            enterNode:(event) => setHoveredNode(event.node),
            leaveNode:() => setHoveredNode(null)
        })
        
    },[loadGraph,assign,graphState,positions,registerEvents]);

    useEffect(() => {
        setSettings({
            nodeReducer: (node, data) => {
              const graph = sigma.getGraph();
              const newData: Attributes = { ...data, highlighted: data.highlighted || false };
      
              if (hoveredNode) {
                if (node === hoveredNode || graph.neighbors(hoveredNode).includes(node)) {
                  newData.highlighted = true;
                } else {
                  newData.color = "#E2E2E2";    setSettings({
                        nodeReducer: (node, data) => {
                          const graph = sigma.getGraph();
                          const newData: Attributes = { ...data, highlighted: data.highlighted || false };
                  
                          if (hoveredNode) {
                            if (node === hoveredNode || graph.neighbors(hoveredNode).includes(node)) {
                              newData.highlighted = true;
                            } else {
                              newData.color = "#E2E2E2";
                              newData.highlighted = false;
                            }
                          }
                          return newData;
                        },
                        edgeReducer: (edge, data) => {
                          const graph = sigma.getGraph();
                          const newData = { ...data, hidden: false };
                  
                          if (hoveredNode && !graph.extremities(edge).includes(hoveredNode)) {
                            newData.hidden = true;
                          }
                          return newData;
                        },
                      });
                  newData.highlighted = false;
                }
              }
              return newData;
            },
            edgeReducer: (edge, data) => {
              const graph = sigma.getGraph();
              const newData = { ...data, hidden: false };
      
              if (hoveredNode && !graph.extremities(edge).includes(hoveredNode)) {
                newData.hidden = true;
              }
              return newData;
            },
          });
    }, [hoveredNode, setSettings, sigma])

    return null
}

export const DisplaySigmaGraph = () => {
    const { theme } = useContext(themeContext)

    let sigmacontainerClass = "container"
    if (theme=='dark'){
        sigmacontainerClass = "bg-dark container"
    }

    const Force = () => {
        const { start, kill, isRunning } = useWorkerLayoutForceAtlas2({settings: { slowDown: 10 } });
        useEffect(() => {
            console.log('starting force atlas')
            // start FA2
            start();
            return () => {
              // Kill FA2 on unmount
              kill();
            };
          }, [start, kill]);

          return null
    }
    // let widthpx = screen.width.toString() + 'px';
    // let heightpx = screen.height.toString() + 'px';
    return (
        <Container>
            <SigmaContainer style={{ height: '100vh'}} className={sigmacontainerClass}>
                <LoadSigmaGraph/>
                <Force />
            </SigmaContainer>
        </Container>

    );
}

export default DisplaySigmaGraph;


// import { useEffect } from "react";
// import Graph from "graphology";
// import { SigmaContainer, useLoadGraph } from "@react-sigma/core";
// import "@react-sigma/core/lib/react-sigma.min.css";

// export const LoadGraph = () => {
//   const loadGraph = useLoadGraph();

//   useEffect(() => {
//     const graph = new Graph();
//     graph.addNode("first", { x: 0, y: 0, size: 15, label: "My first node", color: "#FA4F40" });
//     loadGraph(graph);
//   }, [loadGraph]);

//   return null;
// };

// export const DisplaySigmaGraph = () => {
//   return (
//     <SigmaContainer style={{ height: "500px", width: "500px" }}>
//       <LoadGraph />
//     </SigmaContainer>
//   );
// };