export interface SessionState {
    userName: string,
    users: string[],
    expirationDate: Date,
    graphURL: string,
    sid: string,
    layouts: LayoutInfo[]
}

type AvailableLayout =
        | 'null'
        | 'random'
        | 'cose'
        | 'grid'
        | 'circle'
        | 'breadthfirst'
        | 'cose'

type LayoutSetting =
    |   {
            name: string,
            type: 'number',
            description: string,
            defaultValue: number
        }
    |   {
            name: string,
            type: 'boolean',
            description: string,
            defaultValue: boolean
        }

export interface LayoutInfo {
    name: AvailableLayout,
    description: string,
    link: string,
    settings: LayoutSetting[]
}

export type SessionReducer =
    | { attribute: 'all', value: SessionState}
    | { attribute: 'username', value: string}
    | { attribute: 'layouts', value: LayoutInfo[]}

export function SessionDataReducer(state: SessionState, action: SessionReducer): SessionState {
    switch (action.attribute) {
        case 'all':
            action.value.layouts = state.layouts
            return {...action.value}
        case 'username':
            state.userName = action.value

            return {...state}
        case 'layouts':
            state.layouts = action.value

            return {...state}
    }
}
