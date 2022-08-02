import { LinearMap } from "./linear.mappings";


export module Mappings {
    export type MappingFunction =
        | 'linearmap'
    export function getDataFunction(name: MappingFunction) {
        switch (name) {
            case 'linearmap':
                return LinearMap.generate
            default:
                return null
        }
    }

    export function getMapFunction(name: MappingFunction) {
        switch (name) {
            case 'linearmap':
                return LinearMap.map
            default:
                return null
        }
    }
}
