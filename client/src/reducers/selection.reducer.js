"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectionDataReducer = void 0;
function resetState(state) {
    if (state.selectedEdges.length === 0 && state.selectedNodes.length === 0) {
        return state;
    }
    if (state.selectionMode === 'multi') {
        return state;
    }
    return {
        selectedNodes: [],
        selectedEdges: [],
        selectionMode: 'single'
    };
}
function addValue(currentValues, value) {
    if (currentValues.includes(value)) {
        return currentValues;
    }
    return currentValues.concat(value);
}
function removeValue(currentValues, value) {
    if (!currentValues.includes(value)) {
        return currentValues;
    }
    currentValues.splice(currentValues.indexOf(value));
    return currentValues;
}
function setState(type, value, mode) {
    switch (type) {
        case 'node':
            return {
                selectedNodes: value,
                selectedEdges: [],
                selectionMode: mode
            };
    }
    return {
        selectedNodes: [],
        selectedEdges: value,
        selectionMode: mode
    };
}
function SelectionDataReducer(state, action) {
    if (action.type === 'reset') {
        return resetState(state);
    }
    switch (action.type) {
        case 'add':
            if (action.attribute === 'node') {
                return setState(action.attribute, addValue(state.selectedNodes, action.value), 'multi');
            }
            else {
                return setState(action.attribute, addValue(state.selectedEdges, action.value), 'multi');
            }
        case 'remove':
            if (action.attribute === 'node') {
                let newSelectedNodes = removeValue(state.selectedNodes, action.value);
                return setState(action.attribute, newSelectedNodes, newSelectedNodes.length > 0 ? 'multi' : 'single');
            }
            else {
                let newSelectedEdges = removeValue(state.selectedEdges, action.value);
                return setState(action.attribute, newSelectedEdges, newSelectedEdges.length > 0 ? 'multi' : 'single');
            }
        case 'set':
            if (state.selectedNodes.length === 0 && state.selectedEdges.length === 0 && action.value.length === 0) {
                return state;
            }
            return setState(action.attribute, action.value, action.value.length > 1 ? 'multi' : 'single');
        case 'shortClick':
            if (state.selectionMode === 'multi') {
                if (action.attribute === 'node') {
                    return setState(action.attribute, addValue(state.selectedNodes, action.id), 'multi');
                }
                return setState(action.attribute, addValue(state.selectedEdges, action.id), 'multi');
            }
            return setState(action.attribute, [action.id], 'single');
        case 'longClick':
            if (action.attribute === 'node') {
                return setState(action.attribute, addValue(state.selectedNodes, action.id), 'multi');
            }
            return setState(action.attribute, addValue(state.selectedEdges, action.id), 'multi');
    }
}
exports.SelectionDataReducer = SelectionDataReducer;