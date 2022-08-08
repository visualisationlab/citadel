import { GraphDataState } from '../reducers/graphdata.reducer';
import { LayoutState } from '../reducers/layoutsettings.reducer';
export declare module API {
    function setSID(newSID: string): void;
    function step(): void;
    function updateGraph(graphState: GraphDataState): void;
    function updateUsername(name: string): void;
    function getInfo(): void;
    function getLayouts(): void;
    function setLayout(layout: LayoutState): void;
}
