// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
    // LocalStorage'dan kullanıcı bilgilerini al
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    const location = useLocation();

    // 1. KONTROL: Token yoksa (giriş yapılmamışsa) login sayfasına postala
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    const isFirstLogin = localStorage.getItem('firstLoginRequired') === 'true';

    // 2. KONTROL: Eğer firstLoginRequired true ise ve AdminSetup sayfasında değilsek oraya zorla
    if (isFirstLogin && location.pathname !== '/admin-setup') {
        return <Navigate to="/admin-setup" replace />;
    }

    // 3. KONTROL: Eğer firstLoginRequired false ise ve AdminSetup sayfasına gitmeye çalışıyorsa dashboard'a at
    if (!isFirstLogin && location.pathname === '/admin-setup') {
        return <Navigate to="/dashboard" replace />;
    }

    // 4. KONTROL: Sayfa belirli rollere özgüyse ve kullanıcının yetkisi yetmiyorsa
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        return <Navigate to="/unauthorized" replace />;
    }

    // Her şey yolundaysa, istenen sayfayı (children) ekrana bas
    return children;
};

export default ProtectedRoute;