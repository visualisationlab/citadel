import React from 'react';
import './home.component.css';
import { SessionState, SessionReducer } from '../reducers/sessiondata.reducer';
import { GraphDataReducerAction, GraphDataState } from '../reducers/graphdata.reducer';
import { SelectionDataReducerAction, SelectionDataState } from '../reducers/selection.reducer';
import { SelectedMappingsReducerAction, SelectedMappingsState } from '../reducers/selectedmappings.reducer';
import { SchemeReducerAction, SchemeState } from '../reducers/schemes.reducer';
import { MappingConfigReducerAction, MappingConfigState } from '../reducers/mappingconfig.reducer';
export declare const UserDataContext: React.Context<{
    state: SessionState | null;
    dispatch: React.Dispatch<SessionReducer> | null;
}>;
export declare const GraphDataContext: React.Context<{
    graphState: GraphDataState | null;
    graphDispatch: React.Dispatch<GraphDataReducerAction> | null;
}>;
export declare const MappingSettingsContext: React.Context<{
    mappingSettingsState: SelectedMappingsState | null;
    mappingSettingsDispatch: React.Dispatch<SelectedMappingsReducerAction> | null;
}>;
export declare const SelectionDataContext: React.Context<{
    selectionState: SelectionDataState | null;
    selectionDispatch: React.Dispatch<SelectionDataReducerAction> | null;
}>;
export declare const SchemeContext: React.Context<{
    schemeState: SchemeState | null;
    schemeDispatch: React.Dispatch<SchemeReducerAction> | null;
}>;
export declare const MappingConfigContext: React.Context<{
    mappingConfigState: MappingConfigState | null;
    mappingConfigDispatch: React.Dispatch<MappingConfigReducerAction> | null;
}>;
export default function Main(): JSX.Element;
