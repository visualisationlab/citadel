/// <reference types="react" />
import './home.component.css';
import { Simulator } from '../reducers/sessiondata.reducer';
interface SimulatorTabProps {
    simulators: Simulator[];
}
export declare function SimulatorTab(props: SimulatorTabProps): JSX.Element;
export {};
