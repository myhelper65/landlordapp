
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Grid, Card, CardContent, Avatar, Chip, CircularProgress
} from '@mui/material';
import {
    Payment, Build, ReceiptLong, AddCircle, Description
} from '@mui/icons-material';

import { TenantAnnouncementWidget } from '../components/TenantAnnouncementWidget';
import api from '../api/axiosInstance';

const TenantDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [tenantData, setTenantData] = useState({
        firstName: '',
        communityName: '',
        propertyName: '',
        nextPaymentDue: 0,
        dueDate: '',
        openRequests: 0,
        recentMaintenanceRequests: [],
        currentInvoiceId: null // Fatura ID'si eklendi
    });

    useEffect(() => {
        const fetchTenantProfile = async () => {
            try {
                const response = await api.get('/dashboard/tenant');
                const realData = response.data;

                setTenantData({
                    firstName: realData.firstName || 'Tenant',
                    propertyName: realData.propertyName || 'Unknown Unit',
                    communityName: realData.communityName || 'Unknown Community',
                    nextPaymentDue: realData.nextPaymentDue || 0,
                    dueDate: realData.dueDate || '-',
                    openRequests: realData.openRequests || 0,
                    recentMaintenanceRequests: realData.recentMaintenanceRequests || [],
                    currentInvoiceId: realData.currentInvoiceId || null // Backend'den gelen ID'yi alıyoruz
                });

            } catch (error) {
                console.error("Dashboard verileri çekilirken hata oluştu:", error);
                setTenantData(prev => ({ ...prev, firstName: 'Tenant' }));
            } finally {
                setLoading(false);
            }
        };

        fetchTenantProfile();
    }, []);

    const navigate = useNavigate();

    // ÖDEME FONKSİYONU
    const handlePayRent = () => {
        if (!tenantData.currentInvoiceId) {
            alert("You have no pending payments!");
            return;
        }
        navigate('/my-payments');
    };

    const theme = {
        bgMain: '#fafafa', primary: '#1976d2', textDark: '#111827', textGrey: '#6b7280',
        orangeText: '#d97706', orangeBg: '#fef3c7',
        greenText: '#059669', greenBg: '#d1fae5',
        redText: '#dc2626', redBg: '#fee2e2'
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: theme.bgMain }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: theme.bgMain, minHeight: 'calc(100vh - 64px)' }}>

            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: theme.textDark, fontFamily: "'Merriweather', serif" }}>
                    Welcome Home, {tenantData.firstName}!
                </Typography>
                <Typography variant="body1" sx={{ color: theme.textGrey, mt: 1 }}>
                    Here is a summary of your lease at {tenantData.propertyName}, {tenantData.communityName}.
                </Typography>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={4}>
                            <Card sx={{ borderRadius: 3, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ color: theme.textGrey, fontWeight: 600 }}>Next Payment</Typography>
                                            <Typography variant="h4" sx={{ fontWeight: 800, color: theme.textDark, my: 1 }}>${tenantData.nextPaymentDue}</Typography>
                                            <Typography variant="caption" sx={{ color: theme.redText, fontWeight: 600 }}>Due: {tenantData.dueDate}</Typography>
                                        </Box>
                                        <Avatar sx={{ bgcolor: theme.redBg, color: theme.redText }}><Payment /></Avatar>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <Card sx={{ borderRadius: 3, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ color: theme.textGrey, fontWeight: 600 }}>Open Requests</Typography>
                                            <Typography variant="h4" sx={{ fontWeight: 800, color: theme.textDark, my: 1 }}>{tenantData.openRequests}</Typography>
                                            <Typography variant="caption" sx={{ color: theme.orangeText, fontWeight: 600 }}>In Progress</Typography>
                                        </Box>
                                        <Avatar sx={{ bgcolor: theme.orangeBg, color: theme.orangeText }}><Build /></Avatar>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <Card sx={{ borderRadius: 3, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ color: theme.textGrey, fontWeight: 600 }}>Active Lease</Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 800, color: theme.textDark, mt: 1.5, mb: 0.5, lineHeight: 1.2 }}>
                                                {tenantData.propertyName}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: theme.greenText, fontWeight: 700 }}>
                                                {tenantData.communityName}
                                            </Typography>
                                        </Box>
                                        <Avatar sx={{ bgcolor: theme.greenBg, color: theme.greenText }}><Description /></Avatar>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: theme.textDark }}>Quick Actions</Typography>
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        {/* PAY RENT BUTONUNA ONCLICK EKLENDİ */}
                        <Grid item xs={6} sm={3}>
                            <Card
                                onClick={handlePayRent}
                                sx={{ borderRadius: 3, textAlign: 'center', cursor: 'pointer', '&:hover': { bgcolor: '#e0f2fe' }, boxShadow: 'none', border: '1px solid #e5e7eb' }}
                            >
                                <CardContent>
                                    <Payment sx={{ fontSize: 40, color: theme.primary, mb: 1 }} />
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Pay Rent</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Card sx={{ borderRadius: 3, textAlign: 'center', cursor: 'pointer', '&:hover': { bgcolor: '#f3f4f6' }, boxShadow: 'none', border: '1px solid #e5e7eb' }}>
                                <CardContent>
                                    <AddCircle sx={{ fontSize: 40, color: theme.orangeText, mb: 1 }} />
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>New Request</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Card sx={{ borderRadius: 3, textAlign: 'center', cursor: 'pointer', '&:hover': { bgcolor: '#f3f4f6' }, boxShadow: 'none', border: '1px solid #e5e7eb' }}>
                                <CardContent>
                                    <ReceiptLong sx={{ fontSize: 40, color: theme.textGrey, mb: 1 }} />
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>My Invoices</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                            <Card sx={{ borderRadius: 3, textAlign: 'center', cursor: 'pointer', '&:hover': { bgcolor: '#f3f4f6' }, boxShadow: 'none', border: '1px solid #e5e7eb' }}>
                                <CardContent>
                                    <Description sx={{ fontSize: 40, color: theme.greenText, mb: 1 }} />
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Lease Docs</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: theme.textDark }}>My Maintenance Requests</Typography>

                    {tenantData.recentMaintenanceRequests.length === 0 ? (
                        <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid #e5e7eb' }}>
                            <CardContent>
                                <Typography variant="body2" color="text.secondary">No open maintenance requests at this time.</Typography>
                            </CardContent>
                        </Card>
                    ) : (
                        tenantData.recentMaintenanceRequests.map((req, index) => (
                            <Card key={index} sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid #e5e7eb', mb: 2 }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="body1" sx={{ fontWeight: 600 }}>{req.title}</Typography>
                                        <Chip label={req.status} size="small" sx={{ bgcolor: theme.orangeBg, color: theme.orangeText, fontWeight: 600 }} />
                                    </Box>
                                    <Typography variant="body2" sx={{ color: theme.textGrey }}>Reported on: {req.reportedOn}</Typography>
                                </CardContent>
                            </Card>
                        ))
                    )}

                </Grid>

                <Grid item xs={12} md={4}>
                    <TenantAnnouncementWidget />
                </Grid>
            </Grid>
        </Box>
    );
};

export default TenantDashboard;