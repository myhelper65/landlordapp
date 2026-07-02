import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { announcementAPI } from './announcementService';
import dayjs from 'dayjs';
import {
    Box, Typography, Grid, Card, CardContent, Avatar,
    Divider, Chip, IconButton, CircularProgress
} from '@mui/material';
import {
    AttachMoney, Build, HomeWork, MapsHomeWork,
    AddBusiness, PostAdd, Assessment, NotificationsNone, Campaign
} from '@mui/icons-material';

const AdminDashboard = () => {
    const storedUser = JSON.parse(localStorage.getItem('user')) || {};
    const userName = storedUser.email ? storedUser.email.split('@')[0] : 'Admin';

    const [stats, setStats] = useState(null);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/v1/dashboard/summary`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(response.data);

                // Fetch recent announcements
                const commRes = await api.get('/communities');
                const communitiesList = commRes.data.content || commRes.data;
                if (communitiesList.length > 0) {
                    const firstCommunityId = communitiesList[0].id;
                    const annRes = await announcementAPI.getAdminAnnouncements(firstCommunityId, { page: 0, size: 4, sort: 'publishDate,desc' });
                    setAnnouncements(annRes.data.content || []);
                }
            } catch (error) {
                console.error("Dashboard verileri çekilirken hata:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Tenant panelindeki yüksek kontrastlı ve ferah renk paleti
    const theme = {
        bgMain: '#fafafa', primary: '#1976d2', textDark: '#111827', textGrey: '#6b7280',
        orangeText: '#d97706', orangeBg: '#fef3c7',
        greenText: '#059669', greenBg: '#d1fae5',
        redText: '#dc2626', redBg: '#fee2e2',
        greyText: '#4b5563', greyBg: '#f3f4f6', borderLight: '#e5e7eb'
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)', bgcolor: theme.bgMain }}>
                <CircularProgress sx={{ color: theme.textGrey }} />
            </Box>
        );
    }

    const data = stats || {
        totalRevenue: 0, openMaintenanceRequests: 0, highPriorityRequests: 0,
        occupancyRate: 0, availableUnits: 0, totalCommunities: 0, totalProperties: 0,
        newRequests: 0, assignedRequests: 0, inProgressRequests: 0
    };

    const quickActions = [
        { icon: <AddBusiness sx={{ fontSize: 40, color: theme.primary, mb: 1 }} />, label: 'Add Property', path: '/properties' },
        { icon: <Build sx={{ fontSize: 40, color: theme.orangeText, mb: 1 }} />, label: 'Assign Work Order', path: '/maintenance' },
        { icon: <PostAdd sx={{ fontSize: 40, color: theme.textGrey, mb: 1 }} />, label: 'Post Announcement', path: '/communities' },
        { icon: <Assessment sx={{ fontSize: 40, color: theme.greenText, mb: 1 }} />, label: 'Generate Report', action: 'alert' }
    ];

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: theme.bgMain, minHeight: 'calc(100vh - 64px)' }}>

            {/* ÜST BAŞLIK VE KULLANICI BİLGİSİ */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: theme.textDark, fontFamily: "'Merriweather', serif" }}>
                        Admin Dashboard
                    </Typography>
                    <Typography variant="body1" sx={{ color: theme.textGrey, mt: 1 }}>
                        Here is a summary of your portfolio and operations.
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton sx={{ border: `1px solid ${theme.borderLight}`, p: 1 }}>
                        <NotificationsNone sx={{ color: theme.textGrey }} />
                    </IconButton>
                    <Avatar sx={{ bgcolor: theme.primary, color: '#fff', fontWeight: 600 }}>
                        {userName.charAt(0).toUpperCase()}
                    </Avatar>
                </Box>
            </Box>

            <Grid container spacing={3} className="animate-fade-in">
                {/* SOL TARAF: İSTATİSTİKLER VE HIZLI İŞLEMLER (8 Sütun) */}
                <Grid item xs={12} md={8}>

                    {/* 1. SATIR: İSTATİSTİK KARTLARI (Tenant tarzı yuvarlak hatlı ve avatarlı) */}
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card className="hover-lift" sx={{ borderRadius: 3, border: `1px solid ${theme.borderLight}`, boxShadow: 'var(--shadow-soft)', height: '100%' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ color: theme.textGrey, fontWeight: 600 }}>Total Revenue</Typography>
                                            <Typography variant="h5" sx={{ fontWeight: 800, color: theme.textDark, my: 1 }}>${data.totalRevenue.toLocaleString()}</Typography>
                                            <Typography variant="caption" sx={{ color: theme.greenText, fontWeight: 600 }}>Collected this month</Typography>
                                        </Box>
                                        <Avatar sx={{ bgcolor: theme.greenBg, color: theme.greenText, width: 32, height: 32 }}><AttachMoney fontSize="small" /></Avatar>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ borderRadius: 3, border: `1px solid ${theme.borderLight}`, boxShadow: 'none', height: '100%' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ color: theme.textGrey, fontWeight: 600 }}>Open Requests</Typography>
                                            <Typography variant="h5" sx={{ fontWeight: 800, color: theme.textDark, my: 1 }}>{data.openMaintenanceRequests}</Typography>
                                            <Typography variant="caption" sx={{ color: theme.redText, fontWeight: 600 }}>{data.highPriorityRequests} high priority</Typography>
                                        </Box>
                                        <Avatar sx={{ bgcolor: theme.redBg, color: theme.redText, width: 32, height: 32 }}><Build fontSize="small" /></Avatar>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ borderRadius: 3, border: `1px solid ${theme.borderLight}`, boxShadow: 'none', height: '100%' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ color: theme.textGrey, fontWeight: 600 }}>Occupancy</Typography>
                                            <Typography variant="h5" sx={{ fontWeight: 800, color: theme.textDark, my: 1 }}>{data.occupancyRate}%</Typography>
                                            <Typography variant="caption" sx={{ color: theme.orangeText, fontWeight: 600 }}>{data.availableUnits} units available</Typography>
                                        </Box>
                                        <Avatar sx={{ bgcolor: theme.orangeBg, color: theme.orangeText, width: 32, height: 32 }}><HomeWork fontSize="small" /></Avatar>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ borderRadius: 3, border: `1px solid ${theme.borderLight}`, boxShadow: 'none', height: '100%' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ color: theme.textGrey, fontWeight: 600 }}>Properties</Typography>
                                            <Typography variant="h5" sx={{ fontWeight: 800, color: theme.textDark, my: 1 }}>{data.totalProperties}</Typography>
                                            <Typography variant="caption" sx={{ color: theme.greyText, fontWeight: 600 }}>{data.totalCommunities} Communities</Typography>
                                        </Box>
                                        <Avatar sx={{ bgcolor: theme.greyBg, color: theme.greyText, width: 32, height: 32 }}><MapsHomeWork fontSize="small" /></Avatar>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* 2. SATIR: HIZLI İŞLEMLER (Quick Actions - Büyük beyaz karttan kurtarıldı!) */}
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: theme.textDark }}>Quick Actions</Typography>
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        {quickActions.map((action, index) => (
                            <Grid item xs={6} sm={3} key={index}>
                                <Card
                                    className="hover-lift"
                                    onClick={() => {
                                        if (action.path) navigate(action.path);
                                        else alert(`${action.label} modülü yakında eklenecek!`);
                                    }}
                                    sx={{
                                        borderRadius: 3, textAlign: 'center', cursor: 'pointer',
                                        boxShadow: 'var(--shadow-soft)', border: `1px solid ${theme.borderLight}`,
                                        '&:hover': { bgcolor: '#f8fafc' }
                                    }}
                                >
                                    <CardContent>
                                        {action.icon}
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: theme.textDark }}>
                                            {action.label}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {/* 3. SATIR: BAKIM DURUMU (Community Maintenance Status) */}
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: theme.textDark }}>Community Maintenance Status</Typography>
                    <Card className="hover-lift" sx={{ borderRadius: 3, boxShadow: 'var(--shadow-soft)', border: `1px solid ${theme.borderLight}` }}>
                        <CardContent sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip label="New" size="small" sx={{ bgcolor: theme.greenBg, color: theme.greenText, fontWeight: 700 }} />
                                <Typography sx={{ fontWeight: 700, fontSize: '15px', color: theme.textDark }}>{data.newRequests}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip label="Assigned" size="small" sx={{ bgcolor: theme.orangeBg, color: theme.orangeText, fontWeight: 700 }} />
                                <Typography sx={{ fontWeight: 700, fontSize: '15px', color: theme.textDark }}>{data.assignedRequests}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip label="In Progress" size="small" sx={{ bgcolor: theme.greyBg, color: theme.greyText, fontWeight: 700 }} />
                                <Typography sx={{ fontWeight: 700, fontSize: '15px', color: theme.textDark }}>{data.inProgressRequests}</Typography>
                            </Box>
                        </CardContent>
                    </Card>

                </Grid>

                {/* SAĞ TARAF: DUYURULAR (4 Sütun) */}
                <Grid item xs={12} md={4}>
                    <Card className="hover-lift" sx={{ borderRadius: 3, boxShadow: 'var(--shadow-soft)', border: `1px solid ${theme.borderLight}`, height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <Campaign sx={{ color: theme.primary, mr: 1 }} />
                                <Typography variant="h6" sx={{ fontWeight: 800, color: theme.textDark }}>Recent Announcements</Typography>
                            </Box>

                            {announcements.length === 0 ? (
                                <Typography variant="body2" sx={{ color: theme.textGrey, fontStyle: 'italic' }}>
                                    No recent announcements.
                                </Typography>
                            ) : (
                                announcements.map((ann, index) => {
                                    let chipColor = theme.primary;
                                    let chipBg = theme.bgMain;
                                    
                                    if (ann.category === 'URGENT' || ann.category === 'IMPORTANT') { 
                                        chipColor = theme.redText; chipBg = theme.redBg; 
                                    } else if (ann.category === 'NOTICE') { 
                                        chipColor = theme.orangeText; chipBg = theme.orangeBg; 
                                    } else { 
                                        chipColor = theme.greenText; chipBg = theme.greenBg; 
                                    }

                                    return (
                                        <Box key={ann.id || index}>
                                            <Box sx={{ mb: 2 }}>
                                                <Chip label={ann.category || 'GENERAL'} size="small" sx={{ bgcolor: chipBg, color: chipColor, fontWeight: 600, mb: 1 }} />
                                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{ann.title}</Typography>
                                                <Typography variant="body2" sx={{ color: theme.textGrey, mt: 0.5 }}>
                                                    {ann.content}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: theme.primary, display: 'block', mt: 1, fontWeight: 600 }}>
                                                    {ann.publishDate ? dayjs(ann.publishDate).format('MMM D, YYYY') : dayjs(ann.createdAt).format('MMM D, YYYY')}
                                                </Typography>
                                            </Box>
                                            {index < announcements.length - 1 && <Divider sx={{ my: 2 }} />}
                                        </Box>
                                    );
                                })
                            )}

                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdminDashboard;