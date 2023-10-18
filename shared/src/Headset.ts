import WebSocket from 'ws'

export interface Headset {
    readonly headsetID: string,
    socket: WebSocket | null,
    type: string,
    name: string,
    description: string,
}