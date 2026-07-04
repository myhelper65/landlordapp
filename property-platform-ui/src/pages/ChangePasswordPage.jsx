import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, Box, Typography, TextField, Button, Paper, CircularProgress, Alert
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import { changePassword } from '../api/authService';

const ChangePasswordPage = () => {
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        if (newPassword !== confirmPassword) {
            setError('Yeni şifreler eşleşmiyor.');
            return;
        }
        if (newPassword.length < 6) {
            setError('Yeni şifreniz en az 6 karakter olmalıdır.');
            return;
        }

        setLoading(true);
        try {
            await changePassword(currentPassword, newPassword);
            setSuccess(true);
            localStorage.setItem('firstLoginRequired', 'false');
            
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Şifre güncellenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f4f6f8' }}>
            <Container maxWidth="sm">
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                        <LockResetIcon color="primary" sx={{ fontSize: 60 }} />
                    </Box>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                        Hoşgeldiniz!
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        Hesabınızın güvenliği için lütfen sistemin atadığı geçici şifreyi kendi şifrenizle değiştirin.
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 2 }}>Şifreniz başarıyla güncellendi! Yönlendiriliyorsunuz...</Alert>}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Mevcut Şifre (Geçici Şifre)"
                            type="password"
                            required
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Yeni Şifre"
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Yeni Şifre (Tekrar)"
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading || success}
                            sx={{ mt: 3, py: 1.5, fontWeight: 'bold' }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Şifremi Güncelle ve Devam Et'}
                        </Button>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
};

export default ChangePasswordPage;
