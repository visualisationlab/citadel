export interface WorkerData {
    graphData: object;
    settings: {
        name: string;
        settings: {
            [key: string]: (number | boolean);
        };
    };
    width: number;
    height: number;
}
