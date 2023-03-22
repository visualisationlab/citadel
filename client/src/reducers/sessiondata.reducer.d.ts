export declare type ServerState = 'disconnected' | 'idle' | 'generating layout' | 'simulating' | 'playing';
export interface SessionState {
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
    };
    sessionURL: string;
    websocketPort: string;
    headsets: {
        headsetID: string;
        connected: boolean;
    }[];
    playmode: false;
}
export declare type SimulatorParam = {
    attribute: string;
    type: 'boolean';
    defaultValue: boolean;
    value: boolean;
} | {
    attribute: string;
    type: 'integer' | 'float';
    defaultValue: number;
    value: number;
} | {
    attribute: string;
    type: 'string';
    defaultValue: string;
    value: string;
};
export interface Simulator {
    key: string | null;
    username: string;
    title: string;
    state: 'disconnected' | 'idle' | 'generating' | 'connecting';
    options: SimulatorParam[];
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
    value: any;
} | {
    attribute: 'username';
    value: string;
} | {
    attribute: 'state';
    value: ServerState;
} | {
    attribute: 'simulatorSettings';
    key: string;
    params: SimulatorParam[];
};
export declare function SessionDataReducer(state: SessionState, action: SessionReducer): SessionState;
export {};
