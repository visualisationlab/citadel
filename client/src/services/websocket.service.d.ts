import { MessageTypes } from '../components/router.component';
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
    name: string;
    description: string;
    link: string;
    settings: LayoutSetting[];
}
export declare type SimulatorState = 'disconnected' | 'idle' | 'generating' | 'connecting';
export declare type Simulator = {
    readonly apikey: string | null;
    readonly userID: string;
    socket: WebSocket;
    params: any;
    state: SimulatorState;
};
declare class WebsocketService {
    ws: WebSocket | null;
    checkConnection(): void;
    parseServerMessage<T extends keyof MessageTypes.MessageTypeMap>(message: MessageTypes.Message<T>): void;
    connect<T extends keyof MessageTypes.MessageTypeMap>(sid: string, username: string | null, keys: number | null): void;
    sendMessageToServer<T extends keyof MessageTypes.MessageTypeMap>(message: MessageTypes.Message<T>): void;
}
export declare const websocketService: WebsocketService;
export {};
