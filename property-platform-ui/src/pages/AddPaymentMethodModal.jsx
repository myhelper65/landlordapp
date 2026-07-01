import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Grid, Box, Typography, CircularProgress
} from '@mui/material';
import { CreditCard, Lock } from '@mui/icons-material';
import api from '../api/axiosInstance';

const AddPaymentMethodModal = ({ open, onClose, onMethodAdded }) => {
    const [loading, setLoading] = useState(false);

    // Gelişmiş FinTech projelerinde bu alanları doğrudan yönetmek yerine
    // <CardElement /> (Stripe) gibi kütüphane bileşenleri kullanılır.
    // Şimdilik demo ve Tokenization simülasyonu için kontrollü state kullanıyoruz.
    const [formData, setFormData] = useState({
        nameOnCard: '',
        cardNumber: '',
        expiry: '',
        cvv: '',
        zipCode: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            /* * GERÇEK SENARYO (TOKENIZATION):
             * 1. Stripe/Braintree'ye kart bilgisi gider.
             * 2. Stripe sana 'tok_1Nkjdf8...' gibi bir Gateway Token döner.
             * 3. Sen sadece o token'ı kendi backend'ine yollarsın.
             */

            // SİMÜLASYON (Backend'ine PaymentMethod ekleme isteği atıyoruz)
            const payload = {
                type: 'CARD',
                brand: formData.cardNumber.startsWith('4') ? 'Visa' : 'Mastercard',
                last4: formData.cardNumber.slice(-4) || '1234',
                gatewayToken: 'tok_' + Math.random().toString(36).substr(2, 9), // Simüle edilmiş token
                isDefault: true
            };

            await api.post('/payment-methods', payload);

            alert('Payment Method successfully securely stored!');
            onMethodAdded(); // Payment Center'daki listeyi yenilemek için tetikle
            onClose();

        } catch (error) {
            console.error("Error adding card", error);
            alert("Failed to securely save payment method.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center' }}>
                <Lock sx={{ color: '#059669', mr: 1 }} /> Securely Add Payment Method
            </DialogTitle>

            <DialogContent dividers>
                <Box sx={{ bgcolor: '#f0fdf4', p: 2, borderRadius: 2, mb: 3, display: 'flex', alignItems: 'center' }}>
                    <Lock sx={{ color: '#059669', mr: 1, fontSize: 18 }} />
                    <Typography variant="caption" color="#065f46">
                        Your payment details are encrypted and securely vaulted. We do not store your full card number or CVV.
                    </Typography>
                </Box>

                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            label="Name on Card"
                            name="nameOnCard"
                            fullWidth
                            variant="outlined"
                            value={formData.nameOnCard}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Card Number"
                            name="cardNumber"
                            fullWidth
                            variant="outlined"
                            placeholder="**** **** **** ****"
                            InputProps={{
                                endAdornment: <CreditCard color="action" />
                            }}
                            value={formData.cardNumber}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label="Expiration (MM/YY)"
                            name="expiry"
                            fullWidth
                            variant="outlined"
                            placeholder="MM/YY"
                            value={formData.expiry}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label="CVV"
                            name="cvv"
                            fullWidth
                            variant="outlined"
                            type="password"
                            inputProps={{ maxLength: 4 }}
                            value={formData.cvv}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Billing ZIP Code"
                            name="zipCode"
                            fullWidth
                            variant="outlined"
                            value={formData.zipCode}
                            onChange={handleChange}
                        />
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 2, bgcolor: '#f9fafb' }}>
                <Button onClick={onClose} color="inherit" sx={{ fontWeight: 600 }}>Cancel</Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    color="primary"
                    disabled={loading || !formData.cardNumber}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                    sx={{ fontWeight: 700, borderRadius: 2 }}
                >
                    {loading ? 'Vaulting Card...' : 'Save Securely'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddPaymentMethodModal;