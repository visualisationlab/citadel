// /*
//  * Created by Miles van der Lely <m.vanderlely@uva.nl>
//  *
//  * Reducer for global settings.
//  */

// /**
//  * @author Miles van der Lely <m.vanderlely@uva.nl>
//  *
//  * This file contains the graph data reducer, which is used to store the graph data.
//  */

// type highlightType = 'transparency' | 'saturation' | 'lightness' | 'none'

// export type GlobalSettingsState = {
//     selectionHighlight: highlightType
//     textScale: number
//     stateStack: GlobalSettingsState[]
// }

// export type GlobalSettingsReducerAction =
//     { type: 'selectionHighlightChanged', payload: { value:  highlightType} } |
//     { type: 'textScaleChanged', payload: { value: number }} |
//     { type: 'settingsReset' } |
//     { type: 'settingsLoaded', payload: { value: GlobalSettingsState }} |
//     { type: 'undo'}

// export function GlobalSettingsReducer(state: GlobalSettingsState, action: GlobalSettingsReducerAction): GlobalSettingsState {
//     switch (action.type) {
//         case 'selectionHighlightChanged':
//             state.stateStack.push(state)

//             return {
//                 ...state,
//                 selectionHighlight: action.payload.value
//             }
//         case 'textScaleChanged':
//             state.stateStack.push(state)

//             return {
//                 ...state,
//                 textScale: action.payload.value
//             }
//         case 'settingsReset':
//             return {
//                 selectionHighlight: 'transparency',
//                 textScale: 1,
//                 stateStack: []
//             }
//         case 'undo':
//             let prevState = state.stateStack.pop()

//             if (prevState === undefined) {
//                 return state
//             }

//             return prevState
//         case 'settingsLoaded':
//             return {...action.payload.value,
//                 stateStack: []
//             }
//         default:
//             return state
//     }
// }
