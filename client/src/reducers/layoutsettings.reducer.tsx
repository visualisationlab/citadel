import { number } from "mathjs"
import { LayoutInfo } from "./sessiondata.reducer"

type AvailableLayout =
        | ''
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
}

export type LayoutSettingsState = {
    selectedLayout: AvailableLayout,
    layouts: LayoutState[]
} | null

export type LayoutSettingsReducerAction =
    | { attribute: 'layouts', value: LayoutInfo[] }
    | { attribute: 'property', key: string, value: number | boolean }
    | { attribute: 'selectedLayout', value: string }

export function LayoutSettingsReducer(state: LayoutSettingsState, action: LayoutSettingsReducerAction): LayoutSettingsState {
    switch (action.attribute) {
        case 'selectedLayout':
            if (state === null) {
                return null
            }

            state.selectedLayout = action.value as AvailableLayout

            return {...state}
        case 'layouts':
            if (state === null || state.layouts.length !== action.value.length) {
                return {
                    selectedLayout: '',
                    layouts: action.value.map((layoutInfo) => {
                        return {
                            ...layoutInfo,
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
                selectedLayout: '',
                // @ts-ignore
                layouts: action.value.map((layoutInfo, layoutIndex) => {
                    return {
                        ...layoutInfo,
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

            state.layouts.filter((layout) => {return layout.name === state?.selectedLayout})[0].settings.map((setting, index) => {
                if (setting.name === action.key) {

                    setting.value = action.value
                }

                return setting
            })

            return {...state!}
    }
}
