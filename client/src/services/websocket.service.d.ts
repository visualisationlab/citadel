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
    name: string;
    description: string;
    link: string;
    settings: LayoutSetting[];
}
type Simulator = {
    readonly apikey: string | null;
    readonly userID: string;
    socket: WebSocket;
    params: any;
    state: 'disconnected' | 'idle' | 'generating';
};
export declare module MessageTypes {
    type SessionState = 'idle' | 'busy';
    export type CloseReason = {
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
    export interface OutMessage {
        sessionID: string;
        sessionState: SessionState;
        type: 'data' | 'session' | 'uid' | 'headset';
    }
    export interface InMessage {
        sessionID: string;
        userID: string;
        messageSource: 'simulator' | 'user';
        messageType: 'get' | 'set';
        apiKey?: string;
        data?: any;
        dataType?: any;
    }
    export interface SimulatorMessage {
        sessionID: string;
        apiKey: string;
        messageSource: 'simulator';
        data: {
            nodes: any;
            edges: any;
            params: any;
        };
    }
    export type GetType = 'graphState' | 'sessionState' | 'layouts' | 'apiKey' | 'QR';
    export type SetType = 'graphState' | 'simulator' | 'simulatorInstance' | 'playstate' | 'layout' | 'username' | 'graphIndex' | 'headset' | 'windowSize' | 'pan' | 'validate';
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
    export interface SetSimulatorMessage extends InMessage {
        messageSource: 'user';
        messageType: 'set';
        userID: string;
        dataType: 'simulator';
        params: {
            stepCount: number;
            apikey: string;
        };
    }
    export interface SetSimulatorInstanceMessage extends InMessage {
        messageSource: 'user';
        messageType: 'set';
        userID: string;
        dataType: 'simulatorInstance';
    }
    export interface SessionStateMessage extends OutMessage {
        userID: string;
        type: 'session';
        data: {
            url: string;
            users: {};
            simulators: Simulator[];
            layoutInfo: LayoutInfo[];
        };
    }
    export interface DataStateMessage extends OutMessage {
        type: 'data';
        data: {
            nodes: any;
            edges: any;
        };
    }
    export interface UIDMessage extends OutMessage {
        type: 'uid';
        data: string;
    }
    export {};
}
declare class WebsocketService {
    ws: WebSocket | null;
    checkConnection(): void;
    parseServerMessage(message: MessageTypes.OutMessage): void;
    connect(sid: string): void;
    sendSetMessage(message: MessageTypes.SetMessage): void;
    sendGetMessage(message: MessageTypes.GetMessage): void;
}
export declare const websocketService: WebsocketService;
export {};
