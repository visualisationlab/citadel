import { GraphDataState } from '../reducers/graphdata.reducer';
import { LayoutState } from '../reducers/layoutsettings.reducer';
import { SimulatorParam } from '../reducers/sessiondata.reducer';
export declare module API {
    function getUID(): string | null;
    function setSID(newSID: string): void;
    function setUserID(newUserID: string): void;
    function addSim(): void;
    function addHeadset(): void;
    function validate(apiKey: string): void;
    function step(stepCount: number, apiKey: string, params: SimulatorParam[]): void;
    function removeNode(nodeID: string, graphState: GraphDataState): void;
    function removeEdge(edgeID: string, graphState: GraphDataState): void;
    function updateGraph(graphState: GraphDataState): void;
    function updateUsername(name: string): void;
    function getInfo(): void;
    function getLayouts(): void;
    function setLayout(layout: LayoutState): void;
    function setGraphIndex(index: number): void;
    function setWindowSize(width: number, height: number): void;
    function setPan(x: number, y: number, k: number): void;
    function play(): void;
    function pause(): void;
    function sendPan(): void;
}
