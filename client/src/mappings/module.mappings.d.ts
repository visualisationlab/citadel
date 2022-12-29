import { LinearMap } from "./linear.mappings";
export declare module Mappings {
    type MappingFunction = 'linearmap';
    function getDataFunction(name: MappingFunction): typeof LinearMap.generate | null;
    function getMapFunction(name: MappingFunction): typeof LinearMap.map | null;
}
