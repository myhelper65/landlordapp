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
        localStorage.setItem('firstLoginRequired', response.data.firstLoginRequired);
    }

    return response.data;
};

export const changePassword = async (currentPassword, newPassword) => {
    const response = await axiosInstance.post('/auth/change-password', {
        currentPassword,
        newPassword
    });
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    localStorage.removeItem('firstLoginRequired');
};

export const loginWithGoogle = async (credential) => {
    const response = await axiosInstance.post('/auth/google', {
        credential
    });

    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', response.data.role);
        localStorage.setItem('email', response.data.email);
        localStorage.setItem('firstLoginRequired', response.data.firstLoginRequired);
    }
    
    return response.data;
};