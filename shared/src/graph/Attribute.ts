export type AttributeType = 'string' | 'integer' | 'float' | 'boolean'

export type AttributeValue<T extends AttributeType> =
    T extends 'string' ? string
    : T extends 'integer' ? number
    : T extends 'float' ? number
    : T extends 'boolean' ? boolean
    : never

export type Attribute<T extends AttributeType> =
    T extends 'float' | 'integer' ? {
        type: T,
        value: number,
        description?: string,
        default: number,
        min?: number,
        max?: number,
    }
    : T extends 'string' | 'boolean' ? {
        type: T,
        value: AttributeValue<T>,
        description?: string,
        default: AttributeValue<T>
    }
    : never