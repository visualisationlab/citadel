/// <reference types="react" />
import './home.component.css';
export interface Simulator {
    id: string;
    generating: boolean;
    options: {
        [key: string]: string;
    };
}
interface SimulatorTabProps {
    simulators: Simulator[];
}
export declare function SimulatorTab(props: SimulatorTabProps): JSX.Element;
export {};
