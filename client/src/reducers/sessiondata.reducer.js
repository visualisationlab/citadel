"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionDataReducer = void 0;
function SessionDataReducer(state, action) {
    switch (action.attribute) {
        case 'all':
            action.value.layouts = state.layouts;
            return Object.assign({}, action.value);
        case 'username':
            state.userName = action.value;
            return Object.assign({}, state);
        case 'layouts':
            state.layouts = action.value;
            return Object.assign({}, state);
    }
}
exports.SessionDataReducer = SessionDataReducer;
