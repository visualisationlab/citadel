import React from 'react'

import { ComponentStory, ComponentMeta } from '@storybook/react'

import InspectTab from './inspect.component'

export default {
    title: 'Tabs/Inspect',
    component: InspectTab,
} as ComponentMeta<typeof InspectTab>

export const Default: ComponentStory<typeof InspectTab> = (args) => <InspectTab {...args}></InspectTab>
export const EdgeSelected: ComponentStory<typeof InspectTab> = (args) => <InspectTab {...args}></InspectTab>
export const NodeSelected: ComponentStory<typeof InspectTab> = (args) => <InspectTab {...args}></InspectTab>
export const Hardcore: ComponentStory<typeof InspectTab> = (args) => <InspectTab {...args}></InspectTab>

let defaultCount = 100
let hardcoreCount = 1000

Default.args = {
    // nodes: [...Array(defaultCount).keys()].map((index) => {
    //     return {
    //         id: 'n' + index,
    //         x: 0,
    //         y: 0,
    //         attributes: {},
    //         visualAttributes: {
    //             fillColour: [0, 0, 0],
    //             radius: 10,
    //             alpha: 1,
    //             edgeColour: [0, 0, 0]
    //         }
    //     }
    // }),
    // edges: [...Array(defaultCount).keys()].map((index) => {
    //     return {
    //         id: 'e' + index,
    //         source: 'n' + (index + 100) % defaultCount,
    //         target: 'n' + (index + 101) % defaultCount,
    //         attributes: {},
    //         visualAttributes: {
    //             fillColour: [0, 0, 0],
    //             width: 10,
    //             alpha: 1,
    //             edgeColour: [0, 0, 0]
    //         }
    //     }}),
    // directed: false,
    selectedEdgeID: '',
    selectedNodeID: ''
}

Hardcore.args = {
    // nodes: [...Array(hardcoreCount).keys()].map((index) => {
    //     return {
    //         id: 'n' + index,
    //         x: 0,
    //         y: 0,
    //         attributes: {},
    //         visualAttributes: {
    //             fillColour: [0, 0, 0],
    //             radius: 10,
    //             alpha: 1,
    //             edgeColour: [0, 0, 0]
    //         }
    //     }
    // }),
    // edges: [...Array(hardcoreCount).keys()].map((index) => {
    //     return {
    //         id: 'e' + index,
    //         source: 'n' + (index + 100) % hardcoreCount,
    //         target: 'n' + (index + 101) % hardcoreCount,
    //         attributes: {},
    //         visualAttributes: {
    //             fillColour: [0, 0, 0],
    //             width: 10,
    //             alpha: 1,
    //             edgeColour: [0, 0, 0]
    //         }
    //     }}),
    // directed: false,
    selectedEdgeID: '',
    selectedNodeID: ''
}
