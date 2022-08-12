import { Mappings } from '../mappings/module.mappings';
import { API } from '../services/api.service';
function updateNodeMapping(state) {
    Object.keys(state.nodes.mapping.generators).forEach((key) => {
        const mapping = state.nodes.mapping.generators[key];
        if (mapping.attribute === '') {
            return state;
        }
        const dataFun = Mappings.getDataFunction(mapping.fun);
        if (dataFun == null) {
            return state;
        }
        const data = state.nodes.data.filter((item) => {
            return Object.keys(item.attributes).includes(mapping.attribute);
        }).map((item) => {
            return item.attributes[mapping.attribute];
        });
        try {
            const res = dataFun(data);
            console.log(res);
            state.nodes.mapping.generators[key].data = res;
        }
        catch (e) {
            console.log(`Error! ${e}`);
        }
    });
    return Object.assign({}, state);
}
function updateEdgeMapping(state) {
    Object.keys(state.edges.mapping.generators).forEach((key) => {
        const mapping = state.edges.mapping.generators[key];
        if (mapping.attribute === '') {
            return state;
        }
        const dataFun = Mappings.getDataFunction(mapping.fun);
        if (dataFun == null) {
            return state;
        }
        const data = state.edges.data.filter((item) => {
            return Object.keys(item.attributes).includes(mapping.attribute);
        }).map((item) => {
            return item.attributes[mapping.attribute];
        });
        try {
            const res = dataFun(data);
            console.log(res);
            state.edges.mapping.generators[key].data = res;
        }
        catch (e) {
            console.log(`Error! ${e}`);
        }
    });
    return Object.assign({}, state);
}
function updateData(state, action) {
    if (action.type !== 'update') {
        return state;
    }
    switch (action.object) {
        case 'node':
            console.log(action);
            const result = state.nodes.data.filter((node) => { return node.id === action.value.id; });
            if (result.length === 0 || result.length > 1) {
                console.log(`Wrong number of nodes with id ${action.value.id}: {result.length}`);
                return state;
            }
            if (result[0].attributes.length !== action.value.attributes.length) {
                console.log(`Wrong number of attributes in update (a:${result[0].attributes.length} vs u:${action.value.attributes.length})`);
                return state;
            }
            const newNodes = state.nodes.data.map((node) => {
                if (node.id !== action.value.id)
                    return node;
                node.attributes = action.value.attributes;
                return node;
            });
            state.nodes.data = newNodes;
            API.updateGraph(state);
            return Object.assign({}, updateNodeMapping(state));
    }
    return state;
}
function setData(state, action) {
    if (action.type !== 'set') {
        return state;
    }
    switch (action.property) {
        case 'data':
            state.edges.data = action.value.edges;
            state.nodes.data = action.value.nodes;
            state.directed = action.value.directed;
            state = Object.assign({}, updateEdgeMapping(state));
            return Object.assign({}, updateNodeMapping(state));
        case 'directed':
            state.directed = action.value;
            return Object.assign({}, state);
        case 'mapping':
            switch (action.object) {
                case 'node':
                    state.nodes.mapping.generators[action.map].attribute = action.key;
                    state.nodes.mapping.generators[action.map].fun = 'linearmap';
                    return Object.assign({}, updateNodeMapping(state));
                case 'edge':
                    state.edges.mapping.generators[action.map].attribute = action.key;
                    state.edges.mapping.generators[action.map].fun = 'linearmap';
                    return Object.assign({}, updateEdgeMapping(state));
            }
    }
}
export function GraphDataReducer(state, action) {
    switch (action.type) {
        case 'set':
            return setData(state, action);
        case 'update':
            return updateData(state, action);
    }
}
