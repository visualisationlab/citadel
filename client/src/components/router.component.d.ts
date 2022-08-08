import { Dispatch } from 'react';
import { SessionReducer } from '../reducers/sessiondata.reducer';
import { ServerMessage } from '../services/websocket.service';
import { GraphDataReducerAction } from '../reducers/graphdata.reducer';
interface RouterProps {
    sessionDataDispatch: Dispatch<SessionReducer>;
    graphDataDispatch: Dispatch<GraphDataReducerAction>;
}
export declare module Router {
    function setup(props: RouterProps): void;
    function route(message: ServerMessage): void;
}
export {};
