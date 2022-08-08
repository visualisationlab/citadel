declare type Request = 'info';
interface ClientMessage {
    type: 'transform' | 'get' | 'set';
    sid: string;
    contents: Object;
}
export interface ServerMessage {
    type: 'data' | 'info' | 'layouts';
    contents: Object;
}
interface TransformMessage extends ClientMessage {
    type: 'transform';
    contents: {
        x: number;
        y: number;
        k: number;
    };
}
interface RequestMessage extends ClientMessage {
    type: 'get';
    contents: {
        type: Request;
    };
}
declare class WebsocketService {
    ws: WebSocket | null;
    checkConnection(): void;
    parseServerMessage(message: ServerMessage): void;
    connect(sid: string): void;
    sendMessage(message: ClientMessage): void;
    requestInfo(message: RequestMessage): void;
    updateTransform(message: TransformMessage): void;
}
export declare const websocketService: WebsocketService;
export {};
