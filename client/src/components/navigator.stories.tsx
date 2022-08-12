import React from 'react'

import { ComponentStory, ComponentMeta } from '@storybook/react'

import Navigator from './navigator.component'

import * as MappingStories from './mapping.stories'
import * as SessionStories from './session.stories'
import * as SimulateStories from './simulate.stories'
import * as inspectStories from './inspect.stories'

export default {
    title: 'Navigator',
    component: Navigator
} as ComponentMeta<typeof Navigator>

export const Primary: ComponentStory<typeof Navigator> = (args) => <Navigator {...args}></Navigator>

Primary.args = {
    ...MappingStories.Primary.args,
    ...SessionStories.Primary.args,
    // ...SimulateStories.Three.args,
    ...inspectStories.Default.args
}
