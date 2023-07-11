/**
 * @author Miles van der Lely <m.vanderlely@uva.nl>
 *
 * This file contains the Session class, which is the main class of the server.
 *
 */
/// <reference types="node" />
/// <reference types="node" />
import { WebSocket } from 'ws';
import { Worker } from 'worker_threads';
import { Logger } from 'winston';
import { IncomingMessage } from 'http';
declare type SessionState = 'disconnected' | 'idle' | 'generating layout' | 'simulating' | 'playing';
declare type BasicNode = {
    id: string;
    position: {
        x: number;
        y: number;
    };
    [key: string]: any;
};
declare type BasicEdge = {
    id: string;
    source: string;
    target: string;
    [key: string]: any;
};
declare type BasicGraph = {
    nodes: BasicNode[];
    edges: BasicEdge[];
    globals: {
        [key: string]: any;
    };
};
export declare type ParamType = 'boolean' | 'integer' | 'float' | 'string';
declare type ParamTypeToDefault<T extends ParamType> = T extends 'boolean' ? boolean : T extends 'integer' ? number : T extends 'float' ? number : T extends 'string' ? string : never;
declare type ParamTypeToLimits<T extends ParamType> = T extends 'boolean' ? null : T extends 'integer' ? {
    min: number;
    max: number;
} : T extends 'float' ? {
    min: number;
    max: number;
} : T extends 'string' ? null : never;
declare type GlobalsType = {
    [key: string]: {
        [key: string]: string;
    };
};
export interface SimulatorParam<T extends ParamType> {
    attribute: string;
    type: T;
    defaultValue: ParamTypeToDefault<T>;
    value: ParamTypeToDefault<T>;
    limits: ParamTypeToLimits<T>;
}
export interface Simulator {
    key: string | null;
    userID: string;
    socket: WebSocket | null;
    title: string;
    state: 'disconnected' | 'idle' | 'generating' | 'connecting';
    params: Array<SimulatorParam<ParamType>>;
    valid: 'valid' | 'invalid' | 'unknown';
    validator: boolean;
}
export declare module MessageTypes {
    type ServerDataType = 'graphState' | 'sessionState' | 'layouts' | 'apiKey' | 'QR';
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
        'createSimulator': {};
        'stopSimulator': {};
        'sendSessionState': SessionStatePayload;
        'sendGlobals': {
            globals: {
                [key: string]: any;
            };
        };
        'sendGraphState': BasicGraph;
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
        'setGraphState': BasicGraph;
        'setSliceIndex': {
            index: number;
        };
        'addHeadset': {};
        'userInitialization': UserInitializationPayload;
        'setGlobal': {
            key: string;
            param: string;
            value: string;
        };
        'createTestSimulator': {};
    };
    type SimulatorDataPayload = {
        nodes: any;
        edges: any;
        apikey: string;
        globals: {
            [key: string]: any;
        };
        params: Array<SimulatorParam<ParamType>>;
    };
    type StartSimulatorPayload = {
        stepCount: number;
        apiKey: string;
        params: Array<SimulatorParam<ParamType>>;
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
        params: Array<SimulatorParam<ParamType>>;
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
        sessionState: SessionState;
    };
    type SessionStatePayload = {
        globals: GlobalsType;
        globalsGeneratedOn: number;
        state: SessionState;
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
        params: Array<SimulatorParam<ParamType>>;
        title: string;
        state: 'disconnected' | 'idle' | 'generating' | 'connecting';
        valid: 'valid' | 'invalid' | 'unknown';
        validator: boolean;
    };
    export {};
}
declare type AvailableLayout = 'null' | 'random' | 'cose' | 'grid' | 'circle' | 'breadthfirst' | 'cose' | 'fcose' | 'cise' | 'spread' | 'd3-force';
export declare type LayoutSetting = {
    name: string;
    description: string;
    type: 'number';
    defaultValue: number;
    auto: boolean;
} | {
    name: string;
    description: string;
    type: 'boolean';
    defaultValue: boolean;
};
export interface LayoutInfo {
    name: AvailableLayout;
    description: string;
    link: string;
    settings: LayoutSetting[];
}
declare type LayoutSettings = {
    name: AvailableLayout;
    randomize: boolean;
    settings: {
        name: string;
        value: number | boolean;
    }[];
};
export declare class Session {
    private readonly sessionID;
    private expirationDate;
    private readonly sourceURL;
    private readonly localAddress;
    private readonly websocketPort;
    private cy;
    private sessionState;
    private users;
    private simulators;
    private messageQueue;
    private readonly destroyFun;
    private globals;
    private globalsGeneratedOn;
    private simState;
    private graphHistory;
    private graphIndex;
    private logger;
    private playmode;
    private currentLayout;
    private cancelSim;
    private simRunID;
    constructor(sid: string, destroyFun: (sid: string) => void, sourceURL: string, nodes: {
        [key: string]: any;
    }[], edges: {
        [key: string]: any;
    }[], globals: {
        [key: string]: {
            [key: string]: any;
        };
    }, localAddress: string, websocketPort: string, logger: Logger);
    private setState;
    private changeGraphState;
    private storeCurrentGraphState;
    private appendGraphState;
    private time;
    private loadGraphState;
    private handleRegisterSimulatorMessage;
    private handleSimulatorDataMessage;
    private parseSimulatorMessage;
    private parseGetMessage;
    private handlePlayStateMessage;
    private handleChangeUsernameMessage;
    private handleStartSimulator;
    layoutTimer(resolve: any, worker: Worker, signal: AbortSignal): Promise<void>;
    setLayout(settings: LayoutSettings): Promise<unknown>;
    private processMessage;
    private getMessage;
    addMessage<Type extends keyof MessageTypes.MessageTypeMap>(message: MessageTypes.Message<Type>): void;
    private pruneSessions;
    removeHeadset(headsetKey: string): void;
    private sendMessage;
    private sendGraphState;
    runDummySimulator(message: MessageTypes.Message<'simulatorData'>): void;
    sendSimulatorMessage(): void;
    private getSimulatorInfo;
    private sendSessionState;
    private sendPanState;
    registerSimulator(apiKey: string, socket: WebSocket): void;
    registerHeadset(headsetKey: string, userID: string, socket: WebSocket): void;
    deRegisterSimulator(apiKey: string): void;
    addUser(socket: WebSocket, username: string | null, keys: number, req: IncomingMessage): string;
    getKeys(userID: string): (string | null)[];
    removeUser(userID: string): void;
    private parseJson;
    extendExpirationDate(): void;
    hasExpired(): boolean;
    destroy(): void;
}
export {};
