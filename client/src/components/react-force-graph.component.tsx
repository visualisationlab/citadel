/**
 * @author Laurens Stuurman <l.w.a.stuurman@uva.nl>
 *
 * Uses react-force-graph to visualize the network
 */


import React, { useRef, useContext } from 'react';

// import { Renderer } from './renderer.component'
import { GraphDataContext } from './main.component'
import ForceGraph3D from 'react-force-graph-3d';

import { SelectionDataContext, GlobalSettingsContext } from "./main.component"
// import { MappingContext } from './main.component'
// import { MappingType } from '../reducers/selectedmappings.reducer';
// import { BasicEdge, BasicNode } from './router.component';
import {themeContext} from './darkmode.component';

export default function ThreeDimGraph(){
    const { graphState } = useContext(GraphDataContext)

    let nodes = []
    graphState.nodes.data.forEach(basicNode =>{
        nodes.push({
            "id":basicNode.id,
            ""
        })

    })
    let links = []

    let reactForceData = {
        nodes:graphState.nodes,
        links:graphState.edges
    }

    const <ForceGraph3D graphData={reactForceData}/>
}