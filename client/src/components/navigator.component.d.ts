/// <reference types="react" />
import { Simulator } from '../reducers/sessiondata.reducer';
import './home.component.css';
interface NavigatorProps {
    simulators: Simulator[];
}
export default function Navigator(props: NavigatorProps): JSX.Element;
export {};
