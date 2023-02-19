type SelectionMode =
    | 'single'
    | 'multi'

export interface SelectionDataState {
    selectedNodes: string[]
    selectedEdges: string[]
    selectionMode: SelectionMode
}

type AttributeType =
    | 'node'
    | 'edge'

export type SelectionDataReducerAction =
    | { type: 'selection/set', payload: { attribute: AttributeType, value: string[] }}
    | { type: 'selection/added', payload: { attribute: AttributeType, value: string }}
    | { type: 'selection/removed', payload: { attribute: AttributeType, value: string }}
    | { type: 'selection/reset' }
    | { type: 'selection/shortClick', payload: { attribute: AttributeType, id: string }}
    | { type: 'selection/longClick', payload: { attribute: AttributeType, id: string }}

function resetState(state: SelectionDataState): SelectionDataState {
    if (state.selectedEdges.length === 0 && state.selectedNodes.length === 0) {
        return state
    }

    if (state.selectionMode === 'multi') {
        console.log('multi reset')
        return state
    }

    return {
        selectedNodes: [],
        selectedEdges: [],
        selectionMode: 'single'
    }
}

function addValue(currentValues: string[], value: string): string[] {
    if (currentValues.includes(value)) {
        return currentValues
    }

    return currentValues.concat(value)
}

function removeValue(currentValues: string[], value: string): string[] {
    if (!currentValues.includes(value)) {
        return currentValues
    }

    currentValues.splice(currentValues.indexOf(value))

    return currentValues
}

function setState(type: AttributeType, value: string[], mode: SelectionMode): SelectionDataState {
    switch (type) {
        case 'node':
            return {
                selectedNodes: value,
                selectedEdges: [],
                selectionMode: mode
            }
        default:
            return {
                selectedNodes: [],
                selectedEdges: value,
                selectionMode: mode
            }
    }

}

export function SelectionDataReducer(state: SelectionDataState, action: SelectionDataReducerAction): SelectionDataState {
    if (action.type === 'selection/reset') {
        console.log('resetting selection')
        return resetState(state)
    }

    switch (action.type) {
        case 'selection/added':
            if (action.payload.attribute === 'node') {
                return setState(action.payload.attribute, addValue(state.selectedNodes, action.payload.value), 'multi')
            } else {
                return setState(action.payload.attribute, addValue(state.selectedEdges, action.payload.value), 'multi')
            }
        case 'selection/removed':
            if (action.payload.attribute === 'node') {
                let newSelectedNodes = removeValue(state.selectedNodes, action.payload.value)

                return setState(action.payload.attribute, newSelectedNodes, newSelectedNodes.length > 0 ? 'multi' : 'single')
            } else {
                let newSelectedEdges = removeValue(state.selectedEdges, action.payload.value)

                return setState(action.payload.attribute, newSelectedEdges, newSelectedEdges.length > 0 ? 'multi' : 'single')
            }
        case 'selection/set':
            if (state.selectedNodes.length === 0 && state.selectedEdges.length === 0 && action.payload.value.length === 0) {
                return state
            }

            return setState(action.payload.attribute, action.payload.value, action.payload.value.length > 1 ? 'multi' : 'single')
        case 'selection/shortClick':
            if (state.selectionMode === 'multi') {
                if (action.payload.attribute === 'node') {
                    return setState(action.payload.attribute, addValue(state.selectedNodes, action.payload.id), 'multi')
                }

                return setState(action.payload.attribute, addValue(state.selectedEdges, action.payload.id), 'multi')
            }

            return setState(action.payload.attribute, [action.payload.id], 'single')
        case 'selection/longClick':
            if (action.payload.attribute === 'node') {
                return setState(action.payload.attribute, addValue(state.selectedNodes, action.payload.id), 'multi')
            }

            return setState(action.payload.attribute, addValue(state.selectedEdges, action.payload.id), 'multi')
        default:
            return state
    }
}
