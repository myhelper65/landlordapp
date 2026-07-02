import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, Card, Table, TableBody, TableCell, TableHead, TableRow, Chip, CircularProgress } from '@mui/material';
import { Payment } from '@mui/icons-material';

const MyPayments = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/v1/tenant/my-invoices`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setInvoices(response.data);
            } catch (error) {
                console.error("Error fetching invoices:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoices();
    }, []);

    const getStatusChip = (status) => {
        if (status === 'PAID') return <Chip label="PAID" size="small" sx={{ bgcolor: '#d1fae5', color: '#059669', fontWeight: 700 }} />;
        if (status === 'UNPAID') return <Chip label="UNPAID" size="small" sx={{ bgcolor: '#fef3c7', color: '#d97706', fontWeight: 700 }} />;
        return <Chip label="OVERDUE" size="small" sx={{ bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 700 }} />;
    };

    if (loading) return <Box sx={{ mt: 10, textAlign: 'center' }}><CircularProgress /></Box>;

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Payment sx={{ fontSize: 32, color: '#1976d2', mr: 1.5 }} />
                <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: "'Merriweather', serif" }}>
                    My Payments
                </Typography>
            </Box>

            <Card sx={{ borderRadius: 3, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f9fafb' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {invoices.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>No payment history found.</TableCell>
                            </TableRow>
                        ) : (
                            invoices.map((inv) => (
                                <TableRow key={inv.id}>
                                    <TableCell>{inv.description || inv.notes}</TableCell>
                                    <TableCell>{inv.dueDate}</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>${inv.amount.toLocaleString()}</TableCell>
                                    <TableCell>{getStatusChip(inv.status)}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>
        </Box>
    );
};

export default MyPayments;