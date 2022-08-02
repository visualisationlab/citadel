"use strict";
/**
 * Miles van der Lely (12206970), 2022.
 *
 * Declares and exports TS types used in project.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisGraph = void 0;
var VisGraph;
(function (VisGraph) {
    VisGraph.attributeType = ['LinearMapDate', 'LinearMapScalar', 'Classify', 'None'];
    VisGraph.marker = ['FillColour', 'EdgeColour', 'Radius', 'Alpha'];
    VisGraph.selectionType = ['Neighbours', 'ShortestPath', 'Group', 'Delete'];
    let GraphSettingsAttribute;
    (function (GraphSettingsAttribute) {
        GraphSettingsAttribute[GraphSettingsAttribute["Charge"] = 0] = "Charge";
        GraphSettingsAttribute[GraphSettingsAttribute["RadialForce"] = 1] = "RadialForce";
        GraphSettingsAttribute[GraphSettingsAttribute["MaxLinesDrawn"] = 2] = "MaxLinesDrawn";
        GraphSettingsAttribute[GraphSettingsAttribute["MaxCirclesDrawn"] = 3] = "MaxCirclesDrawn";
        GraphSettingsAttribute[GraphSettingsAttribute["TickInterval"] = 4] = "TickInterval";
        GraphSettingsAttribute[GraphSettingsAttribute["ExtremeLineCulling"] = 5] = "ExtremeLineCulling";
        GraphSettingsAttribute[GraphSettingsAttribute["SmoothScroll"] = 6] = "SmoothScroll";
        GraphSettingsAttribute[GraphSettingsAttribute["DefaultNodeRadius"] = 7] = "DefaultNodeRadius";
        GraphSettingsAttribute[GraphSettingsAttribute["RenderEdges"] = 8] = "RenderEdges";
        GraphSettingsAttribute[GraphSettingsAttribute["CollideStrength"] = 9] = "CollideStrength";
        GraphSettingsAttribute[GraphSettingsAttribute["LineOpacity"] = 10] = "LineOpacity";
    })(GraphSettingsAttribute || (GraphSettingsAttribute = {}));
})(VisGraph = exports.VisGraph || (exports.VisGraph = {}));
