/// <reference types="react" />
export declare module QR {
    function registerFun(fun: React.Dispatch<React.SetStateAction<string>>): void;
    function genQR(URL: string, port: string, sid: string, headsetKey: string, userID: string): void;
    function genRickRoll(): void;
    function clearQR(): void;
}
