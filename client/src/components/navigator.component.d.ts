/// <reference types="react" />
import { Simulator } from './simulate.component';
import './home.component.css';
interface NavigatorProps {
    userName: string;
    users: string[];
    expirationDate: Date;
    graphURL: string;
    sid: string;
    simulators: Simulator[];
}
export default function Navigator(props: NavigatorProps): JSX.Element;
export {};
