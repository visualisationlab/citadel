/**
 * @author Laurens Stuurman <l.w.a.stuurman@uva.nl>
 *
 * Uses react-force-graph to visualize the network
 */


import React, { useRef, useContext } from 'react';

// import { Renderer } from './renderer.component'
import { GraphDataContext } from './main.component'
import ForceGraph3D from 'react-force-graph-3d';
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

export default function ThreeDimGraph(){
    const { graphState } = useContext(GraphDataContext)
    let nodeColor = '#7a92d2'


    if (graphState === null) {
        return
    }
    console.log('GRAPH STATE IN TRHEEDIMGRAPH')
    console.log(graphState)

    let nodes = []
    graphState.nodes.data.forEach(basicNode =>{
        nodes.push({
            "id":basicNode.id,
            "name":basicNode["Business Role"],
            "val":basicNode["Criminal Capital"],
            "group":BUSINNESSROLE_TO_GROUP[basicNode["Business Role"]],
            x:basicNode.position.x == 0 || null ? null : basicNode.position.x,//basicNode.position.x,
            y:basicNode.position.y == 0 || null ? null: basicNode.position.y,
            z:basicNode.position.z == 0 || null ? null : basicNode.position.z,
            color: BUSINNESSROLE_TO_COLOR[basicNode["Business Role"]]

        })

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

    let reactForceData = {
        nodes:nodes,
        links:links
    }

    console.log(reactForceData)

    return <div className="render">
        <ForceGraph3D 
            graphData={reactForceData}
            nodeAutoColorBy="group"
            onNodeDragEnd={node => {
                node.fx = node.x;
                node.fy = node.y;
                node.fz = node.z;
              }}
        />
        </div> //
}