export type SimulatorParameterType = 'boolean' | 'integer' | 'float' | 'string'

import { Attribute, AttributeType } from "../graph/Attribute"
import WebSocket from 'ws'

// Default type for simulator param based on ParamType
type ParameterTypeToDefault<T extends SimulatorParameterType> =
    T extends 'string' ? string :
    T extends 'boolean' ? boolean :
    T extends 'integer' ? number :
    T extends 'float' ? number :
    never

// Param type limits for simulator param based on ParamType
type ParamTypeToLimits<T extends SimulatorParameterType> =
    T extends 'boolean' ? undefined :
    T extends 'integer' ? {min?: number, max?: number} :
    T extends 'float' ? {min?: number, max?: number} :
    T extends 'string' ? undefined :
    never

export interface SimulatorParameter<T extends SimulatorParameterType> {
    attribute: string,
    type: T,
    value: ParameterTypeToDefault<T>,
    defaultValue: ParameterTypeToDefault<T>,
    limits?: ParamTypeToLimits<T>,
    description?: string,
}

export interface Simulator {
    key: string,
    socket: WebSocket | null,
    title: string,
    state: 'disconnected' | 'idle' | 'generating' | 'connecting',
    parameters: Record<string, Attribute<AttributeType>>,
    valid: 'valid' | 'invalid' | 'unknown',
    validator: boolean,
    description: string,
}

export function createSimulatorParameter<T extends AttributeType>(
    parameter: Attribute<T>
  ): Attribute<T> {
    return {
      ...parameter,
    }
}