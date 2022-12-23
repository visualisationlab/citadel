import React from 'react';
import './home.component.css';
<<<<<<< HEAD
import { SessionState, SessionReducer } from '../reducers/sessiondata.reducer';
import { GraphDataReducerAction, GraphDataState } from '../reducers/graphdata.reducer';
import { SelectionDataReducerAction, SelectionDataState } from '../reducers/selection.reducer';
import { SelectedMappingsReducerAction, SelectedMappingsState } from '../reducers/selectedmappings.reducer';
=======
>>>>>>> 4ca896a9ecd2be943a301220a6c6d18822a57a11
export declare const UserDataContext: React.Context<{
    state: any;
    dispatch: React.Dispatch<any> | null;
}>;
export declare const GraphDataContext: React.Context<{
    graphState: any;
    graphDispatch: React.Dispatch<any> | null;
}>;
export declare const MappingSettingsContext: React.Context<{
    mappingSettingsState: SelectedMappingsState | null;
    mappingSettingsDispatch: React.Dispatch<SelectedMappingsReducerAction> | null;
}>;
export declare const SelectionDataContext: React.Context<{
    selectionState: any;
    selectionDispatch: React.Dispatch<any> | null;
}>;
export default function Main(): JSX.Element;
