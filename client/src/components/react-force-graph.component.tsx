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

export default function ThreeDimGraph(){
    const { graphState } = useContext(GraphDataContext)

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

    return <div className="render"><ForceGraph3D graphData={reactForceData}/></div> //
}