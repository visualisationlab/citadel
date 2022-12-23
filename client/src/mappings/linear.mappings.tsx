export module LinearMap {
    export type LinearMapData = {
        min: number,
        max: number
    }

    export function map(val: number, data: LinearMapData): number {
        return (val - data.min) / (data.max - data.min)
    }

    export function generate(data: number[]): {
        min: number,
        max: number
    } {
        return {
            min: Math.min(...data),
            max: Math.max(...data)
        }
    }
}
