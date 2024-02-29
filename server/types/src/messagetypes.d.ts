import { LayoutSettings, AvailableLayout, LayoutInfo } from "./session.class";
import * as Types from 'shared';
export type ServerDataType = 'graphState' | 'sessionState' | 'layouts' | 'apiKey' | 'QR';
export type SetType = 'playstate' | 'graphState' | 'simulator' | 'stopSimulator' | 'simulatorInstance' | 'layout' | 'username' | 'graphIndex' | 'headset' | 'windowSize' | 'pan';
export type MessageTypeMap = {
    'registerSimulator': RegisterSimulatorPayload;
    'simulatorResponse': SimulatorDataPayload;
    'changeUsername': {
        username: string;
    };
    'pan': PanPayload;
    'removeSimulator': {
        apikey: string;
    };
    'changeWindowSize': WindowSizePayload;
    'getData': ServerDataType;
    'startSimulator': StartSimulatorPayload;
    'createSimulator': Record<string, never>;
    'stopSimulator': Record<string, never>;
    'sendSessionState': SessionStatePayload;
    'sendGlobals': {
        globals: Record<string, string | number | boolean>;
    };
    'sendGraphState': Types.Graph.BasicGraph;
    'headsetConnected': {
        headsetID: string;
        connected: boolean;
    };
    'simulatorData': SimulatorDataPayload;
    'setPlayState': {
        playState: boolean;
    };
    'generateLayout': {
        layout: LayoutSettings;
    };
    'setGraphState': Types.Graph.BasicGraph;
    'setSliceIndex': {
        index: number;
    };
    'addHeadset': object;
    'userInitialization': UserInitializationPayload;
    'setGlobal': {
        key: string;
        param: string;
        value: string;
    };
    'createTestSimulator': object;
};
type SimulatorDataPayload = {
    nodes: Types.Graph.BasicNode[];
    edges: Types.Graph.BasicEdge[];
    apikey: string;
    globals: {
        [key: string]: string | number | boolean;
    };
    params: Array<Types.Simulator.SimulatorParameter<Types.Simulator.SimulatorParameterType>>;
};
type StartSimulatorPayload = {
    stepCount: number;
    apiKey: string;
    params: Array<Types.Simulator.SimulatorParameter<Types.Simulator.SimulatorParameterType>>;
    name: string;
};
type WindowSizePayload = {
    width: number;
    height: number;
};
type PanPayload = {
    x: number;
    y: number;
    k: number;
};
type RegisterSimulatorPayload = {
    apikey: string;
    params: Array<Types.Simulator.SimulatorParameter<Types.Simulator.SimulatorParameterType>>;
    title: string;
    validator: boolean;
};
export interface Message<T extends keyof MessageTypeMap> {
    type: T;
    payload: MessageTypeMap[T];
    senderType: 'user' | 'simulator' | 'server' | 'headset';
    senderID: string;
    receiverType: 'user' | 'simulator' | 'server' | 'headset';
    receiverID: string;
    sessionID: string;
    timestamp: Date;
}
type UserInitializationPayload = {
    uid: string;
    data: string;
    keys: (string | null)[];
    sessionState: Types.SessionState;
};
type SessionStatePayload = {
    globals: {
        [key: string]: {
            [key: string]: string;
        };
    };
    globalsGeneratedOn: number;
    state: Types.SessionState;
    currentLayout: AvailableLayout | null;
    /** Session URL for sharing. */
    url: string;
    /** Session data origin. */
    sessionURL: string;
    /** Current index in dynamic graph. */
    graphIndex: number;
    /** Total number of graphs in dynamic graph. */
    graphIndexCount: number;
    users: {
        username: string;
        userID: string;
        headsetCount: number;
    }[];
    simulators: ServerSimulator[];
    headsets: {
        headsetID: string;
        connected: boolean;
    }[];
    simState: {
        /** The current simulation step. */
        step: number;
        /** The number of steps to calculate. */
        stepMax: number;
        /** Running sim name. */
        name: string;
    };
    /** Layout information for graph layout generation. */
    layoutInfo: LayoutInfo[];
    /** Time session expires. */
    expirationDate: Date;
    websocketPort: string;
    playmode: boolean;
};
type ServerSimulator = {
    readonly apikey: string | null;
    params: Array<Types.Simulator.SimulatorParameter<Types.Simulator.SimulatorParameterType>>;
    title: string;
    state: 'disconnected' | 'idle' | 'generating' | 'connecting';
    valid: 'valid' | 'invalid' | 'unknown';
    validator: boolean;
};
export {};
//# sourceMappingURL=messagetypes.d.ts.map