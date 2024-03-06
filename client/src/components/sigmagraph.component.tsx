/**
 * @author Laurens Stuurman <l.w.a.stuurman@uva.nl>
 *
 * Uses react-force-graph to visualize the network
 */

import React, { useRef, useContext,useEffect,useState } from 'react';
import { Container, Row,Col} from 'react-bootstrap'

import { GraphDataContext } from './main.component'
import { SigmaContainer, useLoadGraph, useSigma,useRegisterEvents,useSetSettings,ControlsContainer} from "@react-sigma/core";
// import { useWorkerLayoutForce,useLayoutForce } from "@react-sigma/layout-force";
import { useWorkerLayoutForceAtlas2,useLayoutForceAtlas2,LayoutForceAtlas2Control} from "@react-sigma/layout-forceatlas2";
import { random, floor } from "mathjs";

import "@react-sigma/core/lib/react-sigma.min.css";

import Graph from "graphology";
import { Attributes } from "graphology-types";


import {themeContext} from './darkmode.component';


const BUSINNESSROLE_TO_COLOR = {
  // 'Dealer':"#b1d295",
  // 'Organizer': "#95CFD2",
  // 'Financer': "#B695D2",
  // 'Assasin': '#8995C1'
}


export function LoadSigmaGraph(){
    const { graphState } = useContext(GraphDataContext)
    const loadGraph = useLoadGraph();
    const registerEvents = useRegisterEvents();
    const sigma = useSigma()
    const setSettings = useSetSettings();
    const { positions, assign } = useLayoutForceAtlas2();
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const [draggedNode, setDraggedNode] = useState<string | null>(null);
    const { theme } = useContext(themeContext)

    let fontColor = '#000'
    let nodeColor = '#7a92d2'
    let edgeColor = '#ccc'//#ccc

    if (theme == "dark"){
      fontColor = "#cccccc"//"#ffffff"
      edgeColor = '#595959'
      nodeColor = '#536491'
    }


    console.log('rendering LoadSigmagraph')

    // setSettings({defaultLabelColor: '#fff'});sigma.instances(0).settings({defaultLabelColor: '#fff'});

    // Load graph from server to sigma : 
    useEffect(() => {
        if (graphState == null){return}
        console.log('useeffect in loadsigma')
        console.log(graphState.nodes.data)
        const graph = new Graph();

        graphState.nodes.data.forEach(basicNode =>{
          // console.log(basicNode["Criminal Capital"]+ basicNode["Financial Capital"])
            // if (basicNode["Criminal Capital"]+ basicNode["Financial Capital"] > 1.5){
            //   nodeColor = '#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
            //   console.log('node color : ',nodeColor);
            // }
            // console.log('adding node')
            graph.addNode(
                basicNode.id,
                {
                    label:basicNode["Business Role"],
                    size:basicNode["Criminal Capital"]*20 + basicNode["Financial Capital"] *20,
                    x:floor(random(1500)),//basicNode.position.x,
                    y:floor(random(900)),//basicNode.position.y
                    color: nodeColor //BUSINNESSROLE_TO_COLOR[basicNode["Business Role"]] ||
                }
            )
        })
     
        graphState.edges.data.forEach(basicEdge =>{
            graph.addEdge(
                basicEdge.source,
                basicEdge.target,
            )
        })

        loadGraph(graph);
        assign()
        // console.log(graph);
        // console.log(positions())

        registerEvents({
            enterNode:(event) => setHoveredNode(event.node),
            leaveNode:() => setHoveredNode(null)
        })
        
    },[loadGraph,assign,graphState,positions,registerEvents]);

    // Drag n drop

    // useEffect(() => {
    //   // Register the events
    //   registerEvents({
    //     downNode: (e) => {
    //       setDraggedNode(e.node);
    //       sigma.getGraph().setNodeAttribute(e.node, "highlighted", true);
    //     },
    //     mouseup: (e) => {
    //       if (draggedNode) {
    //         setDraggedNode(null);
    //         sigma.getGraph().removeNodeAttribute(draggedNode, "highlighted");
    //       }
    //     },
    //     mousedown: (e) => {
    //       // Disable the autoscale at the first down interaction
    //       if (!sigma.getCustomBBox()) sigma.setCustomBBox(sigma.getBBox());
    //     },
    //     mousemove: (e) => {
    //       if (draggedNode) {
    //         // Get new position of node
    //         const pos = sigma.viewportToGraph(e);
    //         sigma.getGraph().setNodeAttribute(draggedNode, "x", pos.x);
    //         sigma.getGraph().setNodeAttribute(draggedNode, "y", pos.y);

    //         // Prevent sigma to move camera:
    //         e.preventSigmaDefault();
    //         e.original.preventDefault();
    //         e.original.stopPropagation();
    //       }
    //     },
    //     touchup: (e) => {
    //       if (draggedNode) {
    //         setDraggedNode(null);
    //         sigma.getGraph().removeNodeAttribute(draggedNode, "highlighted");
    //       }
    //     },
    //     touchdown: (e) => {
    //       // Disable the autoscale at the first down interaction
    //       if (!sigma.getCustomBBox()) sigma.setCustomBBox(sigma.getBBox());
    //     },
    //     touchmove: (e) => {
    //       if (draggedNode) {
    //         // Get new position of node
    //         const pos = sigma.viewportToGraph(e);
    //         sigma.getGraph().setNodeAttribute(draggedNode, "x", pos.x);
    //         sigma.getGraph().setNodeAttribute(draggedNode, "y", pos.y);

    //         // Prevent sigma to move camera:
    //         e.preventSigmaDefault();
    //         e.original.preventDefault();
    //         e.original.stopPropagation();
    //       }
    //     },
    //   });
    // }, [registerEvents, sigma, draggedNode]);

    // Highlight node on hover : 
    useEffect(() => {
        setSettings({
            nodeReducer: (node, data) => {
              const graph = sigma.getGraph();
              const newData: Attributes = { ...data, ['highlighted']: data['highlighted'] || false };
      
              if (hoveredNode) {
                if (node === hoveredNode || graph.neighbors(hoveredNode).includes(node)) {
                  newData['highlighted'] = true;
                } else {
                    newData['color'] = "#E2E2E2";
                    setSettings({
                        nodeReducer: (node, data) => {
                          const graph = sigma.getGraph();
                          const newData: Attributes = { ...data, ['highlighted']: data['highlighted'] || false };
                  
                          if (hoveredNode) {
                            if (node === hoveredNode || graph.neighbors(hoveredNode).includes(node)) {
                              newData['highlighted'] = true;
                            } else {
                              newData['color'] = "#E2E2E2";
                              newData['highlighted'] = false;
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
                  newData['highlighted'] = false;
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
            labelColor: { color: fontColor},
            defaultEdgeColor: edgeColor,
        });
    }, [hoveredNode, setSettings, sigma,fontColor])

    return null
}

export const DisplaySigmaGraph = () => {
    const { theme } = useContext(themeContext)

    let sigmacontainerClass = ""
    if (theme=='dark'){
        sigmacontainerClass = "bg-dark"
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
    // let heightpx = screen.height.toString() + 'px';/,width:'100vw'
    return (
      // <Container fluid className='ms-0 me-0'>
        <SigmaContainer  style={{ height: '100vh'}} className={sigmacontainerClass}>
          <LoadSigmaGraph/>
          <Force />
          {/* <ControlsContainer position={"bottom-right"}>
            <LayoutForceAtlas2Control settings={{ settings: { slowDown: 10 } }} />
          </ControlsContainer> */}
        </SigmaContainer>
      // </Container>

        // <Container style={{marginRight:"0px"}}>
          // <Row>
          //   <Col style={{display:'flex', justifyContent:'right'}}>

          //   </Col>
          // </Row>
        // </Container>

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