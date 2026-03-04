import axios from 'axios';

// Create a production-ready axios instance
const api = axios.create({
    // In development: Vite proxy ('/api') intercepts the request.
    // In production: VITE_API_URL handles the absolute URL to your backend.
    baseURL: import.meta.env.VITE_API_URL || '/api',

    // Important for sending HttpOnly cookies (like JWT sessions) implicitly
    withCredentials: true,

    // Optional: Add a sensible timeout (e.g., 10 seconds)
    timeout: 10000,

    headers: {
        'Content-Type': 'application/json',
    }
});

// Response interceptor for generic error handling
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // If an admin call fails auth, rigidly bump them to admin login
            if (error.config.url.startsWith('/admin')) {
                window.location.href = '/admin/login';
            }
            // For standard user 401s, we usually just want to clear Redux state 
            // and show a modal, rather than force-reloading the page. The local caller handles it.
        }
        return Promise.reject(error);
    }
);

export default api;
