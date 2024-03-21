/**
 * @author Miles van der Lely <m.vanderlely@uva.nl>
 *
 * This file contains the Session class, which is the main class of the server.
 *
 */
/// <reference types="node" />
/// <reference types="node" />
import WebSocket from 'ws';
import { Worker } from 'worker_threads';
import { Logger } from 'winston';
import { IncomingMessage } from 'http';
import * as MessageTypes from './messagetypes';
import * as Types from 'shared';
export type AvailableLayout = 'null' | 'random' | 'cose' | 'grid' | 'circle' | 'breadthfirst' | 'fcose' | 'euler';
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
export interface LayoutSettings {
    name: AvailableLayout;
    randomize: boolean;
    settings: {
        name: string;
        value: number | boolean;
    }[];
}
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
    private globalsGeneratedOn;
    private simState;
    private graphHistory;
    private latestLayout;
    private graphIndex;
    private logger;
    private playmode;
    private currentLayout;
    private cancelSim;
    private simRunID;
    constructor(sid: string, destroyFun: (sid: string) => void, sourceURL: string, graph: Types.Graph.BasicGraph, localAddress: string, websocketPort: string, logger: Logger, globals: Record<string, Types.Graph.Attribute<Types.Graph.AttributeType>>);
    private setState;
    private changeGraphState;
    private storeCurrentGraphState;
    private appendGraphState;
    private time;
    private parseJson;
    private loadGraphState;
    private handleRegisterSimulatorMessage;
    private triggerSimStep;
    private handleSimulatorDataMessage;
    private parseSimulatorMessage;
    private parseGetMessage;
    private handlePlayStateMessage;
    private handleChangeUsernameMessage;
    private handleStartSimulator;
    layoutTimer(resolve: (resolveMessage: string) => void, worker: Worker, signal: AbortSignal): Promise<void>;
    setLayout(settings: LayoutSettings): Promise<unknown>;
    private processMessage;
    private getMessage;
    addMessage<Type extends keyof MessageTypes.MessageTypeMap>(message: MessageTypes.Message<Type>): void;
    private pruneSessions;
    removeHeadset(headsetKey: string): void;
    private sendMessage;
    private sendGraphState;
    runDummySimulator(message: MessageTypes.Message<'simulatorData'>): void;
    sendSimulatorMessage(): void;
    private getSimulatorInfo;
    private sendSessionState;
    private sendPanState;
    registerSimulator(apiKey: string, socket: WebSocket): void;
    registerHeadset(headsetKey: string, userID: string, socket: WebSocket): void;
    deRegisterSimulator(apiKey: string): void;
    addUser(socket: WebSocket, username: string | null, keys: number, req: IncomingMessage): string;
    getKeys(userID: string): any[];
    removeUser(userID: string): void;
    extendExpirationDate(): void;
    hasExpired(): boolean;
    destroy(): void;
}
//# sourceMappingURL=session.class.d.ts.map