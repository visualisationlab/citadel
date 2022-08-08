export declare module StandardizedMap {
    type StandardizedMapData = {
        mean: number;
        std: number;
    };
    function map(val: number, data: StandardizedMapData): number;
    function generate(data: number[]): StandardizedMapData;
}
