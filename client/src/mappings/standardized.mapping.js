"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardizedMap = void 0;
const mathjs_1 = require("mathjs");
var StandardizedMap;
(function (StandardizedMap) {
    function map(val, data) {
        return (val - data.mean) / data.std;
    }
    StandardizedMap.map = map;
    function generate(data) {
        return {
            mean: (0, mathjs_1.mean)(...data),
            std: (0, mathjs_1.std)(...data)
        };
    }
    StandardizedMap.generate = generate;
})(StandardizedMap = exports.StandardizedMap || (exports.StandardizedMap = {}));
