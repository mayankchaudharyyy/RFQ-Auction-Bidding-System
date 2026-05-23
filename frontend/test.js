import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5005/api',
});

async function run() {
    try {
        const res = await API.get('/rfqs/4');
        console.log("SUCCESS:");
        console.log(JSON.stringify(res.data, null, 2));
    } catch (err) {
        console.error("ERROR:");
        console.error(err.message);
        if (err.response) {
            console.error(err.response.status);
            console.error(err.response.data);
        }
    }
}

run();
