// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
    // LocalStorage'dan kullanıcı bilgilerini al
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    // 1. KONTROL: Token yoksa (giriş yapılmamışsa) login sayfasına postala
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // 2. KONTROL: Sayfa belirli rollere özgüyse ve kullanıcının yetkisi yetmiyorsa
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        return <Navigate to="/unauthorized" replace />;
    }

    // Her şey yolundaysa, istenen sayfayı (children) ekrana bas
    return children;
};

export default ProtectedRoute;