import { LayoutInfo } from "./sessiondata.reducer";
export type AvailableLayout = 'null' | 'random' | 'cose' | 'grid' | 'circle' | 'breadthfirst' | 'cose';
type LayoutSetting = {
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
export type LayoutState = {
    name: AvailableLayout;
    description: string;
    link: string;
    settings: LayoutSetting[];
    randomize: boolean;
};
export type LayoutSettingsState = {
    selectedLayout: AvailableLayout | null;
    layouts: LayoutState[];
} | null;
export type LayoutSettingsReducerAction = {
    attribute: 'layouts';
    value: LayoutInfo[];
    currentLayout: AvailableLayout | null;
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
