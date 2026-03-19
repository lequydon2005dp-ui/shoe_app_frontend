import axios from 'axios';

const baseURL = `http://192.168.100.128:8000`;
const httpAxios = axios.create({
    baseURL: `${baseURL}/api`,
    // timeout: 1000,
    // headers: { 'X-Custom-Header': 'foobar' }
});

export default httpAxios;