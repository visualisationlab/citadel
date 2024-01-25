/**
 * @author Miles van der Lely <m.vanderlely@uva.nl>
 *
 * This file contains the layout component, which is a worker app in the main
 * component. It generates data for the renderer component.
 */

import React, { useRef, useContext } from 'react';

import { Renderer } from './renderer.component'
import { GraphDataContext } from './main.component'
import { SelectionDataContext, GlobalSettingsContext } from "./main.component"
import { MappingContext } from './main.component'
import { MappingType } from '../reducers/selectedmappings.reducer';
import { BasicEdge, BasicNode } from './router.component';

export type Shape =
        | 'circle'
        | 'square'
        | 'triangle'
        | 'star'
        | 'line'

export interface ExtendedNode extends BasicNode {
    visualAttributes: {
        hue: number,
        saturation: number,
        lightness: number,
        shape: Shape,
        prevShape: Shape,
        radius: number,
        alpha: number,
        text: string,
        textScale: number,
        x: number,
        y: number,
    }
}

export interface ExtendedEdge extends BasicEdge {
    visualAttributes: {
        hue: number,
        saturation: number,
        lightness: number,
        text: string,
        width: number,
        alpha: number,
    }
}

// Takes number between 0 and 1 and returns a number scaled to the interval [min, max]
function ScaleToInterval(val: number, min: number, max: number) {
    return min + (max - min) * val
}

const DEFAULTNODEHUE = 50
const DEFAULTNODERADIUS = 16
const DEFAULTNODEALPHA = 1
const DEFAULTNODELIGHTNESS = 0.5
const DEFAULTNODESATURATION = 1
const DEFAULTNODESHAPE = 'circle'

const DEFAULTEDGEHUE = 219
const DEFAULTEDGEWIDTH = 2

/**
 * Returns a container, which is updated by reference to contain the graph.
 * @param param0 props
 * @returns JSX
 */
export default function PreProcess() {
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

        let extendedNodes: ExtendedNode[] = newNodes.map((node) => {
            let newNode: ExtendedNode = {
                ...node,
                visualAttributes: {
                    alpha: DEFAULTNODEALPHA,
                    text: '',
                    radius: DEFAULTNODERADIUS,
                    hue: DEFAULTNODEHUE,
                    prevShape: DEFAULTNODESHAPE,
                    lightness: DEFAULTNODELIGHTNESS,
                    saturation: DEFAULTNODESATURATION,
                    shape: DEFAULTNODESHAPE,
                    textScale: 1,
                    x: node.position.x,
                    y: node.position.y,
                },
            }

            mappingsState.selectedMappings.forEach((mapping) => {
                let mapJS = mapping.toJS() as MappingType

                if (mapJS.objectType === 'edge')
                    return {
                        ...newNode,
                        hash: 'abc'
                    }

                if (mapJS.mappingName === 'x-position') {
                    let attributeData = nodeMetadata[mapJS.attributeName]

                    if (attributeData.type === 'ordered') {
                        try {
                            let val = (newNode[mapJS.attributeName] - attributeData.min) / (attributeData.max - attributeData.min)
                            console.log('maping node poosicition??')
                            newNode.visualAttributes.x = ScaleToInterval(val, 0, 1000)
                            console.log(newNode.visualAttributes.x)
                        }
                        catch (e) {
                        }
                    }
                }

                if (mapJS.mappingName === 'y-position') {
                    let attributeData = nodeMetadata[mapJS.attributeName]

                    if (attributeData.type === 'ordered') {
                        try {
                            let val = (newNode[mapJS.attributeName] - attributeData.min) / (attributeData.max - attributeData.min)
                            newNode.visualAttributes.y = ScaleToInterval(val, 0, -1000)
                        }
                        catch (e) {

                        }
                    }
                }

                if (mapJS.mappingName === 'text') {

                    newNode.visualAttributes.text = newNode[mapJS.attributeName]
                    newNode.visualAttributes.textScale = globalSettingsState.textScale * 0.3

                    if (mappingsState.config.get(JSON.stringify(mapping))?.settings.get(newNode[mapJS.attributeName]) === 0) {
                        newNode.visualAttributes.text = ''
                    }
                }

                if (mapJS.mappingName === 'alpha') {
                    console.log(mapJS.attributeName)
                    let attributeData = nodeMetadata[mapJS.attributeName]

                    if (attributeData.type === 'ordered') {
                        try {
                            let val = (newNode[mapJS.attributeName] - attributeData.min) / (attributeData.max - attributeData.min)
                            newNode.visualAttributes.alpha = val + 0.1
                        }
                        catch (e) {
                            newNode.visualAttributes.alpha = DEFAULTNODEALPHA
                        }
                    }
                }

                if (mapJS.mappingName === 'saturation') {
                    let attributeData = nodeMetadata[mapJS.attributeName]

                    if (attributeData.type === 'ordered') {
                        try {
                            let val = (newNode[mapJS.attributeName] - attributeData.min) / (attributeData.max - attributeData.min)
                            newNode.visualAttributes.saturation = ScaleToInterval(val, 0.1, 1)
                        }
                        catch (e) {
                            newNode.visualAttributes.saturation = DEFAULTNODESATURATION
                        }
                    }
                }

                if (mapJS.mappingName === 'lightness') {
                    let attributeData = nodeMetadata[mapJS.attributeName]

                    if (attributeData.type === 'ordered') {
                        try {
                            let val = (newNode[mapJS.attributeName] - attributeData.min) / (attributeData.max - attributeData.min)
                            newNode.visualAttributes.lightness = ScaleToInterval(val, 0.1, 0.9)
                        }
                        catch (e) {
                            newNode.visualAttributes.lightness = DEFAULTNODELIGHTNESS
                        }
                    }
                }

                if (mapJS.mappingName === 'radius') {
                    let attributeData = nodeMetadata[mapJS.attributeName]

                    if (attributeData.type === 'ordered') {
                        try {
                            let val = (newNode[mapJS.attributeName] - attributeData.min) / (attributeData.max - attributeData.min)
                            newNode.visualAttributes.radius = ((val) * 32) + DEFAULTNODERADIUS
                        }
                        catch (e) {
                            newNode.visualAttributes.radius = DEFAULTNODERADIUS
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
                        let index = mappingConfig.settings.get(newNode[mapJS.attributeName])

                        if (index === undefined) {
                            newNode.visualAttributes.hue = DEFAULTNODEHUE
                        }
                        else {
                            if (index >= hues.length) {
                                newNode.visualAttributes.hue = DEFAULTNODEHUE
                            }
                            else {
                                newNode.visualAttributes.hue = hues[index]
                            }
                        }

                    }
                    catch (e) {
                        console.log(e)
                        newNode.visualAttributes.hue = 50
                    }
                }

                if (mapJS.mappingName === 'shape') {
                    let mappingConfig = mappingsState.config.get(JSON.stringify(mapping))

                    if (mappingConfig === undefined || mappingConfig === null)
                        return

                    // 0 circle, 1: square
                    let shape = mappingConfig.settings.get(newNode[mapJS.attributeName])

                    if (shape === undefined) {
                        newNode.visualAttributes.shape = 'circle'
                    }

                    switch (shape) {
                        case 1:
                            newNode.visualAttributes.shape = 'circle'
                            break
                        case 0:
                            newNode.visualAttributes.shape = 'square'
                            break
                        default:
                            newNode.visualAttributes.shape = 'circle'
                            break
                    }
                }
            })

            // Selection logic
            if (selectionState.objectType === 'node'
                && selectionState.selectedIDs.length > 0
                && globalSettingsState.selectionHighlight !== 'none'
                && !selectionState.selectedIDs.includes(newNode['id'].toString())
                ) {
                switch (globalSettingsState?.selectionHighlight) {
                    case 'transparency':
                        newNode.visualAttributes.alpha = Math.max(0.05, newNode.visualAttributes.alpha - 0.4)
                        break
                    case 'lightness':
                        newNode.visualAttributes.lightness = Math.max(0.05, newNode.visualAttributes.lightness - 0.4)
                        break
                    case 'saturation':
                        newNode.visualAttributes.saturation = Math.max(0.05, newNode.visualAttributes.saturation - 0.4)
                        break
                    default:
                        break
                }
            }

            return newNode
        })

        let extendedEdges: ExtendedEdge[] = graphState.edges.data.map((edge) => {
            let newEdge: ExtendedEdge = {
                ...edge,
                visualAttributes: {
                    alpha: 1.0,
                    hue: DEFAULTEDGEHUE,
                    lightness: 0.25,
                    saturation: 1,
                    text: '',
                    width: DEFAULTEDGEWIDTH,
                },
            }

            if (selectionState.objectType === 'edge'
                && selectionState?.selectedIDs.length > 0) {
                if (selectionState?.selectedIDs.includes(newEdge.id.toString())) {
                    newEdge.visualAttributes.alpha = 1.0
                }
                else {
                    newEdge.visualAttributes.alpha = 0.2
                }
            }

            mappingsState.selectedMappings.forEach((mapping) => {
                let mapJS = mapping.toJS() as MappingType

                if (mapJS.objectType === 'node')
                    return {
                        ...newEdge,
                        hash: 'abc'
                    }

                if (mapJS.mappingName === 'text') {

                    newEdge.visualAttributes.text = newEdge[mapJS.attributeName]
                }

                if (mapJS.mappingName === 'alpha') {
                    let attributeData = edgeMetadata[mapJS.attributeName]

                    if (attributeData.type === 'ordered') {
                        try {
                            let val = (newEdge[mapJS.attributeName] - attributeData.min) / (attributeData.max - attributeData.min)
                            newEdge.visualAttributes.alpha = val + 0.1
                        }
                        catch (e) {
                            newEdge.visualAttributes.alpha = 0
                        }
                    }
                }

                if (mapJS.mappingName === 'saturation') {
                    let attributeData = edgeMetadata[mapJS.attributeName]

                    if (attributeData.type === 'ordered') {
                        try {
                            let val = (newEdge[mapJS.attributeName] - attributeData.min) / (attributeData.max - attributeData.min)
                            newEdge.visualAttributes.saturation = val
                        }
                        catch (e) {
                            newEdge.visualAttributes.saturation = 1
                        }
                    }
                }

                if (mapJS.mappingName === 'lightness') {
                    let attributeData = edgeMetadata[mapJS.attributeName]

                    if (attributeData.type === 'ordered') {
                        try {
                            let val = (newEdge[mapJS.attributeName] - attributeData.min) / (attributeData.max - attributeData.min)
                            newEdge.visualAttributes.lightness = val
                        }
                        catch (e) {
                            newEdge.visualAttributes.lightness = 0.5
                        }
                    }
                }

                if (mapJS.mappingName === 'hue') {
                    if (mappingsState.config.get(JSON.stringify(mapping))!.colourScheme !== null) {
                        let hues = mappingsState.schemes.get(mappingsState.config.get(JSON.stringify(mapping))!.colourScheme!)!

                        let index = mappingsState.config.get(JSON.stringify(mapping))!.settings.get(newEdge[mapJS.attributeName])

                        if (index === undefined) {
                            newEdge.visualAttributes.hue = 219
                        }
                        else {
                            try {

                                if (index >= hues.length) {
                                    newEdge.visualAttributes.hue = 219
                                }
                                else {
                                    newEdge.visualAttributes.hue = hues[index]
                                }
                            }
                            catch (e) {
                                console.log(e)
                                newEdge.visualAttributes.hue = 219
                            }
                        }
                    }
                }

                if (mapJS.mappingName === 'width') {
                    let attributeData = edgeMetadata[mapJS.attributeName]

                    if (attributeData.type === 'ordered') {
                        try {
                            let val = (newEdge[mapJS.attributeName] - attributeData.min) / (attributeData.max - attributeData.min)
                            newEdge.visualAttributes.width = val * 5
                        }
                        catch (e) {
                            newEdge.visualAttributes.width = DEFAULTEDGEWIDTH
                        }
                    }
                }
            })
            return newEdge
        })

        const { destroy } = Renderer({
            container: containerRef.current!,
            nodes: extendedNodes,
            edges: extendedEdges,
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
