import axios from 'axios';

const API = axios.create({
    baseURL: 'http://13.201.71.208:5005/api',
});

export default API;