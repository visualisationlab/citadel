/**
 * @author Miles van der Lely <m.vanderlely@uva.nl>
 *
 * This file contains the graph data reducer, which is used to store the graph data.
 */
type highlightType = 'transparency' | 'saturation' | 'lightness' | 'none';
export type GlobalSettingsState = {
    selectionHighlight: highlightType;
    textScale: number;
    stateStack: GlobalSettingsState[];
};
export type GlobalSettingsReducerAction = {
    type: 'selectionHighlightChanged';
    payload: {
        value: highlightType;
    };
} | {
    type: 'textScaleChanged';
    payload: {
        value: number;
    };
} | {
    type: 'settingsReset';
} | {
    type: 'settingsLoaded';
    payload: {
        value: GlobalSettingsState;
    };
} | {
    type: 'undo';
};
export declare function GlobalSettingsReducer(state: GlobalSettingsState, action: GlobalSettingsReducerAction): GlobalSettingsState;
export {};
