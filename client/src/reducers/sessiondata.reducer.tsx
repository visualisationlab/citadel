export type ServerState = 'disconnected' | 'idle' | 'busy'

export interface SessionState {
    userName: string,
    users: {userName: string, headsetCount: number}[],
    expirationDate: Date,
    graphURL: string,
    sid: string,
    layouts: LayoutInfo[],
    state: ServerState,
    simulators: Simulator[],
    graphIndex: number,
    graphIndexCount: number,
    simState: {
        step: number,
        stepMax: number
    },
    sessionURL: string,
    websocketPort: string,
    headsets: {
        headsetID: string,
        connected: boolean
    }[],
    playmode: false
}

type ServerSimulator = {
    readonly apikey: string | null,
    username: string,
    title: string,
    params: SimulatorParam[],
    state: 'disconnected' | 'idle' | 'generating' | 'connecting'
}

export type SimulatorParam =
    {
        attribute: string,
        type: 'boolean'
        defaultValue: boolean,
        value: boolean
    }
    | {
        attribute: string,
        type: 'integer' | 'float',
        defaultValue: number,
        value: number
    }
    | {
        attribute: string,
        type: 'string',
        defaultValue: string,
        value: string
    }

export interface Simulator {
    key: string | null,
    username: string,
    title: string,
    state: 'disconnected' | 'idle' | 'generating' | 'connecting',
    options: SimulatorParam[],
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
    | { attribute: 'all', value: any}
    | { attribute: 'username', value: string}
    | { attribute: 'state', value: ServerState}
    | { attribute: 'simulatorSettings', key: string, params: SimulatorParam[]}

export function SessionDataReducer(state: SessionState, action: SessionReducer): SessionState {
    switch (action.attribute) {
        case 'all':

            return {
                userName: action.value.data.users.filter((userData: {
                    userID: string, username: string
                }) => {
                    return userData.userID === action.value.userID
                })[0].username,
                users: action.value.data.users.map((userData: {
                    userID: string, username: string, headsetCount: number
                }) => {
                    return {userName: userData.username, headsetCount: userData.headsetCount}
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
                simulators: action.value.data.simulators.map((sim: ServerSimulator, index: number) => {
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
                                return {
                                    ...param,
                                    value: param.defaultValue
                                }
                            })
                        }
                    }

                    return {...state.simulators[index], username: sim.username, state: sim.state}
                }),
                simState: {
                    step: action.value.data.simState.step,
                    stepMax: action.value.data.simState.stepMax,
                },
                playmode: action.value.data.playmode
            }
        case 'state':
            state.state = action.value

            return {...state}
        case 'username':
            state.userName = action.value

            return {...state}
        case 'simulatorSettings':
            console.log(action.params)
            state.simulators = state.simulators.map((sim) => {
                if (sim.key === action.key)
                    sim.options = action.params

                return sim
                })

            console.log(state.simulators)

            return {...state}
    }
}
