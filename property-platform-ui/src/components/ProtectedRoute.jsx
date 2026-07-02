// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles, isSetupRoute }) => {
    // LocalStorage'dan kullanıcı bilgilerini al
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');
    const firstLoginRequired = localStorage.getItem('firstLoginRequired') === 'true';

    // 1. KONTROL: Token yoksa (giriş yapılmamışsa) login sayfasına postala
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // 2. KONTROL: Eğer First Setup gerekiyorsa ve şu an First Setup sayfasında değilsek, oraya zorla
    if (firstLoginRequired && !isSetupRoute) {
        return <Navigate to="/first-setup" replace />;
    }

    // 3. KONTROL: Eğer First Setup gerekMİYORSA ama şu an First Setup sayfasındaysak, dashboard'a gönder
    if (!firstLoginRequired && isSetupRoute) {
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