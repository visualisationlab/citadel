export function SessionDataReducer(state, action) {
    switch (action.attribute) {
        case 'all':
            const message = action.value;
            const payload = message.payload;
            return {
                globals: payload.globals,
                globalsGeneratedOn: payload.globalsGeneratedOn,
                currentLayout: payload.currentLayout,
                userName: payload.users.filter((userData) => {
                    return userData.userID === message.receiverID;
                })[0].username,
                users: payload.users.map((userData) => {
                    return { userName: userData.username, headsetCount: userData.headsetCount };
                }),
                expirationDate: payload.expirationDate,
                graphURL: payload.url,
                sid: action.value.sessionID,
                layouts: payload.layoutInfo,
                headsets: payload.headsets,
                websocketPort: payload.websocketPort,
                sessionURL: payload.sessionURL,
                state: payload.state,
                graphIndex: payload.graphIndex,
                graphIndexCount: payload.graphIndexCount,
                simulators: payload.simulators.map((sim, index) => {
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
                            valid: 'unknown',
                            validator: sim.validator,
                            params: sim.params.map((param) => {
                                return Object.assign(Object.assign({}, param), { value: param.defaultValue });
                            })
                        };
                    }
                    return Object.assign(Object.assign({}, state.simulators[index]), { username: sim.username, state: sim.state });
                }),
                simState: {
                    step: payload.simState.step,
                    stepMax: payload.simState.stepMax,
                    name: payload.simState.name,
                },
                playmode: payload.playmode
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
                    sim.params = action.params;
                return sim;
            });
            console.log(state.simulators);
            return Object.assign({}, state);
        default:
            return state;
    }
}
