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
import { SelectionDataContext, GlobalSettingsContext } from "./main.component"
import { MappingContext } from '../components/main.component'
import { MappingType } from '../reducers/selectedmappings.reducer';

// Takes number between 0 and 1 and returns a number scaled to the interval [min, max]
function ScaleToInterval(val: number, min: number, max: number) {
    return min + (max - min) * val
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
    const { globalSettingsState } = useContext(GlobalSettingsContext)

    const containerRef = useRef(null)

    /**
     * Updates the container reference with graph visualization.
     */
    React.useEffect(() => {
        if (graphState === null || mappingsState === null || globalSettingsState === null || selectionState === null) {
            return
        }

        let newNodes = [...graphState.nodes.data]

        let nodeMetadata = graphState.nodes.metadata
        let edgeMetadata = graphState.edges.metadata

        let hashedNodes = newNodes.map((node) => {
            node.visualAttributes.alpha = 1
            node.visualAttributes.text = ''
            node.visualAttributes.radius = 16
            node.visualAttributes.hue = 50
            node.visualAttributes.prevShape = node.visualAttributes.shape

            node.visualAttributes.lightness = 0.5
            node.visualAttributes.saturation = 1
            node.visualAttributes.x = node.x
            node.visualAttributes.y = node.y

            mappingsState.selectedMappings.forEach((mapping) => {
                let mapJS = mapping.toJS() as MappingType

                if (mapJS.objectType === 'edge')
                    return {
                        ...node,
                        hash: 'abc'
                    }

                if (mapJS.mappingName === 'x-position') {
                    let attributeData = nodeMetadata[mapJS.attributeName]

                    if (attributeData.type === 'ordered') {
                        try {
                            let val = (node.attributes[mapJS.attributeName] - attributeData.min) / (attributeData.max - attributeData.min)
                            node.visualAttributes.x = ScaleToInterval(val, 0, 1000)
                        }
                        catch (e) {
                        }
                    }
                }

                if (mapJS.mappingName === 'y-position') {
                    let attributeData = nodeMetadata[mapJS.attributeName]

                    if (attributeData.type === 'ordered') {
                        try {
                            let val = (node.attributes[mapJS.attributeName] - attributeData.min) / (attributeData.max - attributeData.min)
                            node.visualAttributes.y = ScaleToInterval(val, 0, -1000)
                        }
                        catch (e) {

                        }
                    }
                }

                if (mapJS.mappingName === 'text') {

                    node.visualAttributes.text = node.attributes[mapJS.attributeName]
                    node.visualAttributes.textScale = globalSettingsState.textScale * 0.3

                    if (mappingsState.config.get(JSON.stringify(mapping))?.settings.get(node.attributes[mapJS.attributeName]) === 0) {
                        node.visualAttributes.text = ''
                    }
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
                            node.visualAttributes.saturation = ScaleToInterval(val, 0.1, 1)
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
                            node.visualAttributes.lightness = ScaleToInterval(val, 0.1, 0.9)
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
                    let mappingConfig = mappingsState.config.get(JSON.stringify(mapping))

                    if (mappingConfig === undefined || mappingConfig === null)
                        return

                    let colourScheme = mappingConfig.colourScheme

                    if (colourScheme === undefined || colourScheme === null)
                        return

                    let hues = mappingsState.schemes.get(colourScheme)

                    if (hues === undefined || hues === null)
                        return

                    try {
                        let index = mappingConfig.settings.get(node.attributes[mapJS.attributeName])

                        if (index === undefined) {
                            node.visualAttributes.hue = 60
                        }
                        else {
                            if (index >= hues.length) {
                                node.visualAttributes.hue = 60
                            }
                            else {
                                node.visualAttributes.hue = hues[index]
                            }
                        }

                    }
                    catch (e) {
                        console.log(e)
                        node.visualAttributes.hue = 50
                    }
                }

                if (mapJS.mappingName === 'shape') {
                    let mappingConfig = mappingsState.config.get(JSON.stringify(mapping))

                    if (mappingConfig === undefined || mappingConfig === null)
                        return

                    // 0 circle, 1: square
                    let shape = mappingConfig.settings.get(node.attributes[mapJS.attributeName])

                    if (shape === undefined) {
                        node.visualAttributes.shape = 'circle'
                    }

                    switch (shape) {
                        case 1:
                            node.visualAttributes.shape = 'circle'
                            break
                        case 0:
                            node.visualAttributes.shape = 'square'
                            break
                        default:
                            node.visualAttributes.shape = 'circle'
                            break
                    }
                }
            })

            // Selection logic
            if (selectionState.objectType === 'node'
                && selectionState.selectedIDs.length > 0
                && globalSettingsState.selectionHighlight !== 'none'
                && !selectionState.selectedIDs.includes(node.attributes['id'].toString())
                ) {
                switch (globalSettingsState?.selectionHighlight) {
                    case 'transparency':
                        node.visualAttributes.alpha = Math.max(0.05, node.visualAttributes.alpha - 0.4)
                        break
                    case 'lightness':
                        node.visualAttributes.lightness = Math.max(0.05, node.visualAttributes.lightness - 0.4)
                        break
                    case 'saturation':
                        node.visualAttributes.saturation = Math.max(0.05, node.visualAttributes.saturation - 0.4)
                        break
                    default:
                        break
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

            if (selectionState.objectType === 'edge'
                && selectionState?.selectedIDs.length > 0) {
                if (selectionState?.selectedIDs.includes(edge.attributes['id'].toString())) {
                    edge.visualAttributes.alpha = 1.0
                }
                else {
                    edge.visualAttributes.alpha = 0.2
                }
            }

            const defaultEdgeHue = 226

            edge.visualAttributes.hue = defaultEdgeHue
            edge.visualAttributes.lightness = 0.25
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
                    if (mappingsState.config.get(JSON.stringify(mapping))!.colourScheme !== null) {
                        let hues = mappingsState.schemes.get(mappingsState.config.get(JSON.stringify(mapping))!.colourScheme!)!

                        let index = mappingsState.config.get(JSON.stringify(mapping))!.settings.get(edge.attributes[mapJS.attributeName])

                        if (index === undefined) {
                            edge.visualAttributes.hue = defaultEdgeHue
                        }
                        else {
                            try {

                                if (index >= hues.length) {
                                    edge.visualAttributes.hue = defaultEdgeHue
                                }
                                else {
                                    edge.visualAttributes.hue = hues[index]
                                }
                            }
                            catch (e) {
                                console.log(e)
                                edge.visualAttributes.hue = defaultEdgeHue
                            }
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
        mappingsState,
        globalSettingsState])

    return <div ref={containerRef} className="render" />
}
