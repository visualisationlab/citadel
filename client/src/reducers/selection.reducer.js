"use strict";
// type SelectionMode =
//     | 'single'
//     | 'multi'
// export interface SelectionDataState {
//     selectedIDs: string[],
//     objectType: 'node' | 'edge',
//     selectionMode: SelectionMode
// }
// type AttributeType =
//     | 'node'
//     | 'edge'
// export type SelectionDataReducerAction =
//     | { type: 'selection/set', payload: { attribute: AttributeType, value: string[] }}
//     | { type: 'selection/added', payload: { attribute: AttributeType, value: string }}
//     | { type: 'selection/removed', payload: { attribute: AttributeType, value: string }}
//     | { type: 'selection/reset' }
//     | { type: 'selection/shortClick', payload: { attribute: AttributeType, id: string }}
//     | { type: 'selection/longClick', payload: { attribute: AttributeType, id: string }}
//     | { type: 'selection/clean', payload: { nodeIDs: string[], edgeIDs: string[] }}
// function resetState(state: SelectionDataState): SelectionDataState {
//     if (state.selectedIDs.length === 0) {
//         return state
//     }
//     if (state.selectionMode === 'multi') {
//         console.log('multi reset')
//         return state
//     }
//     return {
//         selectedIDs: [],
//         objectType: state.objectType,
//         selectionMode: 'single'
//     }
// }
// function addID(currentIDs: string[], id: string): string[] {
//     if (currentIDs.includes(id)) {
//         return currentIDs
//     }
//     return currentIDs.concat(id)
// }
// function removeID(currentIDs: string[], id: string): string[] {
//     if (!currentIDs.includes(id)) {
//         return currentIDs
//     }
//     currentIDs.splice(currentIDs.indexOf(id), 1)
//     return currentIDs
// }
// function setState(type: AttributeType, value: string[], mode: SelectionMode): SelectionDataState {
//     return {
//         selectedIDs: value,
//         objectType: type,
//         selectionMode: mode
//     }
// }
// export function SelectionDataReducer(state: SelectionDataState, action: SelectionDataReducerAction): SelectionDataState {
//     if (action.type === 'selection/reset') {
//         return resetState(state)
//     }
//     if (state.selectedIDs.length === 1) {
//         state.selectionMode = 'single'
//     }
//     switch (action.type) {
//         case 'selection/added':
//             return setState(action.payload.attribute, addID(state.selectedIDs, action.payload.value), 'multi')
//         case 'selection/removed':
//             let newIDs = removeID(state.selectedIDs, action.payload.value)
//             return setState(action.payload.attribute, newIDs, newIDs.length > 0 ? 'multi' : 'single')
//         case 'selection/set':
//             if (state.selectedIDs.length === 0 && action.payload.value.length === 0) {
//                 return state
//             }
//             return setState(action.payload.attribute, action.payload.value, action.payload.value.length > 1 ? 'multi' : 'single')
//         case 'selection/shortClick':
//             if (state.selectionMode === 'multi') {
//                 return setState(action.payload.attribute, addID(state.selectedIDs, action.payload.id), 'multi')
//             }
//             return setState(action.payload.attribute, [action.payload.id], 'single')
//         case 'selection/longClick':
//             return setState(action.payload.attribute, addID(state.selectedIDs, action.payload.id), 'multi')
//         case 'selection/clean':
//             let newSelectedIDs = state.selectedIDs.filter(id => {
//                 if (state.objectType === 'node') {
//                     return action.payload.nodeIDs.includes(id)
//                 }
//                 return action.payload.edgeIDs.includes(id)
//             })
//             return setState(state.objectType, newSelectedIDs, newSelectedIDs.length > 1 ? 'multi' : 'single')
//         default:
//             return state
//     }
// }
