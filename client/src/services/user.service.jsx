"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const axios_1 = __importDefault(require("axios"));
// import authHeader from './auth-header';
const ROOTURL = process.env.REACT_APP_URL === "http://localhost" ? "http://" + window.location.hostname : process.env.REACT_APP_URL;
const SERVERPORT = process.env.REACT_APP_SERVERPORT;
console.log(ROOTURL);
const API_URL = ROOTURL + ':' + SERVERPORT + '/api/test';
const DATA_URL = ROOTURL + ':' + SERVERPORT + '/data.csv';
const URL = ROOTURL + ':' + SERVERPORT;
class UserService {
    getPublicContent() {
        return axios_1.default.get(API_URL + '/all');
    }
    // getUserBoard() {
    //     return axios.get(API_URL + '/user', { headers: authHeader() });
    // }
    getGraphs() {
        return axios_1.default.get(URL + "/graphs");
    }
    getGraph(name) {
        return axios_1.default.get(URL + "/graphs/" + name);
    }
    // getModeratorBoard() {
    //     return axios.get(API_URL + '/mod', { headers: authHeader() });
    // }
    // getAdminBoard() {
    //     return axios.get(API_URL + '/admin', { headers: authHeader() });
    // }
    getData() {
        return axios_1.default.get(DATA_URL);
    }
}
exports.userService = new UserService();
