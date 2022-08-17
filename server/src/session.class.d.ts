/// <reference types="node" />
import { WebSocket } from 'ws';
import { Worker } from 'worker_threads';
declare type SessionState = 'idle' | 'busy';
declare type SimulatorParam = {
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
    export interface OutMessage {
        sessionID: string;
        sessionState: SessionState;
        type: 'data' | 'session' | 'uid';
    }
    export interface InMessage {
        sessionID: string;
        userID: string;
        messageSource: 'simulator' | 'user';
        messageType: 'get' | 'set';
        apiKey?: string;
        data?: any;
        dataType?: any;
        title?: string;
    }
    export interface RegisterSimulatorMessage extends InMessage {
        sessionID: string;
        messageSource: 'simulator';
        messageType: 'set';
        dataType: 'register';
        apiKey: string;
        params: SimulatorParam[];
    }
    export interface SimulatorDataMessage extends InMessage {
        sessionID: string;
        messageSource: 'simulator';
        messageType: 'set';
        dataType: 'data';
        apiKey: string;
        params: {
            nodes: any;
            edges: any;
            params: any;
        };
    }
    export type GetType = 'graphState' | 'sessionState' | 'layouts' | 'apiKey' | 'QR';
    export type SetType = 'graphState' | 'simulator' | 'simulatorInstance' | 'layout' | 'username' | 'graphIndex';
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
    export interface SetUsernameMessage extends InMessage {
        messageSource: 'user';
        messageType: 'set';
        userID: string;
        dataType: 'username';
        params: {
            username: string;
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
            url: string;
            graphIndex: number;
            graphIndexCount: number;
            users: {};
            simulators: ServerSimulator[];
            simState: {
                step: number;
                stepMax: number;
            };
            layoutInfo: LayoutInfo[];
            expirationDate: Date;
        };
    }
    export interface DataStateMessage extends OutMessage {
        type: 'data';
        data: {
            nodes: any;
            edges: any;
        };
    }
    export interface SimulatorSetMessage extends OutMessage {
        type: 'data';
        data: {
            nodes: any;
            edges: any;
            params: SimulatorParam[];
        };
    }
    export interface UIDMessage extends OutMessage {
        type: 'uid';
        data: string;
    }
    export {};
}
declare type AvailableLayout = 'null' | 'random' | 'cose' | 'grid' | 'circle' | 'breadthfirst' | 'cose' | 'fcose' | 'cola' | 'cise' | 'spread' | 'd3-force';
export declare type LayoutSetting = {
    name: string;
    description: string;
    type: 'number';
    defaultValue: number;
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
    name: string;
    settings: {
        [key: string]: number | boolean;
    };
};
export declare class Session {
    private readonly sourceURL;
    private readonly sessionID;
    private readonly localAddress;
    private expirationDate;
    private cy;
    private sessionState;
    private users;
    private simulators;
    private messageQueue;
    private readonly destroyFun;
    private simState;
    private graphHistory;
    private graphIndex;
    constructor(sid: string, destroyFun: (sid: string) => void, sourceURL: string, nodes: {
        [key: string]: any;
    }[], edges: {
        [key: string]: any;
    }[], localAddress: string);
    private setState;
    private storeCurrentGraphState;
    private appendGraphState;
    private loadGraphState;
    private parseSimulatorMessage;
    private parseGetMessage;
    private parseSetMessage;
    private parseUserMessage;
    layoutTimer(resolve: any, worker: Worker, signal: AbortSignal): Promise<void>;
    setLayout(settings: LayoutSettings): Promise<unknown>;
    private processMessage;
    private getMessage;
    addMessage(message: MessageTypes.InMessage): void;
    private pruneSessions;
    private sendGraphState;
    sendSimulatorMessage(): void;
    private getSimulatorInfo;
    private sendSessionState;
    registerSimulator(apiKey: string, socket: WebSocket): void;
    deRegisterSimulator(apiKey: string): void;
    addUser(socket: WebSocket): string;
    removeUser(userID: string): void;
    private parseJson;
    extendExpirationDate(): void;
    hasExpired(): boolean;
    destroy(): void;
}
export {};
