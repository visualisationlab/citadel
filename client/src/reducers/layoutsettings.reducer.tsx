// import { number } from "mathjs"
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
            value: number,
            autoEnabled: boolean,
            auto: boolean
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
    | { attribute: 'setAuto', value: boolean, key: string}

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
                                        defaultValue: setting.defaultValue,
                                        autoEnabled: setting.auto,
                                        auto: setting.auto
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
                            // If type is number, also update auto field
                            return {
                                ...state.layouts[layoutIndex].settings[settingIndex]
                                // name: setting.name,
                                // description: setting.description,
                                // type: setting.type,
                                // value: state.layouts[layoutIndex].settings[settingIndex].value,
                                // defaultValue: setting.defaultValue,
                            }
                        })
                    }
                })
            }
        case 'property':
            if (state === null) {
                return null
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

            return {...state}
        case 'setAuto':
            if (state === null) {
                return null
            }

            state.layouts.filter((layout) => {return layout.name === state?.selectedLayout})[0].settings.map((setting, index) => {
                if (setting.type === 'boolean') {
                    return setting
                }

                if (setting.name === action.key) {
                    setting.auto = action.value
                }
                return setting // ADDED BY LAU
            })

            return {...state}
        default:
            if (state === null) {
                return null
            }

            return {...state}
    }
}
