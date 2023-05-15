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
type SessionState = 'disconnected' | 'idle' | 'generating layout' | 'simulating' | 'playing';
type BasicNode = {
    id: string;
    position: {
        x: number;
        y: number;
    };
    [key: string]: any;
};
type BasicEdge = {
    id: string;
    source: string;
    target: string;
    [key: string]: any;
};
type BasicGraph = {
    nodes: BasicNode[];
    edges: BasicEdge[];
    globals: {
        [key: string]: any;
    };
};
type SimulatorParam = {
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
        'sendSessionState': SessionStatePayload;
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
    };
    type SimulatorDataPayload = {
        nodes: any;
        edges: any;
        apikey: string;
        globals: {
            [key: string]: any;
        };
        params: SimulatorParam[];
    };
    type StartSimulatorPayload = {
        stepCount: number;
        apiKey: string;
        params: SimulatorParam[];
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
        params: SimulatorParam[];
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
    type SessionStatePayload = {
        state: SessionState;
        currentLayout: AvailableLayout | null;
        url: string;
        sessionURL: string;
        graphIndex: number;
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
            step: number;
            stepMax: number;
            name: string;
        };
        layoutInfo: LayoutInfo[];
        expirationDate: string;
        websocketPort: string;
        playmode: boolean;
    };
    type ServerSimulator = {
        readonly apikey: string | null;
        username: string;
        params: SimulatorParam[];
        title: string;
        state: 'disconnected' | 'idle' | 'generating' | 'connecting';
    };
    export {};
}
type AvailableLayout = 'null' | 'random' | 'cose' | 'grid' | 'circle' | 'breadthfirst' | 'cose' | 'fcose' | 'cise' | 'spread' | 'd3-force';
export type LayoutSetting = {
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
type LayoutSettings = {
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
        [key: string]: any;
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
    private parseSetMessage;
    private parseRemoveMessage;
    private parseUserMessage;
    layoutTimer(resolve: any, worker: Worker, signal: AbortSignal): Promise<void>;
    setLayout(settings: LayoutSettings): Promise<unknown>;
    private processMessage;
    private getMessage;
    addMessage<Type extends keyof MessageTypes.MessageTypeMap>(message: MessageTypes.Message<Type>): void;
    private pruneSessions;
    removeHeadset(headsetKey: string): void;
    private sendMessage;
    private sendGraphState;
    sendSimulatorMessage(): void;
    private getSimulatorInfo;
    private sendHeadsetState;
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
