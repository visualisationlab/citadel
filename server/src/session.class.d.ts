import { WebSocket } from 'ws';
declare type SessionState = 'idle' | 'busy';
declare type Simulator = {
    readonly apikey: string | null;
    readonly userID: string;
    socket: WebSocket;
    params: any;
    state: 'disconnected' | 'idle' | 'generating';
};
export declare module MessageTypes {
    type CloseReason = {
        code: 1001;
        reason: 'Session end';
    } | {
        code: 1002;
        reason: 'Protocol error';
    } | {
        code: 1003;
        reason: 'Unsupported data';
    } | {
        code: 1004;
        reason: 'Session timeout';
    };
    interface OutMessage {
        sessionID: string;
        sessionState: SessionState;
        type: 'data' | 'session';
    }
    interface InMessage {
        sessionID: string;
        userID: string;
        messageSource: 'simulator' | 'user';
        messageType: 'get' | 'set';
        apiKey?: string;
        data?: any;
        dataType?: any;
    }
    interface SimulatorMessage {
        sessionID: string;
        apiKey: string;
        messageSource: 'simulator';
        data: {
            nodes: any;
            edges: any;
            params: any;
        };
    }
    type GetType = 'graphState' | 'sessionState' | 'layouts' | 'apiKey' | 'QR';
    type SetType = 'graphState' | 'simulator' | 'layout' | 'username';
    interface GetMessage extends InMessage {
        messageSource: 'user';
        messageType: 'get';
        userID: string;
        dataType: GetType;
    }
    interface SetMessage extends InMessage {
        messageSource: 'user';
        messageType: 'set';
        userID: string;
        dataType: SetType;
        params: any;
    }
    interface SessionStateMessage extends OutMessage {
        userID: string;
        type: 'session';
        data: {
            url: string;
            users: {};
            simulators: Simulator[];
            layoutInfo: LayoutInfo[];
        };
    }
    interface DataStateMessage extends OutMessage {
        type: 'data';
        data: {
            nodes: any;
            edges: any;
        };
    }
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
export declare class Session {
    private readonly URL;
    private readonly sessionID;
    private expirationDate;
    private cy;
    private sessionState;
    private users;
    private simulators;
    private messageQueue;
    private readonly destroyFun;
    constructor(sid: string, destroyFun: (sid: string) => void, url: string, nodes: {
        [key: string]: any;
    }[], edges: {
        [key: string]: any;
    }[]);
    private setState;
    private parseSimulatorMessage;
    private parseGetMessage;
    private parseUserMessage;
    private processMessage;
    private getMessage;
    addMessage(message: MessageTypes.InMessage): void;
    private pruneSessions;
    private sendGraphState;
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
