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
    export type GetType = 'graphState' | 'sessionState' | 'layouts' | 'apiKey' | 'QR';
    export type SetType = 'playstate' | 'graphState' | 'simulator' | 'stopSimulator' | 'simulatorInstance' | 'layout' | 'username' | 'graphIndex' | 'headset' | 'windowSize' | 'pan';
    type MessageTypeMap = Record<'registerSimulator' | 'simulatorResponse' | 'changeUserame' | 'pan' | 'removeSimulator', RegisterSimulatorPayload | SimulatorDataPayload | {
        username: string;
    } | PanPayload | {
        apikey: string;
    }>;
    type PanPayload = {
        x: number;
        y: number;
        k: number;
    };
    type RegisterSimulatorPayload = {
        apikey: string;
        params: SimulatorParam[];
    };
    type SimulatorDataPayload = {
        nodes: any;
        edges: any;
        globals: any;
        params: any;
        apikey: string;
    };
    export interface Message<T extends keyof MessageTypeMap> {
        type: T;
        payload: MessageTypeMap[T];
        senderID: string;
        receiverID: string;
        sessionID: string;
        timestamp: Date;
    }
    export interface OutMessage {
        sessionID: string;
        sessionState: SessionState;
        type: 'data' | 'session' | 'uid' | 'headset' | 'pan';
    }
    export interface InMessage {
        sessionID: string;
        userID: string;
        messageSource: 'simulator' | 'user';
        messageType: 'get' | 'set' | 'remove';
        apiKey?: string;
        data?: any;
        dataType?: any;
        title?: string;
        validator?: boolean;
    }
    export interface GetMessage extends InMessage {
        messageSource: 'user';
        messageType: 'get';
        userID: string;
        dataType: GetType;
    }
    export interface SetMessage extends InMessage {
        messageSource: 'user';
        messageType: 'set';
        userID: string;
        dataType: SetType;
        params: any;
    }
    export interface SetWindowSizeMessage extends InMessage {
        messageSource: 'user';
        messageType: 'set';
        userID: string;
        dataType: 'windowSize';
        params: {
            width: number;
            height: number;
        };
    }
    export interface SetSimulatorMessage extends InMessage {
        messageSource: 'user';
        messageType: 'set';
        userID: string;
        dataType: 'simulator';
        params: {
            stepCount: number;
            apiKey: string;
            name: string;
        };
    }
    export interface SetSimulatorInstanceMessage extends InMessage {
        messageSource: 'user';
        messageType: 'set';
        userID: string;
        dataType: 'simulatorInstance';
    }
    type ServerSimulator = {
        readonly apikey: string | null;
        username: string;
        params: SimulatorParam[];
        title: string;
        state: 'disconnected' | 'idle' | 'generating' | 'connecting';
    };
    export interface SessionStateMessage extends OutMessage {
        userID: string;
        type: 'session';
        data: {
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
    }
    export interface DataStateMessage extends OutMessage {
        type: 'data';
        data: BasicGraph;
    }
    export interface HeadsetConnectedMessage extends OutMessage {
        type: 'headset';
    }
    export interface SimulatorSetMessage extends OutMessage {
        type: 'data';
        data: {
            nodes: any;
            edges: any;
            globals: {
                [key: string]: any;
            };
            params: SimulatorParam[];
        };
    }
    export interface UIDMessage extends OutMessage {
        type: 'uid';
        data: string;
        keys: (string | null)[];
    }
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
    private parseSimulatorMessage;
    private parseGetMessage;
    private parseSetMessage;
    private parseRemoveMessage;
    private parseUserMessage;
    layoutTimer(resolve: any, worker: Worker, signal: AbortSignal): Promise<void>;
    setLayout(settings: LayoutSettings): Promise<unknown>;
    private processMessage;
    private getMessage;
    addMessage(message: MessageTypes.InMessage): void;
    private pruneSessions;
    removeHeadset(headsetKey: string): void;
    private sendGraphState;
    sendSimulatorMessage(): void;
    private getSimulatorInfo;
    private sendHeadsetConnectedMessage;
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
