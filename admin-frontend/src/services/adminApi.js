import axios from 'axios';

// The backend port is fixed at 4000 based on the instructions.
const adminApi = axios.create({
    baseURL: 'http://localhost:4000/api/admin',
    withCredentials: true,
});

export default adminApi;
