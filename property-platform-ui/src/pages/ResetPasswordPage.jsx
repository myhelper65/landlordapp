import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, TextField, Button, Paper, Alert, CircularProgress } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { resetPassword } from '../api/authService';
import BusinessIcon from '@mui/icons-material/Business';

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState({ loading: false, success: false, error: '' });

    useEffect(() => {
        // Extract token from URL (e.g., ?token=xyz123)
        const params = new URLSearchParams(location.search);
        const urlToken = params.get('token');
        if (urlToken) {
            setToken(urlToken);
        } else {
            setStatus({ loading: false, success: false, error: 'Invalid or missing reset token.' });
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            setStatus({ loading: false, success: false, error: 'Passwords do not match.' });
            return;
        }

        if (newPassword.length < 8) {
            setStatus({ loading: false, success: false, error: 'Password must be at least 8 characters.' });
            return;
        }

        setStatus({ loading: true, success: false, error: '' });

        try {
            const message = await resetPassword(token, newPassword);
            setStatus({ loading: false, success: true, error: '' });
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error) {
            setStatus({ 
                loading: false, 
                success: false, 
                error: error.response?.data?.message || 'Failed to reset password. The link might be expired.' 
            });
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh', display: 'flex', bgcolor: '#f4f6f8'
        }}>
            {/* Left Side */}
            <Box sx={{
                flex: 1, display: { xs: 'none', md: 'flex' }, flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center', bgcolor: '#1a202c', color: 'white', p: 4
            }}>
                <BusinessIcon sx={{ fontSize: 80, mb: 2, color: '#3182ce' }} />
                <Typography variant="h3" fontWeight="bold" gutterBottom>Property Management</Typography>
                <Typography variant="h6" color="gray">Set New Password</Typography>
            </Box>

            {/* Right Side */}
            <Box sx={{
                flex: 1, display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center', p: 4
            }}>
                <Paper elevation={3} sx={{ p: 5, width: '100%', maxWidth: 400, borderRadius: 3 }}>
                    <Typography variant="h5" fontWeight="bold" textAlign="center" gutterBottom>
                        Create New Password
                    </Typography>
                    
                    {status.success ? (
                        <Alert severity="success" sx={{ mt: 2 }}>
                            Password successfully reset! Redirecting to login...
                        </Alert>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            {status.error && <Alert severity="error" sx={{ mb: 3 }}>{status.error}</Alert>}
                            
                            <TextField
                                fullWidth
                                label="New Password"
                                type="password"
                                variant="outlined"
                                margin="normal"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                disabled={!token || status.loading}
                            />
                            
                            <TextField
                                fullWidth
                                label="Confirm New Password"
                                type="password"
                                variant="outlined"
                                margin="normal"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={!token || status.loading}
                            />

                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                color="primary"
                                size="large"
                                sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 'bold' }}
                                disabled={!token || status.loading}
                            >
                                {status.loading ? <CircularProgress size={24} color="inherit" /> : "Reset Password"}
                            </Button>
                        </form>
                    )}
                </Paper>
            </Box>
        </Box>
    );
};

export default ResetPasswordPage;
