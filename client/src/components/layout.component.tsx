/**
 * @author Miles van der Lely <m.vanderlely@uva.nl>
 *
 * This file contains the layout component, which is a worker app in the main
 * component. It generates data for the renderer component.
 */

import React, { useRef, useContext } from 'react';

import { VisGraph } from '../types'

import { Renderer } from './renderer.component'
import { GraphDataContext } from '../components/main.component'
import { SelectionDataContext } from "./main.component"
import { MappingContext } from '../components/main.component'
import { MappingType } from '../reducers/selectedmappings.reducer';

/**
 * Generates a gradient value based on given colour gradient.
 * @param stops Array of colours
 * @param value value between 0-1
 * @returns Colour
 */
function linearGradient(stops: VisGraph.Colour[], value: number) : VisGraph.Colour {
    const stopLength = 1 / (stops.length - 1);
    const valueRatio = value / stopLength;
    const stopIndex = Math.floor(valueRatio);

    if (stopIndex === (stops.length - 1)) {
        return stops[stops.length - 1];
    }

    const stopFraction = valueRatio % 1;

    return lerp(stops[stopIndex], stops[stopIndex + 1], stopFraction);
}

/**
 * Lerps between two colours. dev.to/ndesmic/linear-color-gradient
 * @param {Colour} colour0
 * @param {Colour} colour1
 * @param {number} value between 0-1
 * @returns
 */
function lerp(colour0: VisGraph.Colour, colour1: VisGraph.Colour, value: number) : VisGraph.Colour {
    return [
        colour0[0] + (colour1[0] - colour0[0]) * value,
        colour0[1] + (colour1[1] - colour0[1]) * value,
        colour0[2] + (colour1[2] - colour0[2]) * value
    ]
}

/**
 * Returns a container, which is updated by reference to contain the graph.
 * @param param0 props
 * @returns JSX
 */
export default function Layout() {
    const { graphState } = useContext(GraphDataContext)
    const { selectionState, selectionDispatch } = useContext(SelectionDataContext)
    const { mappingsState } = useContext(MappingContext)

    const containerRef = useRef(null)

    /**
     * Updates the container reference with graph visualization.
     */
    React.useEffect(() => {
        if (graphState === null || mappingsState === null) {
            return
        }

        let newNodes = [...graphState.nodes.data]

        let nodeMetadata = graphState.nodes.metadata
        let edgeMetadata = graphState.edges.metadata

        let hues = [0, 120, 238]
        let shapes: VisGraph.Shape[] = ['square', 'triangle', 'star']

        let hashedNodes = newNodes.map((node) => {
            node.visualAttributes.alpha = 1
            node.visualAttributes.text = ''
            node.visualAttributes.radius = 16
            node.visualAttributes.hue = 50
            node.visualAttributes.prevShape = node.visualAttributes.shape

            node.visualAttributes.lightness = 0.5
            node.visualAttributes.saturation = 1

            mappingsState.selectedMappings.forEach((mapping) => {
                let mapJS = mapping.toJS() as MappingType

                if (mapJS.objectType === 'edge')
                    return {
                        ...node,
                        hash: 'abc'
                    }

                if (mapJS.mappingName === 'text') {
                    node.visualAttributes.text = node.attributes[mapJS.attributeName]
                }

                if (mapJS.mappingName === 'alpha') {
                    console.log(mapJS.attributeName)
                    let attributeData = nodeMetadata[mapJS.attributeName]

                    if (attributeData.type === 'ordered') {
                        try {
                            let val = (node.attributes[mapJS.attributeName] - attributeData.min) / (attributeData.max - attributeData.min)
                            node.visualAttributes.alpha = val + 0.1
                        }
                        catch (e) {
                            node.visualAttributes.alpha = 0
                        }
                    }
                }

                if (mapJS.mappingName === 'saturation') {
                    let attributeData = nodeMetadata[mapJS.attributeName]

                    if (attributeData.type === 'ordered') {
                        try {
                            let val = (node.attributes[mapJS.attributeName] - attributeData.min) / (attributeData.max - attributeData.min)
                            node.visualAttributes.saturation = val
                        }
                        catch (e) {
                            node.visualAttributes.saturation = 1
                        }
                    }
                }

                if (mapJS.mappingName === 'lightness') {
                    let attributeData = nodeMetadata[mapJS.attributeName]

                    if (attributeData.type === 'ordered') {
                        try {
                            let val = (node.attributes[mapJS.attributeName] - attributeData.min) / (attributeData.max - attributeData.min)
                            node.visualAttributes.lightness = val
                        }
                        catch (e) {
                            node.visualAttributes.lightness = 0.5
                        }
                    }
                }

                if (mapJS.mappingName === 'radius') {
                    let attributeData = nodeMetadata[mapJS.attributeName]

                    if (attributeData.type === 'ordered') {
                        try {
                            let val = (node.attributes[mapJS.attributeName] - attributeData.min) / (attributeData.max - attributeData.min)
                            node.visualAttributes.radius = ((val) * 32) + 16
                        }
                        catch (e) {
                            node.visualAttributes.radius = 16
                        }
                    }
                }

                if (mapJS.mappingName === 'hue') {
                    let attributeData = nodeMetadata[mapJS.attributeName]

                    try {
                        let index = attributeData.frequencyDict[node.attributes[mapJS.attributeName]]

                        if (index >= hues.length) {
                            node.visualAttributes.hue = 60
                        }
                        else {
                            node.visualAttributes.hue = hues[index]
                        }
                    }
                    catch (e) {
                        console.log(e)
                        node.visualAttributes.hue = 50
                        }
                }

                // if (mapJS.mappingName === 'shape') {
                //     let attributeData = nodeMetadata[mapJS.attributeName]

                //     node.visualAttributes.prevShape = node.visualAttributes.shape

                //     try {
                //         let index = attributeData.frequencyDict[node.attributes[mapJS.attributeName]]

                //         if (index >= shapes.length) {
                //             node.visualAttributes.shape = 'circle'
                //         }
                //         else {
                //             node.visualAttributes.shape = shapes[index]
                //         }
                //     }
                //     catch (e) {
                //         console.log(e)
                //         node.visualAttributes.shape = 'circle'
                //     }
                // }
            })

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

            edge.visualAttributes.hue = 234
            edge.visualAttributes.lightness = 0.5
            edge.visualAttributes.saturation = 1
            edge.visualAttributes.text = ''
            edge.visualAttributes.width = 2

            mappingsState.selectedMappings.forEach((mapping) => {
                let mapJS = mapping.toJS() as MappingType

                if (mapJS.objectType === 'node')
                    return {
                        ...edge,
                        hash: 'abc'
                    }

                if (mapJS.mappingName === 'text') {
                    edge.visualAttributes.text = edge.attributes[mapJS.attributeName]
                }

                if (mapJS.mappingName === 'alpha') {
                    let attributeData = edgeMetadata[mapJS.attributeName]

                    if (attributeData.type === 'ordered') {
                        try {
                            let val = (edge.attributes[mapJS.attributeName] - attributeData.min) / (attributeData.max - attributeData.min)
                            edge.visualAttributes.alpha = val + 0.1
                        }
                        catch (e) {
                            edge.visualAttributes.alpha = 0
                        }
                    }
                }

                if (mapJS.mappingName === 'saturation') {
                    let attributeData = edgeMetadata[mapJS.attributeName]

                    if (attributeData.type === 'ordered') {
                        try {
                            let val = (edge.attributes[mapJS.attributeName] - attributeData.min) / (attributeData.max - attributeData.min)
                            edge.visualAttributes.saturation = val
                        }
                        catch (e) {
                            edge.visualAttributes.saturation = 1
                        }
                    }
                }

                if (mapJS.mappingName === 'lightness') {
                    let attributeData = edgeMetadata[mapJS.attributeName]

                    if (attributeData.type === 'ordered') {
                        try {
                            let val = (edge.attributes[mapJS.attributeName] - attributeData.min) / (attributeData.max - attributeData.min)
                            edge.visualAttributes.lightness = val
                        }
                        catch (e) {
                            edge.visualAttributes.lightness = 0.5
                        }
                    }
                }

                if (mapJS.mappingName === 'hue') {
                    let attributeData = edgeMetadata[mapJS.attributeName]

                    if (attributeData.type === 'categorical') {
                        try {
                            let index = attributeData.frequencyDict[edge.attributes[mapJS.attributeName]]

                            if (index >= hues.length) {
                                edge.visualAttributes.hue = hues[hues.length - 1]
                            }
                            else {
                                edge.visualAttributes.hue = hues[index]
                            }
                        }
                        catch (e) {
                            console.log(e)
                            edge.visualAttributes.hue = 50
                        }
                    }
                }
            })

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
        selectionDispatch,
        selectionState,
        mappingsState])

    return <div ref={containerRef} className="render" />
}
