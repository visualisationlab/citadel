export type SimulatorMessageType = 'info' | 'error' | 'warning' | 'success'

export interface SimulatorMessage {
    type: SimulatorMessageType,
    message: string,
    time: number,
}