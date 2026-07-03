import React, { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Paper, Alert, CircularProgress, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { requestPasswordReset } from '../api/authService';
import BusinessIcon from '@mui/icons-material/Business';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState({ loading: false, success: false, message: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, success: false, message: '' });

        try {
            const message = await requestPasswordReset(email);
            setStatus({ loading: false, success: true, message: message || 'If that email address is in our database, we will send you an email to reset your password.' });
        } catch (error) {
            setStatus({ loading: false, success: true, message: 'If that email address is in our database, we will send you an email to reset your password.' });
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh', display: 'flex', bgcolor: '#f4f6f8'
        }}>
            {/* Left Side (Branding - matches login page) */}
            <Box sx={{
                flex: 1, display: { xs: 'none', md: 'flex' }, flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center', bgcolor: '#1a202c', color: 'white', p: 4
            }}>
                <BusinessIcon sx={{ fontSize: 80, mb: 2, color: '#3182ce' }} />
                <Typography variant="h3" fontWeight="bold" gutterBottom>Property Management</Typography>
                <Typography variant="h6" color="gray">Secure Password Recovery</Typography>
            </Box>

            {/* Right Side (Form) */}
            <Box sx={{
                flex: 1, display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center', p: 4
            }}>
                <Paper elevation={3} sx={{ p: 5, width: '100%', maxWidth: 400, borderRadius: 3 }}>
                    <Typography variant="h5" fontWeight="bold" textAlign="center" gutterBottom>
                        Forgot Password
                    </Typography>
                    <Typography variant="body2" color="textSecondary" textAlign="center" sx={{ mb: 4 }}>
                        Enter your email address and we'll send you a link to reset your password.
                    </Typography>

                    {status.success && <Alert severity="success" sx={{ mb: 3 }}>{status.message}</Alert>}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email Address"
                            type="email"
                            variant="outlined"
                            margin="normal"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={status.loading || status.success}
                        />

                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            color="primary"
                            size="large"
                            sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 'bold' }}
                            disabled={status.loading || status.success}
                        >
                            {status.loading ? <CircularProgress size={24} color="inherit" /> : "Send Reset Link"}
                        </Button>
                    </form>

                    <Box textAlign="center" mt={3}>
                        <Link component="button" variant="body2" onClick={() => navigate('/login')}>
                            Back to Sign In
                        </Link>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
};

export default ForgotPasswordPage;
