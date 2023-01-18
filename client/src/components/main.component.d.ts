import React from 'react';
import './home.component.css';
import { SessionState, SessionReducer } from '../reducers/sessiondata.reducer';
import { GraphDataReducerAction, GraphDataState } from '../reducers/graphdata.reducer';
import { SelectionDataReducerAction, SelectionDataState } from '../reducers/selection.reducer';
import { MappingsReducerAction, MappingsState } from '../reducers/selectedmappings.reducer';
export declare const UserDataContext: React.Context<{
    state: SessionState | null;
    dispatch: React.Dispatch<SessionReducer> | null;
}>;
export declare const GraphDataContext: React.Context<{
    graphState: GraphDataState | null;
    graphDispatch: React.Dispatch<GraphDataReducerAction> | null;
}>;
export declare const MappingContext: React.Context<{
    mappingsState: MappingsState | null;
    mappingsDispatch: React.Dispatch<MappingsReducerAction> | null;
}>;
export declare const SelectionDataContext: React.Context<{
    selectionState: SelectionDataState | null;
    selectionDispatch: React.Dispatch<SelectionDataReducerAction> | null;
}>;
export default function Main(): JSX.Element;
