import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Grid, Card, CardContent, Chip, CircularProgress,
    Button, Dialog, DialogTitle, DialogContent, DialogActions,
    Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, TextField, Divider
} from '@mui/material';
import { Payment, ReceiptLong, CheckCircle, CreditCard, AddCard, DeleteOutlined } from '@mui/icons-material';
import api from '../api/axiosInstance';
import { getPaymentMethods, addPaymentMethod, deletePaymentMethod } from '../api/paymentService';

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
    const [newCard, setNewCard] = useState({ cardholderName: '', cardNumber: '', expiryDate: '', cvc: '' });

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
            const methods = await getPaymentMethods();
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
            if (isAddingNew) {
                // Save new card to backend first
                const newMethod = await addPaymentMethod({
                    cardholderName: newCard.cardholderName,
                    cardNumber: newCard.cardNumber,
                    expiryDate: newCard.expiryDate,
                    cvc: newCard.cvc,
                    type: 'CARD'
                });
                
                // Refresh list of methods and select it
                await fetchPaymentMethods();
                setSelectedMethodId(newMethod.id);
                setIsAddingNew(false);
                
                // Then pay the invoice
                await api.put(`/invoices/${selectedInvoice.id}/pay`, { paymentMethodId: newMethod.id });
            } else {
                // Processing with a saved card
                await api.put(`/invoices/${selectedInvoice.id}/pay`, { paymentMethodId: selectedMethodId });
            }

            // Update UI instantly
            setInvoices(prevInvoices =>
                prevInvoices.map(inv =>
                    inv.id === selectedInvoice.id ? { ...inv, status: 'PAID' } : inv
                )
            );

            setPaymentModalOpen(false);
            setSelectedInvoice(null);
            // Optional: Show a nice snackbar instead of alert in the future
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

            {/* MY PAYMENT METHODS */}
            <Box sx={{ mt: 6 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, color: theme.textDark, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CreditCard sx={{ color: theme.primary }} /> My Payment Methods
                </Typography>
                
                <Grid container spacing={3}>
                    {savedMethods.map((method) => (
                        <Grid item xs={12} sm={6} md={4} key={method.id}>
                            <Card sx={{ borderRadius: 3, border: '1px solid #e5e7eb', boxShadow: 'none' }}>
                                <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{ bgcolor: '#f3f4f6', p: 1.5, borderRadius: 2 }}>
                                            <CreditCard sx={{ color: '#6b7280' }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.textDark }}>
                                                {method.brand} ending in {method.last4}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: theme.textGrey }}>
                                                {method.type}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Button 
                                        color="error" 
                                        size="small"
                                        onClick={async () => {
                                            if (window.confirm('Are you sure you want to remove this payment method?')) {
                                                await deletePaymentMethod(method.id);
                                                fetchPaymentMethods();
                                            }
                                        }}
                                        sx={{ minWidth: 'auto', p: 1 }}
                                    >
                                        <DeleteOutlined />
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                    
                    <Grid item xs={12} sm={6} md={4}>
                        <Card 
                            onClick={() => {
                                setIsAddingNew(true);
                                setPaymentModalOpen(true);
                                setSelectedInvoice(null);
                            }}
                            sx={{ 
                                borderRadius: 3, 
                                border: '2px dashed #d1d5db', 
                                boxShadow: 'none', 
                                height: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                cursor: 'pointer',
                                '&:hover': { bgcolor: '#f9fafb' }
                            }}
                        >
                            <CardContent sx={{ textAlign: 'center' }}>
                                <AddCard sx={{ color: theme.primary, fontSize: 32, mb: 1 }} />
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.primary }}>
                                    Add New Method
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>

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
                                        Enter New Card Details
                                    </FormLabel>

                                    {/* Mock form for new card - later replace with Stripe Elements */}
                                    <TextField fullWidth label="Cardholder Name" variant="outlined" size="small" sx={{ mb: 2 }} value={newCard.cardholderName} onChange={(e) => setNewCard({...newCard, cardholderName: e.target.value})} required />
                                    <TextField fullWidth label="Card Number" variant="outlined" size="small" sx={{ mb: 2 }} value={newCard.cardNumber} onChange={(e) => setNewCard({...newCard, cardNumber: e.target.value})} required />
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <TextField fullWidth label="MM/YY" variant="outlined" size="small" value={newCard.expiryDate} onChange={(e) => setNewCard({...newCard, expiryDate: e.target.value})} required />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField fullWidth label="CVC" variant="outlined" size="small" value={newCard.cvc} onChange={(e) => setNewCard({...newCard, cvc: e.target.value})} required />
                                        </Grid>
                                    </Grid>

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