/**
 * @author Laurens Stuurman <l.w.a.stuurman@uva.nl>
 *
 * Uses react-force-graph to visualize the network
 */


import React, { useRef, useContext,useEffect,useState } from 'react';

// import { Renderer } from './renderer.component'
import { GraphDataContext } from './main.component'
import { API } from '../services/api.service'
import { GraphDataReducerAction, GraphDataState, GraphDataReducer } from '../reducers/graphdata.reducer'
import {  UserDataContext,SimStepContext } from '../components/main.component'


import ForceGraph3D from 'react-force-graph-3d';
import {ForceGraphMethods} from 'react-force-graph-3d';
import ForceGraph2D from 'react-force-graph-2d';

import { SelectionDataContext, GlobalSettingsContext } from "./main.component"
// import { MappingContext } from './main.component'
// import { MappingType } from '../reducers/selectedmappings.reducer';
// import { BasicEdge, BasicNode } from './router.component';
import {themeContext} from './darkmode.component';
// import {random,floor} from "mathjs"

const BUSINNESSROLE_TO_GROUP = {
    'Assassin':0,
    'Cutter':1,
    'Dealer':2,
    'Driver':3,
    'Frontman':4,
    'Kingpin':5,
    'Organizer':6,
    'Placer Inland':7,
    'Retriever':8,
    'Security guard':9,
    'Stasher':10,
    'Transporter':11
}

const BUSINNESSROLE_TO_COLOR = {
    'Kingpin': "#bf3051"
    // 'Dealer':"#b1d295",
    // 'Organizer': "#95CFD2",
    // 'Financer': "#B695D2",
    // 'Assasin': '#8995C1'
  }

//   interface MyComponentProps { bar: string; }
//   {setSimSetupVisible} : {setSimSetupVisible:React.Dispatch<React.SetStateAction<boolean>>}

export default function ThreeDimGraph(
    {updateGraphState} : {updateGraphState:boolean}){
    const { graphState,graphDispatch } = useContext(GraphDataContext)
    const [reactForceData, setGraphData] = useState({ nodes: [], links: [] });
    const { state,  } = useContext(UserDataContext)
    const {stepSetting} = useContext(SimStepContext)

    // let updatePositionsOnForceEngine = false

    const fgRef = useRef();
    // let nodeColor = '#7a92d2'

    // console.log('GRAPH STATE IN TRHEEDIMGRAPH')
    // console.log(graphState)

    if (graphState === null) {
        return
    }


    useEffect(() => {

        const fg = fgRef.current;

        if (fg==undefined){
            console.log('fg undefined')
            return
        }


        // Deactivate existing forces
        // fg.d3Force('center', null);
        // fg.d3Force('charge', null);
        // fg.pauseAnimation()

        // console.log('first useffect')

        let nodes = []
        // console.log('graph position of first node on render : ',graphState.nodes.data[0])
        // console.log(graphState === undefined)
        // console.log(graphState === null)
        // console.log(graphState)
        graphState.nodes.data.forEach(basicNode =>{
            console.log(basicNode.position)
            nodes.push({
                id:basicNode.id,
                "name":basicNode["Business Role"],
                "val":basicNode["Criminal Capital"],
                "group":BUSINNESSROLE_TO_GROUP[basicNode["Business Role"]],
                "x":basicNode.position.x ,//basicNode.position.x == 0 || null ? null : * 500
                "y":basicNode.position.y ,//basicNode.position.y == 0 || null ? null: * 500
                "z":basicNode.position.z ,//basicNode.position.z == 0 || null ? null : * 500
                // "fx":basicNode.position.x * 500,//basicNode.position.x == 0 || null ? null : 
                // "fy":basicNode.position.y * 500,//basicNode.position.y == 0 || null ? null : 
                // "fz":basicNode.position.z * 500,//basicNode.position.z == 0 || null ? null : 
                color: BUSINNESSROLE_TO_COLOR[basicNode["Business Role"]]
    
            })
            // console.log('added node')
    
        })
        let links = []
    
        graphState.edges.data.forEach(basicEdge =>{
            links.push(
                {
                    "source":basicEdge.source,
                    "target":basicEdge.target
                }
            )
        })

        setGraphData({ nodes, links});
        // updatePositionsOnForceEngine = true


    },[graphState])


    // useEffect(() => {
    //     updatePositionsOnForceEngine = true
        
    // },[])

    // console.log(reactForceData)

    //ForceGraphMethods.pauseAnimation()

    return <div className="render">
        <ForceGraph3D 
            ref={fgRef}
            graphData={reactForceData}
            d3AlphaDecay={.03}
            d3AlphaMin={.002}
            nodeAutoColorBy="group"
            onNodeDrag={()=>{
                if (fgRef != undefined){
                    fgRef.current.d3ReheatSimulation()
                }
                }
            }
            onNodeDragEnd={node => {
                node.fx = node.x;
                node.fy = node.y;
                node.fz = node.z;
              }}
            nodeRelSize={8}
            onEngineTick={() => {
                if (reactForceData.nodes[0] == undefined){
                    return
                }
                console.log(reactForceData.nodes[0].id,reactForceData.nodes[0].x,reactForceData.nodes[0].y,reactForceData.nodes[0].z)
                }
            }
            onEngineStop={() => {
                let {nodes,} = reactForceData
                let newState = RFDataToGraphstate(nodes,graphState)

                // graphDispatch('set')let newGraphstate = 
                // Update graphstate in api: 
                console.log('Simulation step in client SessionState : ',state.simState.currentStep)
                console.log('Simulation step in client stepSetting : ',stepSetting)
                API.sendGraphPositions(newState,state.simState.currentStep) 
                console.log(newState.nodes.data)
                console.log('UPDATED GRAPH STATE WITH COMPUTED COORDINATES')

                // console.log(reactForceData)


                // console.log("ENGINE STOP")
                // if (updateGraphState){
                //     const action: GraphDataReducerAction = {
                //         type: "set",
                //         property: "data",
                //         value: {
                //           nodes: graphState.nodes.data.map((node,idx) => {
                //             // console.log(reactForceData[0])
                //             // console.log(idx)
                //             return {
                //             ...node,
                //             position:{
                //                 x:reactForceData.nodes[idx].x,
                //                 y:reactForceData.nodes[idx].y,
                //                 z:reactForceData.nodes[idx].z
                //             }
                //             // position:graphState.nodes.data.map(node => (node.position)
                //             // position: { x: 0, y: 0 },
                //           }}),
                //           edges: graphState.edges.data,
                //           globals: graphState.globals
                //         },
                //       };


                //     graphDispatch(action);
                //     // updatePositionsOnForceEngine = true

                //     console.log('UPDATED GRAPH STATE WITH COMPUTED COORDINATES')
                // }


            }}
        />
        </div> //
}

function RFDataToGraphstate(nodes: any[],graphState:GraphDataState) {
    // Update positions after force algorith 
    nodes.forEach((node:any) => {
        let graphIndex = graphState.nodes.data.findIndex((n) => n.id == node.id);
        graphState.nodes.data[graphIndex]['position'] = {x:node['x'], y:node['y'],z:node['z']}
    })

    return graphState
}

// const ThreeDimGraph = React.memo(ThreeDimGraphcomp)

// export default ThreeDimGraph

// const { useState, useEffect, useRef } = React;

// const CollisionDetectionFG = () => {
//   const fgRef = useRef();

//   const [graphData, setGraphData] = useState({ nodes: [], links: [] });

//   useEffect(() => {
//     const fg = fgRef.current;

//     // Deactivate existing forces
//     fg.d3Force('center', null);
//     fg.d3Force('charge', null);

//     // Add collision and bounding box forces
//     fg.d3Force('collide', d3.forceCollide(4));
//     fg.d3Force('box', () => {
//       const SQUARE_HALF_SIDE = N * 2;

//       nodes.forEach(node => {
//         const x = node.x || 0, y = node.y || 0;

//         // bounce on box walls
//         if (Math.abs(x) > SQUARE_HALF_SIDE) { node.vx *= -1; }
//         if (Math.abs(y) > SQUARE_HALF_SIDE) { node.vy *= -1; }
//       });
//     });

//     // Generate nodes
//     const N = 80;
//     const nodes = [...Array(N).keys()].map(() => ({
//       // Initial velocity in random direction
//       vx: (Math.random() * 2) - 1,
//       vy: (Math.random() * 2) - 1
//     }));

//     setGraphData({ nodes, links: [] });
//   }, []);

//   return <ForceGraph2D
//     ref={fgRef}
//     graphData={graphData}
//     cooldownTime={Infinity}
//     d3AlphaDecay={0}
//     d3VelocityDecay={0}
//   />;
// };

// ReactDOM.render(
//   <CollisionDetectionFG />,
//   document.getElementById('graph')
// );