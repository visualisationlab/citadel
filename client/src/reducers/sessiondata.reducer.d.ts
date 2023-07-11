import { GlobalsType, MessageTypes } from "../components/router.component";
export declare type ServerState = 'disconnected' | 'idle' | 'generating layout' | 'simulating' | 'playing';
export interface SessionState {
    globals: GlobalsType;
    globalsGeneratedOn: number;
    currentLayout: string | null;
    userName: string;
    users: {
        userName: string;
        headsetCount: number;
    }[];
    expirationDate: Date;
    graphURL: string;
    sid: string;
    layouts: LayoutInfo[];
    state: ServerState;
    simulators: Simulator[];
    graphIndex: number;
    graphIndexCount: number;
    simState: {
        step: number;
        stepMax: number;
        name: string;
    };
    sessionURL: string;
    websocketPort: string;
    headsets: {
        headsetID: string;
        connected: boolean;
    }[];
    playmode: boolean;
}
export declare type ParamType = 'boolean' | 'integer' | 'float' | 'string';
declare type ParamTypeToDefault<T extends ParamType> = T extends 'boolean' ? boolean : T extends 'integer' ? number : T extends 'float' ? number : T extends 'string' ? string : never;
declare type ParamTypeToLimits<T extends ParamType> = T extends 'boolean' ? null : T extends 'integer' ? {
    min: number;
    max: number;
} : T extends 'float' ? {
    min: number;
    max: number;
} : T extends 'string' ? null : never;
export interface SimulatorParam<T extends ParamType> {
    attribute: string;
    type: T;
    defaultValue: ParamTypeToDefault<T>;
    value: ParamTypeToDefault<T>;
    limits: ParamTypeToLimits<T>;
}
export interface Simulator {
    key: string | null;
    username: string;
    title: string;
    state: 'disconnected' | 'idle' | 'generating' | 'connecting';
    params: Array<SimulatorParam<ParamType>>;
    valid: 'valid' | 'invalid' | 'unknown';
    validator: boolean;
}
declare type AvailableLayout = 'null' | 'random' | 'cose' | 'grid' | 'circle' | 'breadthfirst' | 'cose';
declare type LayoutSetting = {
    name: string;
    type: 'number';
    description: string;
    defaultValue: number;
    auto: boolean;
} | {
    name: string;
    type: 'boolean';
    description: string;
    defaultValue: boolean;
};
export interface LayoutInfo {
    name: AvailableLayout;
    description: string;
    link: string;
    settings: LayoutSetting[];
}
export declare type SessionReducer = {
    attribute: 'all';
    value: MessageTypes.Message<'sendSessionState'>;
} | {
    attribute: 'username';
    value: string;
} | {
    attribute: 'state';
    value: ServerState;
} | {
    attribute: 'simulatorSettings';
    key: string;
    params: Array<SimulatorParam<ParamType>>;
};
export declare function SessionDataReducer(state: SessionState, action: SessionReducer): SessionState;
export {};
