export declare module LinearMap {
    type LinearMapData = {
        min: number;
        max: number;
    };
    function map(val: number, data: LinearMapData): number;
    function generate(data: number[]): {
        min: number;
        max: number;
    };
}
