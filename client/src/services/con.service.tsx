const URL = process.env.REACT_APP_WSURL + ':' +
    process.env.REACT_APP_WEBSOCKETPORT;

// const URL = process.env['REACT_APP_WSURL'] + ':' +
//     process.env['REACT_APP_WEBSOCKETPORT'];

export class ClientSocket {
    ws: WebSocket = new WebSocket(URL);

    constructor() {
        console.log('HERE')
    }
}

// export const con = new ClientSocket()
