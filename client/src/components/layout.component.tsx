/**
 * Miles van der Lely (12206970), 2022.
 *
 * Exports functional component returning the graph visualization.
 */

import React, { useRef, useContext, useState } from 'react';

import { Renderer } from './renderer.component'

import { VisGraph } from '../types'

import { GraphDataContext } from '../components/main.component'
import { SelectionDataContext } from "./main.component"
import { API } from '../services/api.service'
import { Mappings } from '../mappings/module.mappings';
import Hash from 'object-hash'

/**
 * Returns a container, which is updated by reference to contain the graph.
 * @param param0 props
 * @returns JSX
 */
export default function Layout() {
    const { graphState } = useContext(GraphDataContext)
    const { selectionState, selectionDispatch } = useContext(SelectionDataContext)

    let [animatedNodes, setAnimatedNodes] = useState<VisGraph.GraphNode[]>([])
    const containerRef = useRef(null)

    /**
     * Updates the container reference with graph visualization.
     */
    React.useEffect(() => {
        if (graphState === null) {
            return
        }

        if (graphState.nodes.data.length !== animatedNodes.length) {
            setAnimatedNodes(graphState.nodes.data)

            return
        }

        let newNodes = [...animatedNodes]

        let animate = false

        const PARAM = 1
        const CONV_SPEED = 0.2

        for (let i = 0; i < animatedNodes.length; i++) {
            let dist = Math.sqrt(Math.pow(animatedNodes[i].x - graphState.nodes.data[i].x, 2) + Math.pow(animatedNodes[i].y - graphState.nodes.data[i].y, 2))

            if (dist > PARAM) {
                animate = true

                newNodes[i].x += (graphState.nodes.data[i].x - animatedNodes[i].x) * CONV_SPEED
                newNodes[i].y += (graphState.nodes.data[i].y - animatedNodes[i].y) * CONV_SPEED
            }
        }

        if (animate) {
            setAnimatedNodes(newNodes)
        }

        let hashedNodes = newNodes.map((node) => {
            node.visualAttributes.alpha = 1

            if (graphState.nodes.mapping.generators.alpha.attribute !== '') {
                const mappingState = graphState.nodes.mapping.generators.alpha

                const mapFun = Mappings.getMapFunction(mappingState.fun)

                if (mapFun !== null && Object.keys(node.attributes).includes(mappingState.attribute.toString())) {
                    node.visualAttributes.alpha = mapFun(node.attributes[mappingState.attribute], mappingState.data as any) + 0.1
                }
            }

            node.visualAttributes.radius = 16
            if (graphState.nodes.mapping.generators.radius.attribute !== '') {
                const mappingState = graphState.nodes.mapping.generators.radius

                const mapFun = Mappings.getMapFunction(mappingState.fun)

                if (mapFun !== null && Object.keys(node.attributes).includes(mappingState.attribute.toString())) {
                    const val = mapFun(node.attributes[mappingState.attribute], mappingState.data as any)
                    console.log(val)
                    node.visualAttributes.radius = graphState.nodes.mapping.settings.minRadius + val * graphState.nodes.mapping.settings.maxRadius
                }
            }

            if (selectionState?.selectedNodes.length !== 0) {
                if (selectionState?.selectedNodes.includes(node.id)) {
                    node.visualAttributes.alpha = 1.0
                }
                else {
                    node.visualAttributes.alpha = 0.2
                }
            }

            node.visualAttributes.fillColour = [0, 0, 0]

            if (graphState.nodes.mapping.generators.colour.attribute !== '') {
                const mappingState = graphState.nodes.mapping.generators.colour

                const mapFun = Mappings.getMapFunction(mappingState.fun)

                if (mapFun !== null && Object.keys(node.attributes).includes(mappingState.attribute.toString())) {
                    node.visualAttributes.fillColour = [mapFun(node.attributes[mappingState.attribute], mappingState.data as any), 0, 0]
                }
            }

            return {
                ...node,
                // hash: Hash(node, {
                //     excludeKeys: (key) => {
                //         return (key === 'x' || key === 'y')
                //     }
                // })
                hash: 'abc'
            }
        })

        let hashedEdges = graphState.edges.data.map((edge) => {
            edge.visualAttributes.alpha = 1.0

            if (selectionState?.selectedEdges.length !== 0) {
                if (selectionState?.selectedEdges.includes(edge.attributes['id'].toString())) {
                    edge.visualAttributes.alpha = 1.0
                }
                else {
                    edge.visualAttributes.alpha = 0.2
                }
            }

            edge.visualAttributes.fillColour = [0, 0, 0]

            if (graphState.edges.mapping.generators.colour.attribute !== '') {
                const mappingState = graphState.edges.mapping.generators.colour

                const mapFun = Mappings.getMapFunction(mappingState.fun)

                if (mapFun !== null && Object.keys(edge.attributes).includes(mappingState.attribute.toString())) {
                    edge.visualAttributes.fillColour = [mapFun(edge.attributes[mappingState.attribute], mappingState.data as any), 0, 0]
                }
            }

            if (graphState.edges.mapping.generators.alpha.attribute !== '') {
                const mappingState = graphState.edges.mapping.generators.alpha

                const mapFun = Mappings.getMapFunction(mappingState.fun)

                if (mapFun !== null && Object.keys(edge.attributes).includes(mappingState.attribute.toString())) {
                    edge.visualAttributes.alpha = mapFun(edge.attributes[mappingState.attribute], mappingState.data as any) + 0.1
                }
            }

            edge.visualAttributes.width = 2

            if (graphState.edges.mapping.generators.width.attribute !== '') {
                const mappingState = graphState.edges.mapping.generators.width

                const mapFun = Mappings.getMapFunction(mappingState.fun)

                if (mapFun !== null && Object.keys(edge.attributes).includes(mappingState.attribute.toString())) {
                    edge.visualAttributes.width = 2 + mapFun(edge.attributes[mappingState.attribute], mappingState.data as any) * 3
                }
            }

            return {
                ...edge,
                // hash: Hash(edge)
                hash: 'abc'
            }
        })

        const { destroy } = Renderer({
            container: containerRef.current!,
            nodes: hashedNodes,
            edges: hashedEdges,
            directed: graphState.directed,
            selectionState: selectionState,
            selectionDispatch: selectionDispatch})

        return destroy
    }, [graphState,
        animatedNodes,
        selectionDispatch,
        selectionState])

    return <div ref={containerRef} className="render" />
}
