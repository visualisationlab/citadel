"use strict";
// const URL = process.env.REACT_APP_WSURL + ':' +
//     process.env.REACT_APP_WEBSOCKETPORT;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientSocket = void 0;
const URL = process.env.REACT_APP_WSURL + ':' +
    process.env.REACT_APP_WEBSOCKETPORT;
class ClientSocket {
    constructor() {
        this.ws = new WebSocket(URL);
        console.log('HERE');
    }
}
exports.ClientSocket = ClientSocket;
// export const con = new ClientSocket()
