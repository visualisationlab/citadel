"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBasicGraph = void 0;
function parseBasicGraph(graph) {
    const json = JSON.parse(graph);
    if (typeof json !== 'object' || json === null) {
        throw new Error('Invalid JSON');
    }
    if (!Array.isArray(json.nodes)) {
        throw new Error('Invalid JSON');
    }
    if (!Array.isArray(json.edges)) {
        throw new Error('Invalid JSON');
    }
    if (json.attributes) {
        if (typeof json.attributes !== 'object') {
            throw new Error('Invalid JSON');
        }
        if (Array.isArray(json.attributes)) {
            throw new Error('Invalid JSON');
        }
        if (Object.keys(json.attributes).length === 0) {
            throw new Error('Invalid JSON');
        }
    }
    return json;
}
exports.parseBasicGraph = parseBasicGraph;
//# sourceMappingURL=utility.js.map