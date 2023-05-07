import { MessageTypes } from '../components/router.component';
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
export type SimulatorState = 'disconnected' | 'idle' | 'generating' | 'connecting';
export type Simulator = {
    readonly apikey: string | null;
    readonly userID: string;
    socket: WebSocket;
    params: any;
    state: SimulatorState;
};
declare class WebsocketService {
    ws: WebSocket | null;
    checkConnection(): void;
    parseServerMessage(message: MessageTypes.OutMessage): void;
    connect(sid: string, username: string | null, keys: number | null): void;
    sendSetMessage(message: MessageTypes.SetMessage): void;
    sendGetMessage(message: MessageTypes.GetMessage): void;
    sendRemoveMessage(message: MessageTypes.RemoveMessage): void;
}
export declare const websocketService: WebsocketService;
export {};
