import { GlobalsType, MessageTypes } from "../components/router.component"

export type ServerState = 'disconnected' | 'idle' | 'generating layout' | 'simulating' | 'playing'

export interface SessionState {
    globals: GlobalsType,
    globalsGeneratedOn: number,
    currentLayout: string | null,
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
        stepMax: number,
        name: string
    },
    sessionURL: string,
    websocketPort: string,
    headsets: {
        headsetID: string,
        connected: boolean
    }[],
    playmode: boolean
}

type ServerSimulator = {
    readonly apikey: string | null,
    username: string,
    params: Array<SimulatorParam<ParamType>>,
    title: string,
    state: 'disconnected' | 'idle' | 'generating' | 'connecting',
    valid: 'valid' | 'invalid' | 'unknown',
    validator: boolean
}

export type ParamType = 'boolean' | 'integer' | 'float' | 'string'

// Default type for simulator param based on ParamType
type ParamTypeToDefault<T extends ParamType> =
    T extends 'boolean' ? boolean :
    T extends 'integer' ? number :
    T extends 'float' ? number :
    T extends 'string' ? string :
    never

// Param type limits for simulator param based on ParamType
type ParamTypeToLimits<T extends ParamType> =
    T extends 'boolean' ? null :
    T extends 'integer' ? {min: number, max: number} :
    T extends 'float' ? {min: number, max: number} :
    T extends 'string' ? null :
    never

export interface SimulatorParam<T extends ParamType>
    {
        attribute: string,
        type: T,
        defaultValue: ParamTypeToDefault<T>,
        value: ParamTypeToDefault<T>,
        limits: ParamTypeToLimits<T>
    }

export interface Simulator {
    key: string | null,
    username: string,
    title: string,
    state: 'disconnected' | 'idle' | 'generating' | 'connecting',
    params: Array<SimulatorParam<ParamType>>,
    valid: 'valid' | 'invalid' | 'unknown',
    validator: boolean
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
            defaultValue: number,
            auto: boolean,
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
    | { attribute: 'all', value: MessageTypes.Message<'sendSessionState'>}
    | { attribute: 'username', value: string}
    | { attribute: 'state', value: ServerState}
    | { attribute: 'simulatorSettings', key: string, params: Array<SimulatorParam<ParamType>>}

export function SessionDataReducer(state: SessionState, action: SessionReducer): SessionState {
    switch (action.attribute) {
        case 'all':
            const message = action.value
            const payload = message.payload

            return {
                globals: payload.globals,
                globalsGeneratedOn: payload.globalsGeneratedOn,
                currentLayout: payload.currentLayout,
                userName: payload.users.filter((userData: {
                    userID: string, username: string
                }) => {
                    return userData.userID === message.receiverID
                })[0].username,
                users: payload.users.map((userData: {
                    userID: string, username: string, headsetCount: number
                }) => {
                    return {userName: userData.username, headsetCount: userData.headsetCount}
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
                simulators: payload.simulators.map((sim: ServerSimulator, index: number) => {
                    if (index >= state.simulators.length ||
                        (state.simulators[index].state === 'disconnected'
                            || state.simulators[index].state === 'connecting'
                            || state.simulators[index].state === 'generating'
                            || sim.state === 'disconnected')) {

                        console.log("HERE2")
                        console.log(typeof(sim.params))
                        return {
                            key: sim.apikey,
                            title: sim.title,
                            username: sim.username,
                            state: sim.state,
                            valid: 'unknown',
                            validator: sim.validator,
                            params: sim.params.map((param) => {

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
                    step: payload.simState.step,
                    stepMax: payload.simState.stepMax,
                    name: payload.simState.name,

                },
                playmode: payload.playmode
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
                    sim.params = action.params

                return sim
                })

            console.log(state.simulators)

            return {...state}
        default:
            return state
    }
}
