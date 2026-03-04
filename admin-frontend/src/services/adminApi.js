import axios from 'axios';

// The backend port is fixed at 4000 based on the instructions.
const adminApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/admin` : 'http://localhost:5000/api/admin',
    withCredentials: true,
});

export default adminApi;
