/**
 * @author Miles van der Lely <m.vanderlely@uva.nl>
 *
 * This file contains the Session class, which is the main class of the server.
 *
 */
/// <reference types="node" />
import { WebSocket } from 'ws';
import { Worker } from 'worker_threads';
import { Logger } from 'winston';
type SessionState = 'idle' | 'busy';
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
    export type SetType = 'playstate' | 'graphState' | 'simulator' | 'simulatorInstance' | 'layout' | 'username' | 'graphIndex' | 'headset' | 'windowSize' | 'pan';
    export interface OutMessage {
        sessionID: string;
        sessionState: SessionState;
        type: 'data' | 'session' | 'uid' | 'headset' | 'pan';
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
        validator?: boolean;
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
    export interface PanStateMessage extends OutMessage {
        userID: string;
        type: 'pan';
        data: {
            x: number;
            y: number;
            k: number;
        };
    }
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
            };
            layoutInfo: LayoutInfo[];
            expirationDate: string;
            websocketPort: string;
            playmode: boolean;
        };
    }
    export interface DataStateMessage extends OutMessage {
        type: 'data';
        data: {
            nodes: any;
            edges: any;
        };
    }
    export interface HeadsetConnectedMessage extends OutMessage {
        type: 'headset';
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
type AvailableLayout = 'null' | 'random' | 'cose' | 'grid' | 'circle' | 'breadthfirst' | 'cose' | 'fcose' | 'cola' | 'cise' | 'spread' | 'd3-force';
export type LayoutSetting = {
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
    private simState;
    private graphHistory;
    private graphIndex;
    private logger;
    private playmode;
    private currentLayout;
    constructor(sid: string, destroyFun: (sid: string) => void, sourceURL: string, nodes: {
        [key: string]: any;
    }[], edges: {
        [key: string]: any;
    }[], localAddress: string, websocketPort: string, logger: Logger);
    private setState;
    private changeGraphState;
    private storeCurrentGraphState;
    private appendGraphState;
    private time;
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
    addUser(socket: WebSocket): string;
    removeUser(userID: string): void;
    private parseJson;
    extendExpirationDate(): void;
    hasExpired(): boolean;
    destroy(): void;
}
export {};
