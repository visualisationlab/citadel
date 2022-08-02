"use strict";
/**
 * Miles van der Lely (12206970), 2022.
 *
 * Exports functional component returning the graph visualization.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const renderer_component_1 = require("./renderer.component");
const main_component_1 = require("../components/main.component");
const main_component_2 = require("./main.component");
const module_mappings_1 = require("../mappings/module.mappings");
/**
 * Returns a container, which is updated by reference to contain the graph.
 * @param param0 props
 * @returns JSX
 */
function Layout() {
    const { graphState } = (0, react_1.useContext)(main_component_1.GraphDataContext);
    const { selectionState, selectionDispatch } = (0, react_1.useContext)(main_component_2.SelectionDataContext);
    let [animatedNodes, setAnimatedNodes] = (0, react_1.useState)([]);
    const containerRef = (0, react_1.useRef)(null);
    /**
     * Updates the container reference with graph visualization.
     */
    react_1.default.useEffect(() => {
        if (graphState === null) {
            return;
        }
        if (graphState.nodes.data.length !== animatedNodes.length) {
            setAnimatedNodes(graphState.nodes.data);
            return;
        }
        let newNodes = [...animatedNodes];
        let animate = false;
        const PARAM = 1;
        const CONV_SPEED = 0.2;
        for (let i = 0; i < animatedNodes.length; i++) {
            let dist = Math.sqrt(Math.pow(animatedNodes[i].x - graphState.nodes.data[i].x, 2) + Math.pow(animatedNodes[i].y - graphState.nodes.data[i].y, 2));
            if (dist > PARAM) {
                animate = true;
                newNodes[i].x += (graphState.nodes.data[i].x - animatedNodes[i].x) * CONV_SPEED;
                newNodes[i].y += (graphState.nodes.data[i].y - animatedNodes[i].y) * CONV_SPEED;
            }
        }
        if (animate) {
            setAnimatedNodes(newNodes);
        }
        let hashedNodes = newNodes.map((node) => {
            node.visualAttributes.alpha = 1;
            if (graphState.nodes.mapping.generators.alpha.attribute !== '') {
                const mappingState = graphState.nodes.mapping.generators.alpha;
                const mapFun = module_mappings_1.Mappings.getMapFunction(mappingState.fun);
                if (mapFun !== null && Object.keys(node.attributes).includes(mappingState.attribute.toString())) {
                    node.visualAttributes.alpha = mapFun(node.attributes[mappingState.attribute], mappingState.data) + 0.1;
                }
            }
            node.visualAttributes.radius = 16;
            if (graphState.nodes.mapping.generators.radius.attribute !== '') {
                const mappingState = graphState.nodes.mapping.generators.radius;
                const mapFun = module_mappings_1.Mappings.getMapFunction(mappingState.fun);
                if (mapFun !== null && Object.keys(node.attributes).includes(mappingState.attribute.toString())) {
                    const val = mapFun(node.attributes[mappingState.attribute], mappingState.data);
                    console.log(val);
                    node.visualAttributes.radius = graphState.nodes.mapping.settings.minRadius + val * graphState.nodes.mapping.settings.maxRadius;
                }
            }
            if ((selectionState === null || selectionState === void 0 ? void 0 : selectionState.selectedNodes.length) !== 0) {
                if (selectionState === null || selectionState === void 0 ? void 0 : selectionState.selectedNodes.includes(node.id)) {
                    node.visualAttributes.alpha = 1.0;
                }
                else {
                    node.visualAttributes.alpha = 0.2;
                }
            }
            node.visualAttributes.fillColour = [0, 0, 0];
            if (graphState.nodes.mapping.generators.colour.attribute !== '') {
                const mappingState = graphState.nodes.mapping.generators.colour;
                const mapFun = module_mappings_1.Mappings.getMapFunction(mappingState.fun);
                if (mapFun !== null && Object.keys(node.attributes).includes(mappingState.attribute.toString())) {
                    node.visualAttributes.fillColour = [mapFun(node.attributes[mappingState.attribute], mappingState.data), 0, 0];
                }
            }
            return Object.assign(Object.assign({}, node), { 
                // hash: Hash(node, {
                //     excludeKeys: (key) => {
                //         return (key === 'x' || key === 'y')
                //     }
                // })
                hash: 'abc' });
        });
        let hashedEdges = graphState.edges.data.map((edge) => {
            edge.visualAttributes.alpha = 1.0;
            if ((selectionState === null || selectionState === void 0 ? void 0 : selectionState.selectedEdges.length) !== 0) {
                if (selectionState === null || selectionState === void 0 ? void 0 : selectionState.selectedEdges.includes(edge.attributes['id'].toString())) {
                    edge.visualAttributes.alpha = 1.0;
                }
                else {
                    edge.visualAttributes.alpha = 0.2;
                }
            }
            edge.visualAttributes.fillColour = [0, 0, 0];
            if (graphState.edges.mapping.generators.colour.attribute !== '') {
                const mappingState = graphState.edges.mapping.generators.colour;
                const mapFun = module_mappings_1.Mappings.getMapFunction(mappingState.fun);
                if (mapFun !== null && Object.keys(edge.attributes).includes(mappingState.attribute.toString())) {
                    edge.visualAttributes.fillColour = [mapFun(edge.attributes[mappingState.attribute], mappingState.data), 0, 0];
                }
            }
            if (graphState.edges.mapping.generators.alpha.attribute !== '') {
                const mappingState = graphState.edges.mapping.generators.alpha;
                const mapFun = module_mappings_1.Mappings.getMapFunction(mappingState.fun);
                if (mapFun !== null && Object.keys(edge.attributes).includes(mappingState.attribute.toString())) {
                    edge.visualAttributes.alpha = mapFun(edge.attributes[mappingState.attribute], mappingState.data) + 0.1;
                }
            }
            edge.visualAttributes.width = 2;
            if (graphState.edges.mapping.generators.width.attribute !== '') {
                const mappingState = graphState.edges.mapping.generators.width;
                const mapFun = module_mappings_1.Mappings.getMapFunction(mappingState.fun);
                if (mapFun !== null && Object.keys(edge.attributes).includes(mappingState.attribute.toString())) {
                    edge.visualAttributes.width = 2 + mapFun(edge.attributes[mappingState.attribute], mappingState.data) * 3;
                }
            }
            return Object.assign(Object.assign({}, edge), { 
                // hash: Hash(edge)
                hash: 'abc' });
        });
        const { destroy } = (0, renderer_component_1.Renderer)({
            container: containerRef.current,
            nodes: hashedNodes,
            edges: hashedEdges,
            directed: graphState.directed,
            selectionState: selectionState,
            selectionDispatch: selectionDispatch
        });
        return destroy;
    }, [graphState,
        animatedNodes,
        selectionDispatch,
        selectionState]);
    return react_1.default.createElement("div", { ref: containerRef, className: "render" });
}
exports.default = Layout;
