import { Attribute, AttributeType } from "../graph/Attribute";
export interface SimulatorState {
    startTime: Date;
    currentStep: number;
    steps: number;
    simulatorKey: string;
    userID: string;
    parameters: Record<string, Attribute<AttributeType>>;
}
//# sourceMappingURL=SimulatorState.d.ts.map