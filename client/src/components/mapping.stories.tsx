import React from 'react'

import { ComponentStory, ComponentMeta } from '@storybook/react'

import MappingTab from './mapping.component'

export default {
    title: 'Tabs/Mapping',
    component: MappingTab
} as ComponentMeta<typeof MappingTab>

export const Primary: ComponentStory<typeof MappingTab> = () => <MappingTab></MappingTab>
