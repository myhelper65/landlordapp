import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Card, CardContent, Chip, IconButton,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField, InputAdornment, Button, CircularProgress
} from '@mui/material';
import { Search, Download, Receipt, FilterList } from '@mui/icons-material';
import api from '../api/axiosInstance';
import { format } from 'date-fns';

const PaymentHistory = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // Hits GET /api/v1/payments/history
                const response = await api.get('/payments/history');
                setPayments(response.data);
            } catch (error) {
                console.error("Error fetching payment history", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const getStatusChip = (status) => {
        const statusConfig = {
            COMPLETED: { color: 'success', label: 'Completed' },
            PROCESSING: { color: 'warning', label: 'Processing' },
            FAILED: { color: 'error', label: 'Failed' },
            REFUNDED: { color: 'default', label: 'Refunded' }
        };
        const config = statusConfig[status] || { color: 'default', label: status };
        return <Chip label={config.label} color={config.color} size="small" sx={{ fontWeight: 600 }} />;
    };

    const filteredPayments = payments.filter(payment =>
        payment.confirmationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.amount.toString().includes(searchTerm)
    );

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#fafafa', minHeight: 'calc(100vh - 64px)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827' }}>Payment History</Typography>
                <Button variant="outlined" startIcon={<FilterList />}>Filter</Button>
            </Box>

            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: '1px solid #e5e7eb' }}>
                <CardContent sx={{ p: 0 }}>
                    {/* Search Bar */}
                    <Box sx={{ p: 2, borderBottom: '1px solid #e5e7eb' }}>
                        <TextField
                            size="small"
                            placeholder="Search by Confirmation # or Amount"
                            variant="outlined"
                            fullWidth
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
                            }}
                            sx={{ maxWidth: 400, bgcolor: 'white' }}
                        />
                    </Box>

                    {/* Data Table */}
                    <TableContainer>
                        <Table sx={{ minWidth: 800 }}>
                            <TableHead sx={{ bgcolor: '#f9fafb' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700, color: '#6b7280' }}>Date & Time</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: '#6b7280' }}>Confirmation #</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: '#6b7280' }}>Amount</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: '#6b7280' }}>Method</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: '#6b7280' }}>Status</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, color: '#6b7280' }}>Receipt</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredPayments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 5, color: '#6b7280' }}>
                                            No payment history found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredPayments.map((payment) => (
                                        <TableRow key={payment.id} hover>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {format(new Date(payment.processedAt), 'MMM dd, yyyy')}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {format(new Date(payment.processedAt), 'hh:mm a')}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ fontFamily: 'monospace' }}>{payment.confirmationNumber}</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>${payment.amount.toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{payment.paymentMethodBrand}</Typography>
                                                <Typography variant="caption" color="text.secondary">**** {payment.paymentMethodLast4}</Typography>
                                            </TableCell>
                                            <TableCell>{getStatusChip(payment.status)}</TableCell>
                                            <TableCell align="right">
                                                <IconButton color="primary" title="View Receipt">
                                                    <Receipt />
                                                </IconButton>
                                                <IconButton color="primary" title="Download PDF">
                                                    <Download />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </Box>
    );
};

export default PaymentHistory;