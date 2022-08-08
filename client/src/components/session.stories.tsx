import { ComponentStory, ComponentMeta } from '@storybook/react'

import SessionTab from './session.component'

export default {
    title: 'Tabs/Session',
    component: SessionTab,
} as ComponentMeta<typeof SessionTab>

export const Primary: ComponentStory<typeof SessionTab> = (args) => <SessionTab></SessionTab>

Primary.args = {
    userName: 'User0',
    users:['User1', 'User2'],
    expirationDate: new Date(),
    sid: 'SID',
    graphURL: 'google.com'
}
