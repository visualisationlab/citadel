import { Dispatch } from 'react';
import { ServerState, SessionReducer, SimulatorParam } from '../reducers/sessiondata.reducer';
import { MessageTypes } from '../services/websocket.service';
import { GraphDataReducerAction } from '../reducers/graphdata.reducer';
interface RouterProps {
    sessionDataDispatch: Dispatch<SessionReducer>;
    graphDataDispatch: Dispatch<GraphDataReducerAction>;
}
export declare module Router {
    function setup(props: RouterProps): void;
    function route(message: MessageTypes.OutMessage): void;
    function setState(state: ServerState): void;
    function setSimulatorSettings(key: string, params: SimulatorParam[]): void;
}
export {};
