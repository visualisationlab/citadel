/**
 * @author Miles van der Lely <m.vanderlely@uva.nl>
 *
 * This file contains the reducer for colour scheme data.
 */
import { Map } from 'immutable';
export type SchemeState = Map<string, number[]>;
export type SchemeReducerAction = {
    type: 'add';
    key: string;
    value: number[];
} | {
    type: 'remove';
    key: string;
} | {
    type: 'update';
    key: string;
    value: number[];
};
export declare function SchemeReducer(state: SchemeState, action: SchemeReducerAction): SchemeState;
