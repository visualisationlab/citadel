"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mappings = void 0;
const linear_mappings_1 = require("./linear.mappings");
var Mappings;
(function (Mappings) {
    function getDataFunction(name) {
        switch (name) {
            case 'linearmap':
                return linear_mappings_1.LinearMap.generate;
            default:
                return null;
        }
    }
    Mappings.getDataFunction = getDataFunction;
    function getMapFunction(name) {
        switch (name) {
            case 'linearmap':
                return linear_mappings_1.LinearMap.map;
            default:
                return null;
        }
    }
    Mappings.getMapFunction = getMapFunction;
})(Mappings = exports.Mappings || (exports.Mappings = {}));
