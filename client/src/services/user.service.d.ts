declare class UserService {
    getPublicContent(): Promise<import("axios").AxiosResponse<any, any>>;
    getGraphs(): Promise<import("axios").AxiosResponse<any, any>>;
    getGraph(name: string): Promise<import("axios").AxiosResponse<any, any>>;
    getData(): Promise<import("axios").AxiosResponse<any, any>>;
    genSession(url: string): Promise<import("axios").AxiosResponse<any, any>>;
    getSessionStatus(sid: string): Promise<import("axios").AxiosResponse<any, any>>;
}
export declare const userService: UserService;
export {};
