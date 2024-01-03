import { Attribute, AttributeType } from "./Attribute";
export interface BasicEdge {
    id: string;
    source: string;
    target: string;
    attributes: Record<string, Attribute<AttributeType>>;
}
//# sourceMappingURL=BasicEdge.d.ts.map