import axios from 'axios';
// import authHeader from './auth-header';

const ROOTURL = process.env.REACT_APP_URL === "http://localhost" ? "http://" + window.location.hostname : process.env.REACT_APP_URL;
const SERVERPORT = process.env.REACT_APP_SERVERPORT;
console.log(ROOTURL)

const API_URL = ROOTURL + ':' + SERVERPORT + '/api/test';
const DATA_URL = ROOTURL + ':' + SERVERPORT + '/data.csv';
const URL = ROOTURL + ':' + SERVERPORT;

class UserService {
    getPublicContent() {
        return axios.get(API_URL + '/all');
    }

    // getUserBoard() {
    //     return axios.get(API_URL + '/user', { headers: authHeader() });
    // }

    getGraphs() {
        return axios.get(URL + "/graphs");
    }

    getGraph(name: string) {
        return axios.get(URL + "/graphs/" + name);
    }

    // getModeratorBoard() {
    //     return axios.get(API_URL + '/mod', { headers: authHeader() });
    // }

    // getAdminBoard() {
    //     return axios.get(API_URL + '/admin', { headers: authHeader() });
    // }

    getData() {
        return axios.get(DATA_URL);
    }

    genSession(url: string) {
        return axios.post(URL + '/urls', { url: url})
    }
}

export const userService = new UserService()
