import axios from 'axios';

// Base API for endpoints that don't have the /admin prefix like /movies, /bookings, etc.
const coreApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    withCredentials: true,
});

export default coreApi;
