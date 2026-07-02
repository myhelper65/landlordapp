import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Grid, Card, CardContent, Chip, CircularProgress,
    Button, Dialog, DialogTitle, DialogContent, DialogActions,
    Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, TextField, Divider
} from '@mui/material';
import { Payment, ReceiptLong, CheckCircle, CreditCard, AddCard } from '@mui/icons-material';
import api from '../api/axiosInstance';

const PaymentCenter = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    // Payment Modal States
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [processingPayment, setProcessingPayment] = useState(false);

    // --- NEW: Dynamic Payment Method States ---
    const [savedMethods, setSavedMethods] = useState([]);
    const [selectedMethodId, setSelectedMethodId] = useState('');
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [loadingMethods, setLoadingMethods] = useState(false);
    const [paymentType, setPaymentType] = useState('CARD'); // CARD or ACH
    const [newMethodData, setNewMethodData] = useState({
        name: '',
        number: '',
        expiry: '',
        cvv: '',
        routingNumber: '',
        accountNumber: ''
    });

    const theme = {
        bgMain: '#fafafa', primary: '#1976d2', textDark: '#111827', textGrey: '#6b7280',
        greenText: '#059669', greenBg: '#d1fae5',
        orangeText: '#d97706', orangeBg: '#fef3c7'
    };

    const fetchInvoices = async () => {
        try {
            const response = await api.get('/invoices/tenant');
            const invoiceData = response.data.content ? response.data.content : response.data;
            setInvoices(Array.isArray(invoiceData) ? invoiceData : []);
        } catch (error) {
            console.error("Faturalar çekilirken hata oluştu:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
        const interval = setInterval(() => {
            fetchInvoices();
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    // --- NEW: Fetch Payment Methods when Modal Opens ---
    const fetchPaymentMethods = async () => {
        setLoadingMethods(true);
        try {
            // Your backend endpoint for fetching the tenant's saved payment methods
            const response = await api.get('/payment-methods');
            const methods = response.data;
            setSavedMethods(methods);

            // Logic gate: If they have cards, select the first one. If not, force "Add New".
            if (methods.length > 0) {
                setSelectedMethodId(methods[0].id);
                setIsAddingNew(false);
            } else {
                setIsAddingNew(true);
            }
        } catch (error) {
            console.error("Failed to fetch payment methods:", error);
        } finally {
            setLoadingMethods(false);
        }
    };

    const handleOpenPaymentModal = (invoice) => {
        setSelectedInvoice(invoice);
        setPaymentModalOpen(true);
        fetchPaymentMethods(); // Fetch cards right when they click "Pay Now"
    };

    const handleCloseModal = () => {
        if (!processingPayment) {
            setPaymentModalOpen(false);
            setSelectedInvoice(null);
        }
    };

    const handleConfirmPayment = async () => {
        if (!selectedInvoice) return;
        setProcessingPayment(true);

        try {
            let finalMethodId = selectedMethodId;
            if (isAddingNew) {
                // Simulate Tokenization
                const payload = {
                    type: paymentType,
                    brand: paymentType === 'CARD' ? (newMethodData.number.startsWith('4') ? 'Visa' : 'Mastercard') : 'Bank Account',
                    last4: paymentType === 'CARD' ? newMethodData.number.slice(-4) || '1234' : newMethodData.accountNumber.slice(-4) || '6789',
                    gatewayToken: 'tok_' + Math.random().toString(36).substr(2, 9),
                    isDefault: true
                };
                
                const methodRes = await api.post('/payment-methods', payload);
                finalMethodId = methodRes.data.id;
            }

            // You can pass the finalMethodId to your backend if it requires it
            await api.put(`/invoices/${selectedInvoice.id}/pay`);

            // Update UI instantly
            setInvoices(prevInvoices =>
                prevInvoices.map(inv =>
                    inv.id === selectedInvoice.id ? { ...inv, status: 'PAID' } : inv
                )
            );

            setPaymentModalOpen(false);
            setSelectedInvoice(null);
            setNewMethodData({ name: '', number: '', expiry: '', cvv: '', routingNumber: '', accountNumber: '' });
        } catch (error) {
            console.error("Payment error:", error);
            alert("Payment failed. Please try again.");
        } finally {
            setProcessingPayment(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: theme.bgMain }}>
                <CircularProgress />
            </Box>
        );
    }

    const unpaidInvoices = invoices.filter(inv => inv.status !== 'PAID');
    const paidInvoices = invoices.filter(inv => inv.status === 'PAID');

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: theme.bgMain, minHeight: 'calc(100vh - 64px)' }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: theme.textDark, fontFamily: "'Merriweather', serif" }}>
                    Payment Center
                </Typography>
                <Typography variant="body1" sx={{ color: theme.textGrey, mt: 1 }}>
                    Manage your invoices and payment history here.
                </Typography>
            </Box>

            <Grid container spacing={4}>
                {/* UNPAID INVOICES */}
                <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: theme.textDark, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Payment sx={{ color: theme.orangeText }} /> Pending Payments
                    </Typography>

                    {unpaidInvoices.length === 0 ? (
                        <Card sx={{ borderRadius: 3, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
                            <CardContent>
                                <Typography variant="body2" color="text.secondary">You are all caught up! No pending payments.</Typography>
                            </CardContent>
                        </Card>
                    ) : (
                        unpaidInvoices.map(invoice => (
                            <Card key={invoice.id} sx={{ borderRadius: 3, border: '1px solid #e5e7eb', boxShadow: 'none', mb: 2 }}>
                                <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.textDark }}>
                                            {invoice.description || 'Monthly Rent'}
                                        </Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 800, color: theme.orangeText, my: 0.5 }}>
                                            ${invoice.amount}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: theme.textGrey }}>
                                            Due: {invoice.dueDate}
                                        </Typography>
                                    </Box>
                                    <Button
                                        variant="contained"
                                        onClick={() => handleOpenPaymentModal(invoice)}
                                        sx={{ bgcolor: theme.primary, textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                                    >
                                        Pay Now
                                    </Button>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </Grid>

                {/* PAID INVOICES */}
                <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: theme.textDark, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ReceiptLong sx={{ color: theme.greenText }} /> Payment History
                    </Typography>

                    {paidInvoices.length === 0 ? (
                        <Card sx={{ borderRadius: 3, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
                            <CardContent>
                                <Typography variant="body2" color="text.secondary">No payment history found.</Typography>
                            </CardContent>
                        </Card>
                    ) : (
                        paidInvoices.map(invoice => (
                            <Card key={invoice.id} sx={{ borderRadius: 3, border: '1px solid #e5e7eb', boxShadow: 'none', mb: 2 }}>
                                <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.textDark }}>
                                            {invoice.description || 'Monthly Rent'}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: theme.textGrey, mt: 0.5 }}>
                                            Paid Amount: ${invoice.amount}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: theme.textGrey }}>
                                            Due was: {invoice.dueDate}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        icon={<CheckCircle fontSize="small" />}
                                        label="Paid"
                                        sx={{ bgcolor: theme.greenBg, color: theme.greenText, fontWeight: 700 }}
                                    />
                                </CardContent>
                            </Card>
                        ))
                    )}
                </Grid>
            </Grid>

            {/* PAYMENT OPTIONS MODAL */}
            <Dialog
                open={paymentModalOpen}
                onClose={handleCloseModal}
                fullWidth
                maxWidth="sm"
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid #e5e7eb', pb: 2 }}>
                    Complete Your Payment
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    {selectedInvoice && (
                        <Box sx={{ mb: 4, textAlign: 'center', p: 2, bgcolor: '#f3f4f6', borderRadius: 2 }}>
                            <Typography variant="body2" color="textSecondary">Total Amount Due</Typography>
                            <Typography variant="h3" sx={{ fontWeight: 900, color: theme.primary, mt: 1 }}>
                                ${selectedInvoice.amount}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                For: {selectedInvoice.description || 'Monthly Rent'}
                            </Typography>
                        </Box>
                    )}

                    {loadingMethods ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress size={30} />
                        </Box>
                    ) : (
                        <FormControl component="fieldset" fullWidth>
                            {!isAddingNew ? (
                                <>
                                    <FormLabel component="legend" sx={{ fontWeight: 700, color: theme.textDark, mb: 2 }}>
                                        Select Saved Payment Method
                                    </FormLabel>
                                    <RadioGroup
                                        value={selectedMethodId}
                                        onChange={(e) => setSelectedMethodId(e.target.value)}
                                    >
                                        {savedMethods.map((method) => (
                                            <Card key={method.id} sx={{ mb: 1.5, border: selectedMethodId === method.id ? `2px solid ${theme.primary}` : '1px solid #e5e7eb', boxShadow: 'none' }}>
                                                <FormControlLabel
                                                    value={method.id}
                                                    control={<Radio color="primary" />}
                                                    label={
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
                                                            <CreditCard sx={{ color: '#6b7280' }} />
                                                            <Typography sx={{ fontWeight: 600 }}>
                                                                {method.brand} •••• {method.last4}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                    sx={{ width: '100%', m: 0, px: 2 }}
                                                />
                                            </Card>
                                        ))}
                                    </RadioGroup>

                                    <Button
                                        onClick={() => setIsAddingNew(true)}
                                        startIcon={<AddCard />}
                                        sx={{ mt: 1, color: theme.primary, textTransform: 'none', fontWeight: 600 }}
                                    >
                                        Add New Payment Method
                                    </Button>
                                </>
                            ) : (
                                <Box sx={{ mt: 1 }}>
                                    <FormLabel component="legend" sx={{ fontWeight: 700, color: theme.textDark, mb: 2 }}>
                                        Enter New Payment Details
                                    </FormLabel>

                                    <Box sx={{ mb: 2 }}>
                                        <Button 
                                            variant={paymentType === 'CARD' ? 'contained' : 'outlined'} 
                                            onClick={() => setPaymentType('CARD')}
                                            sx={{ mr: 1, borderRadius: 2 }}
                                        >Credit/Debit</Button>
                                        <Button 
                                            variant={paymentType === 'ACH' ? 'contained' : 'outlined'} 
                                            onClick={() => setPaymentType('ACH')}
                                            sx={{ borderRadius: 2 }}
                                        >Bank Account (ACH)</Button>
                                    </Box>

                                    {paymentType === 'CARD' ? (
                                        <>
                                            <TextField fullWidth label="Cardholder Name" variant="outlined" size="small" sx={{ mb: 2 }} value={newMethodData.name} onChange={e => setNewMethodData({...newMethodData, name: e.target.value})} />
                                            <TextField fullWidth label="Card Number" variant="outlined" size="small" sx={{ mb: 2 }} value={newMethodData.number} onChange={e => setNewMethodData({...newMethodData, number: e.target.value})} />
                                            <Grid container spacing={2}>
                                                <Grid item xs={6}>
                                                    <TextField fullWidth label="MM/YY" variant="outlined" size="small" value={newMethodData.expiry} onChange={e => setNewMethodData({...newMethodData, expiry: e.target.value})} />
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <TextField fullWidth label="CVC" variant="outlined" size="small" value={newMethodData.cvv} onChange={e => setNewMethodData({...newMethodData, cvv: e.target.value})} />
                                                </Grid>
                                            </Grid>
                                        </>
                                    ) : (
                                        <>
                                            <TextField fullWidth label="Account Holder Name" variant="outlined" size="small" sx={{ mb: 2 }} value={newMethodData.name} onChange={e => setNewMethodData({...newMethodData, name: e.target.value})} />
                                            <TextField fullWidth label="Routing Number" variant="outlined" size="small" sx={{ mb: 2 }} value={newMethodData.routingNumber} onChange={e => setNewMethodData({...newMethodData, routingNumber: e.target.value})} />
                                            <TextField fullWidth label="Account Number" variant="outlined" size="small" sx={{ mb: 2 }} value={newMethodData.accountNumber} onChange={e => setNewMethodData({...newMethodData, accountNumber: e.target.value})} />
                                        </>
                                    )}

                                    {/* Only show "Back" button if they actually have saved cards to go back to */}
                                    {savedMethods.length > 0 && (
                                        <Button
                                            onClick={() => setIsAddingNew(false)}
                                            sx={{ mt: 2, color: theme.textGrey, textTransform: 'none' }}
                                        >
                                            ← Back to saved methods
                                        </Button>
                                    )}
                                </Box>
                            )}
                        </FormControl>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0, borderTop: '1px solid #e5e7eb', mt: 2 }}>
                    <Button onClick={handleCloseModal} disabled={processingPayment} sx={{ color: theme.textGrey, fontWeight: 600 }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmPayment}
                        variant="contained"
                        disabled={processingPayment || (!isAddingNew && !selectedMethodId)}
                        sx={{ bgcolor: theme.primary, px: 4, fontWeight: 700, borderRadius: 2 }}
                    >
                        {processingPayment ? <CircularProgress size={24} color="inherit" /> : `Pay $${selectedInvoice?.amount || ''}`}
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
};

export default PaymentCenter;