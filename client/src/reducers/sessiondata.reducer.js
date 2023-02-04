export function SessionDataReducer(state, action) {
    switch (action.attribute) {
        case 'all':
            return {
                currentLayout: action.value.data.currentLayout,
                userName: action.value.data.users.filter((userData) => {
                    return userData.userID === action.value.userID;
                })[0].username,
                users: action.value.data.users.map((userData) => {
                    return { userName: userData.username, headsetCount: userData.headsetCount };
                }),
                expirationDate: action.value.data.expirationDate,
                graphURL: action.value.data.url,
                sid: action.value.sessionID,
                layouts: action.value.data.layoutInfo,
                headsets: action.value.data.headsets,
                websocketPort: action.value.data.websocketPort,
                sessionURL: action.value.data.sessionURL,
                state: action.value.sessionState,
                graphIndex: action.value.data.graphIndex,
                graphIndexCount: action.value.data.graphIndexCount,
                simulators: action.value.data.simulators.map((sim, index) => {
                    if (index >= state.simulators.length ||
                        (state.simulators[index].state === 'disconnected'
                            || state.simulators[index].state === 'connecting'
                            || state.simulators[index].state === 'generating'
                            || sim.state === 'disconnected')) {
                        return {
                            key: sim.apikey,
                            title: sim.title,
                            username: sim.username,
                            state: sim.state,
                            options: sim.params.map((param) => {
                                return Object.assign(Object.assign({}, param), { value: param.defaultValue });
                            })
                        };
                    }
                    return Object.assign(Object.assign({}, state.simulators[index]), { username: sim.username, state: sim.state });
                }),
                simState: {
                    step: action.value.data.simState.step,
                    stepMax: action.value.data.simState.stepMax,
                },
                playmode: action.value.data.playmode
            };
        case 'state':
            state.state = action.value;
            return Object.assign({}, state);
        case 'username':
            state.userName = action.value;
            return Object.assign({}, state);
        case 'simulatorSettings':
            console.log(action.params);
            state.simulators = state.simulators.map((sim) => {
                if (sim.key === action.key)
                    sim.options = action.params;
                return sim;
            });
            console.log(state.simulators);
            return Object.assign({}, state);
        default:
            return state;
    }
}
