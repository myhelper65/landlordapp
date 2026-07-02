import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { loginWithGoogle } from '../api/authService';
import {
    Box, Typography, TextField, Button, Paper, InputAdornment,
    IconButton, Alert, CircularProgress, Grid, Divider
} from '@mui/material';
import { Visibility, VisibilityOff, EmailOutlined, LockOutlined, MapsHomeWork } from '@mui/icons-material';
import { GoogleLogin } from '@react-oauth/google';

const LoginPage = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const theme = {
        primary: '#1976d2', textDark: '#111827', textGrey: '#6b7280',
        bgMain: '#f3f4f6', cardBg: '#ffffff', borderLight: '#e5e7eb'
    };

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Backend auth endpoint'ine istek atıyoruz
            const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/v1/auth/login`, credentials);

            const { token, role, email } = response.data;

            // Gelen verileri LocalStorage'a kaydediyoruz
            localStorage.setItem('token', token);
            localStorage.setItem('role', role);
            localStorage.setItem('email', email);

            // Giriş başarılı, App.js'deki DashboardRouter onu doğru panele yönlendirecek
            navigate('/dashboard');

        } catch (err) {
            console.error("Login error:", err);
            setError(err.response?.data?.message || 'Geçersiz e-posta veya şifre. Lütfen tekrar deneyin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Grid container sx={{ minHeight: '100vh', bgcolor: theme.bgMain }}>

            {/* SOL TARAF: GÖRSEL & MARKA ALANI (Sadece büyük ekranlarda görünür) */}
            <Grid item xs={12} md={6} sx={{
                bgcolor: theme.textDark,
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                p: 4,
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Dekoratif Arka Plan Çemberleri */}
                <Box sx={{ position: 'absolute', top: '-10%', left: '-10%', width: 400, height: 400, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '50%' }} />
                <Box sx={{ position: 'absolute', bottom: '-20%', right: '-10%', width: 600, height: 600, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: '50%' }} />

                <MapsHomeWork sx={{ fontSize: 100, color: theme.primary, mb: 3 }} />
                <Typography variant="h3" sx={{ color: '#fff', fontWeight: 900, fontFamily: "'Merriweather', serif", mb: 2, textAlign: 'center' }}>
                    Property Management<br/>Platform
                </Typography>
                <Typography variant="h6" sx={{ color: theme.textGrey, fontWeight: 400, textAlign: 'center', maxWidth: 400 }}>
                    Modernizing real estate operations for administrators and tenants.
                </Typography>
            </Grid>

            {/* SAĞ TARAF: LOGİN FORMU ALANI */}
            <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
                <Paper elevation={0} sx={{
                    p: { xs: 4, md: 6 },
                    width: '100%',
                    maxWidth: 480,
                    borderRadius: 4,
                    border: `1px solid ${theme.borderLight}`,
                    bgcolor: theme.cardBg
                }}>
                    <Box sx={{ mb: 4, textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: theme.textDark, fontFamily: "'Merriweather', serif", mb: 1 }}>
                            Welcome Back
                        </Typography>
                        <Typography variant="body1" sx={{ color: theme.textGrey }}>
                            Please sign in to your account.
                        </Typography>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2, fontWeight: 600 }}>{error}</Alert>}

                    <form onSubmit={handleLogin}>
                        <TextField
                            fullWidth
                            required
                            label="Email Address"
                            name="email"
                            type="email"
                            variant="outlined"
                            value={credentials.email}
                            onChange={handleChange}
                            sx={{ mb: 3 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailOutlined sx={{ color: theme.textGrey }} />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            fullWidth
                            required
                            label="Password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            variant="outlined"
                            value={credentials.password}
                            onChange={handleChange}
                            sx={{ mb: 2 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockOutlined sx={{ color: theme.textGrey }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
                            <Typography variant="body2" sx={{ color: theme.primary, fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                                Forgot password?
                            </Typography>
                        </Box>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{
                                py: 1.5,
                                bgcolor: theme.primary,
                                fontSize: '16px',
                                fontWeight: 700,
                                borderRadius: 2,
                                textTransform: 'none',
                                boxShadow: 'none',
                                '&:hover': { bgcolor: '#1565c0', boxShadow: 'none' }
                            }}
                        >
                            {loading ? <CircularProgress size={26} sx={{ color: '#fff' }} /> : 'Sign In'}
                        </Button>
                    </form>

                    <Divider sx={{ my: 4, color: theme.textGrey, '&::before, &::after': { borderColor: theme.borderLight } }}>
                        <Typography variant="body2" sx={{ color: theme.textGrey }}>OR</Typography>
                    </Divider>

                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                        <GoogleLogin
                            onSuccess={async (credentialResponse) => {
                                try {
                                    setLoading(true);
                                    await loginWithGoogle(credentialResponse.credential);
                                    navigate('/dashboard');
                                } catch (err) {
                                    console.error("Google Login Error:", err);
                                    setError(err.response?.data?.message || 'Google Sign-In failed or user not found in system.');
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            onError={() => {
                                console.log('Login Failed');
                                setError('Google Sign-In failed. Please try again.');
                            }}
                            useOneTap
                            shape="pill"
                        />
                    </Box>

                    <Divider sx={{ my: 4, color: theme.textGrey, '&::before, &::after': { borderColor: theme.borderLight } }}>
                        <Typography variant="body2" sx={{ color: theme.textGrey }}>SECURE PORTAL</Typography>
                    </Divider>

                    <Typography variant="body2" sx={{ textAlign: 'center', color: theme.textGrey }}>
                        Need an account? Contact your property manager.
                    </Typography>

                </Paper>
            </Grid>
        </Grid>
    );
};

export default LoginPage;