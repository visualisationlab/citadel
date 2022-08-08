export declare module LinearMap {
    type LinearMapData = {
        min: number;
        max: number;
    };
    function map(val: any, data: LinearMapData): number;
    function generate(data: number[]): {
        min: number;
        max: number;
    };
}
