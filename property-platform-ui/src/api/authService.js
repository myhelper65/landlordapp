// src/api/authService.js
import axiosInstance from './axiosInstance';

export const login = async (email, password) => {
    const response = await axiosInstance.post('/auth/login', {
        email,
        password
    });

    // Backend'den (AuthResponseDTO) gelen verileri tarayıcıya kaydet
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', response.data.role);
        localStorage.setItem('email', response.data.email);
    }

    return response.data;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
};

export const requestPasswordReset = async (email) => {
    const response = await axiosInstance.post('/auth/forgot-password', { email });
    return response.data;
};

export const resetPassword = async (token, newPassword) => {
    const response = await axiosInstance.post('/auth/reset-password', { token, newPassword });
    return response.data;
};