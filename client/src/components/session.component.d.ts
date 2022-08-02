/// <reference types="react" />
import './home.component.css';
interface SessionTabProps {
    userName: string;
    users: string[];
    expirationDate: Date;
    graphURL: string;
    sid: string;
}
export default function SessionTab(props: SessionTabProps): JSX.Element;
export {};
