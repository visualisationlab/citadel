import React from 'react';
import './home.component.css';
import { SessionState, SessionReducer } from '../reducers/sessiondata.reducer';
import { GraphDataReducerAction, GraphDataState } from '../reducers/graphdata.reducer';
import { SelectionDataReducerAction, SelectionDataState } from '../reducers/selection.reducer';
import { MappingsReducerAction, MappingsState } from '../reducers/selectedmappings.reducer';
import { GlobalSettingsState, GlobalSettingsReducerAction } from '../reducers/globalsettings.reducer';
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
export declare const GlobalSettingsContext: React.Context<{
    globalSettingsState: GlobalSettingsState | null;
    globalSettingsDispatch: React.Dispatch<GlobalSettingsReducerAction> | null;
}>;
export default function Main(): JSX.Element;
