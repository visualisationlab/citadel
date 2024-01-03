import { Headset } from "./Headset";
import { Simulator } from "./simulator/Simulator";
import WebSocket from 'ws';
export interface User {
    readonly userID: string;
    socket: WebSocket;
    username: string;
    simulators: Simulator[];
    headsets: Headset[];
    screenWidth: number;
    screenHeight: number;
    panX: number;
    panY: number;
    panK: number;
}
//# sourceMappingURL=User.d.ts.map