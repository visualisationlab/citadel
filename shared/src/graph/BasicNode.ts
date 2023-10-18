import { Attribute, AttributeType } from "./Attribute"

export interface BasicNode {
    id: string,
    position: {
        x: number,
        y: number
    },
    attributes: Record<string, Attribute<AttributeType>>
}
