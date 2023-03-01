export function LayoutSettingsReducer(state, action) {
    switch (action.attribute) {
        case 'selectedLayout':
            if (state === null) {
                return null;
            }
            state.selectedLayout = action.value;
            return Object.assign({}, state);
        case 'layouts':
            if (state === null || state.layouts.length !== action.value.length) {
                return {
                    selectedLayout: action.currentLayout,
                    layouts: action.value.map((layoutInfo) => {
                        return Object.assign(Object.assign({}, layoutInfo), { randomize: action.currentLayout === null, settings: layoutInfo.settings.map((setting) => {
                                if (setting.type === 'number') {
                                    return {
                                        name: setting.name,
                                        description: setting.description,
                                        type: 'number',
                                        value: setting.defaultValue,
                                        defaultValue: setting.defaultValue,
                                        autoEnabled: setting.auto,
                                        auto: setting.auto
                                    };
                                }
                                return {
                                    name: setting.name,
                                    description: setting.description,
                                    type: setting.type,
                                    value: setting.defaultValue,
                                    defaultValue: setting.defaultValue
                                };
                            }) });
                    })
                };
            }
            return {
                selectedLayout: action.currentLayout,
                // @ts-ignore
                layouts: action.value.map((layoutInfo, layoutIndex) => {
                    return Object.assign(Object.assign({}, layoutInfo), { randomize: action.currentLayout === null, settings: layoutInfo.settings.map((setting, settingIndex) => {
                            // If type is number, also update auto field
                            return Object.assign({}, state.layouts[layoutIndex].settings[settingIndex]
                            // name: setting.name,
                            // description: setting.description,
                            // type: setting.type,
                            // value: state.layouts[layoutIndex].settings[settingIndex].value,
                            // defaultValue: setting.defaultValue,
                            );
                        }) });
                })
            };
        case 'property':
            if (state === null) {
                return null;
            }
            if (action.key === 'randomize') {
                state.layouts.filter((layout) => { return layout.name === (state === null || state === void 0 ? void 0 : state.selectedLayout); })[0].randomize = action.value;
                return Object.assign({}, state);
            }
            state.layouts.filter((layout) => { return layout.name === (state === null || state === void 0 ? void 0 : state.selectedLayout); })[0].settings.map((setting, index) => {
                if (setting.name === action.key) {
                    setting.value = action.value;
                }
                return setting;
            });
            return Object.assign({}, state);
        case 'setAuto':
            if (state === null) {
                return null;
            }
            state.layouts.filter((layout) => { return layout.name === (state === null || state === void 0 ? void 0 : state.selectedLayout); })[0].settings.map((setting, index) => {
                if (setting.type === 'boolean') {
                    return setting;
                }
                if (setting.name === action.key) {
                    setting.auto = action.value;
                }
            });
            return Object.assign({}, state);
        default:
            if (state === null) {
                return null;
            }
            return Object.assign({}, state);
    }
}
