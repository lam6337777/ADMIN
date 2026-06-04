import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // Quan trọng để gửi/nhận cookies
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            let token = localStorage.getItem('token');

            // Fallback: Nếu không có trong localStorage, thử tìm trong cookie
            if (!token) {
                const match = document.cookie.match(new RegExp('(^| )accessToken=([^;]+)'));
                if (match) token = match[2];
            }

            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Xử lý lỗi 401 (Unauthorized)
        if (error.response && error.response.status === 401) {
            console.error('Unauthorized! User might need to login.');
        }

        const errorMessage = error.response?.data?.message || error.message || 'Something went wrong';
        console.error(`API Error [${error.config?.url}]:`, errorMessage);

        return Promise.reject(new Error(errorMessage));
    }
);

export default axiosInstance;
