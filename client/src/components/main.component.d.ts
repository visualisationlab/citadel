import React from 'react';
import './home.component.css';
export declare const UserDataContext: React.Context<{
    state: any;
    dispatch: React.Dispatch<any> | null;
}>;
export declare const GraphDataContext: React.Context<{
    graphState: any;
    graphDispatch: React.Dispatch<any> | null;
}>;
export declare const SelectionDataContext: React.Context<{
    selectionState: any;
    selectionDispatch: React.Dispatch<any> | null;
}>;
export default function Main(): JSX.Element;
