/**
 * @author Miles van der Lely <m.vanderlely@uva.nl>
 *
 * This file contains the reducer for colour scheme data.
 */

import { Map } from 'immutable'

export type SchemeState = Map<string, number[]>

// The action type for the scheme reducer.
export type SchemeReducerAction =
    | { type: 'add', key: string, value: number[]}
    | { type: 'remove', key: string}
    | { type: 'update', key: string, value: number[]}

// The scheme reducer.
export function SchemeReducer(state: SchemeState, action: SchemeReducerAction): SchemeState {
    switch (action.type) {
        case 'add':
            return state.set(action.key, action.value)

        case 'remove':
            return state.delete(action.key)

        case 'update':
            return state.set(action.key, action.value)
    }
}
