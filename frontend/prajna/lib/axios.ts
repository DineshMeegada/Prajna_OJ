
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8001/api/v1';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Enable cookies
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
    (config) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle Refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Prevent infinite loops
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh.
                // We rely on the HttpOnly cookie 'oj_refresh_token' to be present.
                // The backend endpoint will look for the cookie if the body is empty or doesn't contain 'refresh'.

                // Call backend to refresh - send empty object, rely on cookie
                const { data } = await axios.post(`${BASE_URL}/token/refresh/`, {}, {
                    withCredentials: true // Important for sending the cookie
                });

                // Save new tokens
                localStorage.setItem('access_token', data.access);
                if (data.refresh) {
                    localStorage.setItem('refresh_token', data.refresh);
                }

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${data.access}`;
                return api(originalRequest);

            } catch (refreshError) {
                // Logout if refresh fails
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                // We might want to redirect, but let the AuthContext or Component handle the redirect based on auth state change
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
