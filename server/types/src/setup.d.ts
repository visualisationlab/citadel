import { Logger } from 'winston';
import { Application } from 'express';
import winston from 'winston';
import { Session } from './session.class';
export interface Config {
    readonly checkInterval: number;
    readonly timeout: number;
    readonly localAddress: string;
    readonly defaultGraphURL: string | null;
    readonly websocketPort: number;
    readonly keyPath: string;
    readonly certPath: string;
    readonly serverPort: number;
    readonly clientPort: number;
}
declare module 'express-serve-static-core' {
    interface Response {
        graphs?: string[];
        root?: string;
    }
    interface Request {
        content: {
            url?: string;
        };
    }
}
export declare function configureExpressApp(app: Application, config: Config, sessions: Record<string, Session | null>, logger: winston.Logger, formatter: Intl.ListFormat): void;
export declare function configureWebsocketServer(server: any, logger: winston.Logger, sessions: Record<string, Session | null>): void;
export declare function setupLogger(): Logger;
export declare function loadEnvironmentVariables(logger: winston.Logger): Config;
//# sourceMappingURL=setup.d.ts.map