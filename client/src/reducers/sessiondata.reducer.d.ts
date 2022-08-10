export interface SessionState {
    userName: string;
    users: string[];
    expirationDate: Date;
    graphURL: string;
    sid: string;
    layouts: LayoutInfo[];
}
export interface Simulator {
    key: string | null;
    user: string;
    state: 'disconnected' | 'idle' | 'running';
    options: {
        [key: string]: string;
    };
}
declare type AvailableLayout = 'null' | 'random' | 'cose' | 'grid' | 'circle' | 'breadthfirst' | 'cose';
declare type LayoutSetting = {
    name: string;
    type: 'number';
    description: string;
    defaultValue: number;
} | {
    name: string;
    type: 'boolean';
    description: string;
    defaultValue: boolean;
};
export interface LayoutInfo {
    name: AvailableLayout;
    description: string;
    link: string;
    settings: LayoutSetting[];
}
export declare type SessionReducer = {
    attribute: 'all';
    value: SessionState;
} | {
    attribute: 'username';
    value: string;
} | {
    attribute: 'layouts';
    value: LayoutInfo[];
};
export declare function SessionDataReducer(state: SessionState, action: SessionReducer): SessionState;
export {};
