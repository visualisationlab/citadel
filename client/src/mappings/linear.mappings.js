"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinearMap = void 0;
var LinearMap;
(function (LinearMap) {
    function map(val, data) {
        return (val - data.min) / (data.max - data.min);
    }
    LinearMap.map = map;
    function generate(data) {
        return {
            min: Math.min(...data),
            max: Math.max(...data)
        };
    }
    LinearMap.generate = generate;
})(LinearMap = exports.LinearMap || (exports.LinearMap = {}));
