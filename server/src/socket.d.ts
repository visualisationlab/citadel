/// <reference types="node" />
import { WebSocket, RawData } from 'ws';
import { IncomingMessage } from 'http';
export interface ClientMessage {
    type: 'set' | 'get';
    sid: string;
    contents: Object;
}
export interface APIMessage {
    sid: string;
    nodes: JSON;
    edges: JSON;
    params: {
        [key: string]: number;
    };
}
export interface GetMessage {
    type: 'get';
    sid: string;
    contents: {
        attribute: 'info' | 'layouts';
    };
}
export interface SetMessage {
    type: 'set';
    sid: string;
    contents: {
        attribute: 'layout' | 'data' | 'sim';
        value: any;
    };
}
export interface ServerMessage {
    type: 'data' | 'info' | 'layouts';
    contents: Object;
}
export declare const server: import("ws").Server<WebSocket>;
export declare function genSocketSession(sid: string): void;
export declare function closeSession(sid: string): void;
export declare function sendAPIMessage(message: APIMessage, key: string, sid: string): void;
export declare function sendMessage(message: ServerMessage, sid: string): void;
export declare function onOpen(socket: WebSocket, req: IncomingMessage): ('user' | 'api' | null);
export declare function onClose(socket: WebSocket, req: IncomingMessage, code: number, reason: Buffer): void;
export declare function onMessage(socket: WebSocket, type: 'user' | 'api', data: RawData, isBinary: boolean): void;
export declare function onError(socket: WebSocket, req: IncomingMessage, err: Error): void;
