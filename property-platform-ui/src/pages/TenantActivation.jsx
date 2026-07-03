import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Box, Typography, Paper, TextField, Button, Grid,
    Alert, CircularProgress, Checkbox, FormControlLabel
} from '@mui/material';

const TenantActivation = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [tenantDetails, setTenantDetails] = useState(null);

    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: '',
        termsAccepted: false
    });

    const theme = { primary: '#1976d2', textDark: '#111827', textGrey: '#6b7280' };

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/v1/tenant/activate/${token}`);
                setTenantDetails(res.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Invalid or expired invitation link.');
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [token]);

    const validatePassword = (pw) => {
        return pw.length >= 12 &&
               /[A-Z]/.test(pw) &&
               /[a-z]/.test(pw) &&
               /[0-9]/.test(pw) &&
               /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.termsAccepted) return setError("You must accept the Terms of Service.");
        if (formData.newPassword !== formData.confirmPassword) return setError("Passwords do not match.");
        if (!validatePassword(formData.newPassword)) return setError("Password does not meet complexity requirements.");

        setSubmitting(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/v1/tenant/activate`, {
                token: token,
                newPassword: formData.newPassword,
                termsAccepted: formData.termsAccepted
            });

            const { token: jwt, role, email, firstLoginRequired } = res.data;
            localStorage.setItem('token', jwt);
            localStorage.setItem('role', role);
            localStorage.setItem('email', email);
            localStorage.setItem('firstLoginRequired', firstLoginRequired);

            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Error activating account.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f3f4f6', display: 'flex', flexDirection: 'column', alignItems: 'center', p: { xs: 2, md: 6 } }}>
            <Paper elevation={0} sx={{ p: 5, borderRadius: 4, maxWidth: 600, width: '100%', border: '1px solid #e5e7eb' }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: theme.textDark, mb: 1, textAlign: 'center' }}>
                    Activate Your Account
                </Typography>
                
                {error ? (
                    <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
                ) : (
                    <>
                        <Typography variant="body1" sx={{ color: theme.textGrey, mb: 4, textAlign: 'center' }}>
                            Welcome, <strong>{tenantDetails?.firstName} {tenantDetails?.lastName}</strong>! 
                            You have been invited to manage your lease for 
                            <strong> {tenantDetails?.communityName} - Unit {tenantDetails?.unitNumber}</strong>.
                        </Typography>

                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth required type="password" label="Create Password"
                                value={formData.newPassword}
                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth required type="password" label="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                sx={{ mb: 2 }}
                            />

                            <Box sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 2, border: '1px solid #e5e7eb', mb: 3 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Password Requirements:</Typography>
                                <Grid container spacing={1}>
                                    <Grid item xs={6}><Typography variant="caption" color={formData.newPassword.length >= 12 ? 'success.main' : 'text.secondary'}>• Min 12 chars</Typography></Grid>
                                    <Grid item xs={6}><Typography variant="caption" color={/[A-Z]/.test(formData.newPassword) ? 'success.main' : 'text.secondary'}>• 1 Uppercase</Typography></Grid>
                                    <Grid item xs={6}><Typography variant="caption" color={/[a-z]/.test(formData.newPassword) ? 'success.main' : 'text.secondary'}>• 1 Lowercase</Typography></Grid>
                                    <Grid item xs={6}><Typography variant="caption" color={/[0-9]/.test(formData.newPassword) ? 'success.main' : 'text.secondary'}>• 1 Number</Typography></Grid>
                                    <Grid item xs={12}><Typography variant="caption" color={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.newPassword) ? 'success.main' : 'text.secondary'}>• 1 Special char</Typography></Grid>
                                </Grid>
                            </Box>

                            <FormControlLabel
                                control={<Checkbox checked={formData.termsAccepted} onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })} />}
                                label="I accept the Terms of Service and Privacy Policy."
                                sx={{ mb: 3 }}
                            />

                            <Button 
                                type="submit" fullWidth variant="contained" 
                                disabled={submitting || !formData.termsAccepted}
                                sx={{ py: 1.5, fontSize: '16px', fontWeight: 700, borderRadius: 2 }}
                            >
                                {submitting ? <CircularProgress size={24} color="inherit" /> : 'Activate Account'}
                            </Button>
                        </form>
                    </>
                )}
            </Paper>
        </Box>
    );
};

export default TenantActivation;
