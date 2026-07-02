import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GlobalStyles, Typography, Box } from '@mui/material';

// Sayfa İçe Aktarımları
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import TenantDashboard from './pages/TenantDashboard';
import PropertiesPage from './pages/PropertiesPage';
import CommunitiesPage from './pages/CommunitiesPage';
import MaintenancePage from './pages/MaintenancePage';
import Invoices from './pages/Invoices';
import MyLease from './pages/MyLease';
import PaymentCenter from './pages/PaymentCenter';
import RepairRequests from './pages/RepairRequests'; // <-- BU SATIRI EKLEDİK
import { AdminAnnouncements } from './pages/AdminAnnouncements';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';



// --- AKILLI YÖNLENDİRİCİ (SMART ROUTER) ---
// Bu küçük bileşen, /dashboard adresine girildiğinde rolü kontrol eder
// ve doğru dashboard'u ekrana basar.
const DashboardRouter = () => {
    const role = localStorage.getItem('role');
    if (role === 'TENANT') {
        return <TenantDashboard />;
    }
    return <AdminDashboard />;
};

// Gelecekte yapılacak Kiracı sayfaları için geçici (Placeholder) bileşen
const ComingSoon = ({ title }) => (
    <Box sx={{ p: 4, textAlign: 'center', mt: 10 }}>
        <Typography variant="h4" color="textSecondary">{title}</Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
            Bu sayfa yapım aşamasındadır...
        </Typography>
    </Box>
);

function App() {
    return (
        <Router>
            {/* Küresel CSS Ayarları */}
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

                {/* Korumalı Rota ve Layout */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }
                >
                    {/* Yönlendirme: / adresine giren direkt dashboard'a gitsin */}
                    <Route index element={<Navigate to="/dashboard" replace />} />

                    {/* Akıllı Dashboard Rotası (Role göre çalışır) */}
                    <Route path="dashboard" element={<DashboardRouter />} />

                    {/* --- ADMIN ROTALARI --- */}
                    {/* --- ADMIN ROTALARI --- */}
                    <Route path="properties" element={<PropertiesPage />} />
                    <Route path="communities" element={<CommunitiesPage />} />
{/*                     <Route path="announcements" element={<AdminAnnouncements communityId="84b22c7a-514c-4ec9-897b-944749f1dbbe" />} />  */}{/* <--- BU SATIRI EKLE */}

                    <Route path="announcements" element={<AdminAnnouncements />} />
                    <Route path="maintenance" element={<MaintenancePage />} />
                    <Route path="invoices" element={<Invoices />} />

                    {/* --- KİRACI (TENANT) ROTALARI --- */}
                    {/* Kiracı sol menüden bu linklere tıkladığında şimdilik "Coming Soon" görecek */}
{/*                     <Route path="my-lease" element={<ComingSoon title="My Lease Documents" />} /> */}
{/*                     <Route path="my-payments" element={<ComingSoon title="My Payments History" />} /> */}
{/*                     <Route path="my-requests" element={<ComingSoon title="My Maintenance Requests" />} /> */}
                    {/* --- KİRACI (TENANT) ROTALARI --- */}
                        <Route path="my-lease" element={<MyLease />} />
                        <Route path="my-payments" element={<PaymentCenter />} />
                        <Route path="my-requests" element={<RepairRequests />} />
                        </Route>

                {/* Yetkisiz veya hatalı URL */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </Router>
    );
}

export default App;