import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GlobalStyles, Typography, Box } from '@mui/material';

// Sayfa İçe Aktarımları
import LoginPage from './pages/LoginPage';
import FirstSetupPage from './pages/FirstSetupPage';
import AdminDashboard from './pages/AdminDashboard';
import TenantDashboard from './pages/TenantDashboard';
import PropertiesPage from './pages/PropertiesPage';
import CommunitiesPage from './pages/CommunitiesPage';
import MaintenancePage from './pages/MaintenancePage';
import Invoices from './pages/Invoices';
import MyLease from './pages/MyLease';
import PaymentCenter from './pages/PaymentCenter'; // <-- GÜNCELLENDİ (MyPayments yerine PaymentCenter import edildi)
import RepairRequests from './pages/RepairRequests';
import { AdminAnnouncements } from './pages/AdminAnnouncements';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// --- AKILLI YÖNLENDİRİCİ (SMART ROUTER) ---
const DashboardRouter = () => {
    const role = localStorage.getItem('role');
    if (role === 'TENANT') {
        return <TenantDashboard />;
    }
    return <AdminDashboard />;
};

function App() {
    return (
        <Router>
            <GlobalStyles styles={{
                'html, body': {
                    margin: 0,
                    padding: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#fafafa',
                    overflowX: 'hidden'
                },
                '#root': {
                    width: '100vw !important',
                    maxWidth: '100vw !important',
                    minHeight: '100vh',
                    margin: '0 !important',
                    padding: '0 !important',
                    display: 'flex',
                    flexDirection: 'column'
                }
            }} />

            <Routes>
                {/* Herkese Açık Rota */}
                <Route path="/login" element={<LoginPage />} />

                {/* First Setup Rota - Layout olmadan, tam ekran wizard */}
                <Route
                    path="/first-setup"
                    element={
                        <ProtectedRoute isSetupRoute={true}>
                            <FirstSetupPage />
                        </ProtectedRoute>
                    }
                />

                {/* Korumalı Rota ve Layout */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute isSetupRoute={false}>
                            <Layout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<DashboardRouter />} />

                    {/* --- ADMIN ROTALARI --- */}
                    <Route path="properties" element={<PropertiesPage />} />
                    <Route path="communities" element={<CommunitiesPage />} />
                    <Route path="announcements" element={<AdminAnnouncements />} />
                    <Route path="maintenance" element={<MaintenancePage />} />
                    <Route path="invoices" element={<Invoices />} />

                    {/* --- KİRACI (TENANT) ROTALARI --- */}
                    <Route path="my-lease" element={<MyLease />} />
                    <Route path="my-payments" element={<PaymentCenter />} /> {/* <-- GÜNCELLENDİ */}
                    <Route path="my-requests" element={<RepairRequests />} />
                </Route>

                {/* Yetkisiz veya hatalı URL */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </Router>
    );
}

export default App;