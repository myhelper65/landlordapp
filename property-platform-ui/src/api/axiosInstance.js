// src/api/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/v1`, // Spring Boot portun
});

// Request Interceptor: Her istek gitmeden önce çalışır
axiosInstance.interceptors.request.use(
    (config) => {
        // LocalStorage'dan JWT token'ı al
        const token = localStorage.getItem('token');

        // Eğer token varsa, isteğin Header'ına ekle
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Backend'den cevap geldiğinde çalışır
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Eğer backend 401 (Unauthorized) dönerse token süresi bitmiştir, kullanıcıyı dışarı at
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            window.location.href = '/login'; // Login sayfasına yönlendir
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;