// src/pages/DashboardPage.jsx
import React, { useEffect, useState } from 'react';
import { Typography, Container, Grid, Card, CardContent, CircularProgress, Box } from '@mui/material';
import { getDashboardSummary } from '../api/dashboardService';

const DashboardPage = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const data = await getDashboardSummary();
                setSummary(data);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 20 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg">
            {summary && (
                <Grid container spacing={3}>
                    <Grid xs={12} sm={6} md={4}>
                        <Card elevation={3} sx={{ bgcolor: '#e3f2fd' }}>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>Total Communities</Typography>
                                <Typography variant="h3">{summary.totalCommunities}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid xs={12} sm={6} md={4}>
                        <Card elevation={3} sx={{ bgcolor: '#f3e5f5' }}>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>Total Properties</Typography>
                                <Typography variant="h3">{summary.totalProperties}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid xs={12} sm={6} md={4}>
                        <Card elevation={3} sx={{ bgcolor: '#e8f5e9' }}>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>Active Users</Typography>
                                <Typography variant="h3">{summary.totalUsers}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={6}>
                        <Card elevation={3} sx={{ bgcolor: '#fff3e0' }}>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>Open Maintenance Requests</Typography>
                                <Typography variant="h3">{summary.openMaintenanceRequests}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={6}>
                        <Card elevation={3} sx={{ bgcolor: '#ffebee' }}>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>Total Unpaid Amount</Typography>
                                <Typography variant="h3" color="error">
                                    ${summary.totalUnpaidAmount}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}
        </Container>
    );
};

export default DashboardPage;