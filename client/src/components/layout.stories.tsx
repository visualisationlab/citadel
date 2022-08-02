import React from 'react'

import { ComponentStory, ComponentMeta } from '@storybook/react'

import Layout from './layout.component'

export default {
    title: 'Layout',
    component: Layout,
} as ComponentMeta<typeof Layout>

export const Default: ComponentStory<typeof Layout> = (args) => <Layout ></Layout>

const defaultCount = 1000

Default.args = {
    nodes: [...Array(defaultCount).keys()].map((index) => {
        return {
            id: 'n' + index,
            x: 30 + index * 20,
            y: 30 + index * 20,
            attributes: {},
            visualAttributes: {
                fillColour: [0, 0, 0],
                radius: 10,
                alpha: 0.2,
                edgeColour: [0, 0, 0]
            }
        }
    }),
    edges: [...Array(defaultCount).keys()].map((index) => {
        return {
            id: 'e' + index,
            source: 'n' + (index + 100) % defaultCount,
            target: 'n' + (index + 101) % defaultCount,
            attributes: {},
            visualAttributes: {
                fillColour: [0, 0, 0],
                width: 10,
                alpha: 1,
                edgeColour: [0, 0, 0]
            }
        }}),
    directed: false
}
