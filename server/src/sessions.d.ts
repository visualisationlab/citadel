import cytoscape from 'cytoscape';
import { ClientMessage, ServerMessage, APIMessage } from './socket';
export declare module Session {
    export interface SimInfo {
        step: number;
        stepCount: number;
        startParams: {
            [key: string]: number;
        };
    }
    export interface SessionInfo {
        sid: string;
        expirationDate: Date;
        graphURL: string;
    }
    export type LayoutSettings = {
        name: string;
        settings: {
            [key: string]: number | boolean;
        };
    };
    type SessionData = {
        cy: cytoscape.Core;
        info: SessionInfo;
        simInfo: SimInfo | null;
        layoutSettings: LayoutSettings;
    };
    export function getSessionData(sid: string): SessionData | null;
    export function getGraphData(sid: string): {
        nodes: any;
        edges: any;
    } | null;
    export function getInfo(sid: string): SessionInfo | null;
    export function getLayouts(): any;
    export function registerSim(sid: string, startParams: {
        [key: string]: number;
    }): void;
    export function parseAPIMessage(message: APIMessage): ServerMessage | null;
    export function parseUserMessage(message: ClientMessage): ServerMessage | null;
    export function checkSessions(): void;
    export function genSession(url: string, fun: (sid: string) => void): void;
    export {};
}
