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
                    selectedLayout: '',
                    layouts: action.value.map((layoutInfo) => {
                        return Object.assign(Object.assign({}, layoutInfo), { settings: layoutInfo.settings.map((setting) => {
                                if (setting.type === 'number') {
                                    return {
                                        name: setting.name,
                                        description: setting.description,
                                        type: 'number',
                                        value: setting.defaultValue,
                                        defaultValue: setting.defaultValue
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
                selectedLayout: '',
                // @ts-ignore
                layouts: action.value.map((layoutInfo, layoutIndex) => {
                    return Object.assign(Object.assign({}, layoutInfo), { settings: layoutInfo.settings.map((setting, settingIndex) => {
                            return {
                                name: setting.name,
                                description: setting.description,
                                type: setting.type,
                                value: state.layouts[layoutIndex].settings[settingIndex].value,
                                defaultValue: setting.defaultValue
                            };
                        }) });
                })
            };
        case 'property':
            if (state === null) {
                return Object.assign({}, state);
            }
            state.layouts.filter((layout) => { return layout.name === (state === null || state === void 0 ? void 0 : state.selectedLayout); })[0].settings.map((setting, index) => {
                if (setting.name === action.key) {
                    setting.value = action.value;
                }
                return setting;
            });
            return Object.assign({}, state);
    }
}
