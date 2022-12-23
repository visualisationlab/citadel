import { number } from "mathjs"
import { LayoutInfo } from "./sessiondata.reducer"

export type AvailableLayout =
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
            description: string,
            type: 'number',
            defaultValue: number,
            value: number
        }
    |   {
        name: string,
        description: string,
        type: 'boolean',
        defaultValue: boolean,
        value: boolean
    }

export type LayoutState = {
    name: AvailableLayout,
    description: string,
    link: string,
    settings: LayoutSetting[]
    randomize: boolean
}

export type LayoutSettingsState = {
    selectedLayout: AvailableLayout | null,
    layouts: LayoutState[]
} | null

export type LayoutSettingsReducerAction =
    | { attribute: 'layouts', value: LayoutInfo[], currentLayout: AvailableLayout | null}
    | { attribute: 'property', key: string, value: number | boolean }
    | { attribute: 'selectedLayout', value: string }

export function LayoutSettingsReducer(state: LayoutSettingsState, action: LayoutSettingsReducerAction): LayoutSettingsState {
    console.log('here')
    switch (action.attribute) {
        case 'selectedLayout':
            if (state === null) {
                return null
            }

            console.log('Changing layout to', action.value)

            state.selectedLayout = action.value as AvailableLayout

            return {...state}
        case 'layouts':
            console.log(action.currentLayout)
            if (state === null || state.layouts.length !== action.value.length) {
                return {
                    selectedLayout: action.currentLayout,
                    layouts: action.value.map((layoutInfo) => {
                        return {
                            ...layoutInfo,
                            randomize: action.currentLayout === null,
                            settings: layoutInfo.settings.map((setting) => {
                                if (setting.type === 'number') {
                                    return {
                                        name: setting.name,
                                        description: setting.description,
                                        type: 'number',
                                        value: setting.defaultValue,
                                        defaultValue: setting.defaultValue
                                    }
                                }

                                return {
                                    name: setting.name,
                                    description: setting.description,
                                    type: setting.type,
                                    value: setting.defaultValue,
                                    defaultValue: setting.defaultValue
                                }
                            })
                        }
                    })
                }
            }

            return {
                selectedLayout: action.currentLayout,
                // @ts-ignore
                layouts: action.value.map((layoutInfo, layoutIndex) => {
                    return {
                        ...layoutInfo,
                        randomize: action.currentLayout === null,
                        settings: layoutInfo.settings.map((setting, settingIndex) => {
                            return {
                                name: setting.name,
                                description: setting.description,
                                type: setting.type,
                                value: state.layouts[layoutIndex].settings[settingIndex].value,
                                defaultValue: setting.defaultValue
                            }
                        })
                    }
                })
            }
        case 'property':
            if (state === null) {
                return {...state!}
            }

            if (action.key === 'randomize') {
                state.layouts.filter((layout) => {return layout.name === state?.selectedLayout})[0].randomize = action.value as boolean
                return {...state}
            }

            state.layouts.filter((layout) => {return layout.name === state?.selectedLayout})[0].settings.map((setting, index) => {
                if (setting.name === action.key) {
                    setting.value = action.value
                }

                return setting
            })

            return {...state!}
    }
}
