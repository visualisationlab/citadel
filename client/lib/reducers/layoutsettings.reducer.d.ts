import { LayoutInfo } from "./sessiondata.reducer";
declare type AvailableLayout = '' | 'null' | 'random' | 'cose' | 'grid' | 'circle' | 'breadthfirst' | 'cose';
declare type LayoutSetting = {
    name: string;
    description: string;
    type: 'number';
    defaultValue: number;
    value: number;
} | {
    name: string;
    description: string;
    type: 'boolean';
    defaultValue: boolean;
    value: boolean;
};
export declare type LayoutState = {
    name: AvailableLayout;
    description: string;
    link: string;
    settings: LayoutSetting[];
};
export declare type LayoutSettingsState = {
    selectedLayout: AvailableLayout;
    layouts: LayoutState[];
} | null;
export declare type LayoutSettingsReducerAction = {
    attribute: 'layouts';
    value: LayoutInfo[];
} | {
    attribute: 'property';
    key: string;
    value: number | boolean;
} | {
    attribute: 'selectedLayout';
    value: string;
};
export declare function LayoutSettingsReducer(state: LayoutSettingsState, action: LayoutSettingsReducerAction): LayoutSettingsState;
export {};
