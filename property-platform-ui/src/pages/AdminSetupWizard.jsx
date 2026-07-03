import React, { useState } from 'react';
import {
    Box, Typography, Paper, TextField, Button, Stepper, Step, StepLabel,
    InputAdornment, IconButton, Alert, CircularProgress, Grid
} from '@mui/material';
import { Visibility, VisibilityOff, CheckCircle, LockOutlined, PersonOutlined, LocalPhoneOutlined } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const steps = ['Verify Identity', 'New Secure Password', 'Update Profile'];

const AdminSetupWizard = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: ''
    });

    const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

    const theme = { primary: '#1976d2', textDark: '#111827', textGrey: '#6b7280' };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const validatePassword = (pw) => {
        return pw.length >= 12 &&
               /[A-Z]/.test(pw) &&
               /[a-z]/.test(pw) &&
               /[0-9]/.test(pw) &&
               /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw);
    };

    const handleNext = () => {
        setError('');
        if (activeStep === 0) {
            if (!formData.currentPassword) return setError("Current password is required");
        }
        if (activeStep === 1) {
            if (!validatePassword(formData.newPassword)) {
                return setError("Password does not meet complexity requirements");
            }
            if (formData.newPassword !== formData.confirmPassword) {
                return setError("Passwords do not match");
            }
        }
        setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => setActiveStep((prev) => prev - 1);

    const handleSubmit = async () => {
        setError('');
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/v1/auth/admin-setup`, {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            // Setup complete! Save new token & state
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('firstLoginRequired', 'false');
            
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Error saving setup.');
            setActiveStep(0); // If current password was wrong, force back to start
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f3f4f6', display: 'flex', flexDirection: 'column', alignItems: 'center', p: { xs: 2, md: 6 } }}>
            <Paper elevation={0} sx={{ p: 5, borderRadius: 4, maxWidth: 600, width: '100%', border: '1px solid #e5e7eb' }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: theme.textDark, mb: 1 }}>
                        Welcome, Administrator
                    </Typography>
                    <Typography variant="body1" sx={{ color: theme.textGrey }}>
                        For security reasons, you must complete this setup before accessing the dashboard.
                    </Typography>
                </Box>

                <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                {/* STEP 0: Current Password */}
                {activeStep === 0 && (
                    <Box>
                        <TextField
                            fullWidth label="Current Password" type={showPw.current ? "text" : "password"}
                            name="currentPassword" value={formData.currentPassword} onChange={handleChange}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><LockOutlined/></InputAdornment>,
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPw({...showPw, current: !showPw.current})}>
                                            {showPw.current ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                            sx={{ mb: 2 }}
                        />
                    </Box>
                )}

                {/* STEP 1: New Password */}
                {activeStep === 1 && (
                    <Box>
                        <TextField
                            fullWidth label="New Password" type={showPw.new ? "text" : "password"}
                            name="newPassword" value={formData.newPassword} onChange={handleChange}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth label="Confirm New Password" type={showPw.confirm ? "text" : "password"}
                            name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                            sx={{ mb: 2 }}
                        />
                        <Box sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 2, border: '1px solid #e5e7eb' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Password Requirements:</Typography>
                            <Grid container spacing={1}>
                                <Grid item xs={6}><Typography variant="caption" color={formData.newPassword.length >= 12 ? 'success.main' : 'text.secondary'}>• Minimum 12 characters</Typography></Grid>
                                <Grid item xs={6}><Typography variant="caption" color={/[A-Z]/.test(formData.newPassword) ? 'success.main' : 'text.secondary'}>• 1 Uppercase letter</Typography></Grid>
                                <Grid item xs={6}><Typography variant="caption" color={/[a-z]/.test(formData.newPassword) ? 'success.main' : 'text.secondary'}>• 1 Lowercase letter</Typography></Grid>
                                <Grid item xs={6}><Typography variant="caption" color={/[0-9]/.test(formData.newPassword) ? 'success.main' : 'text.secondary'}>• 1 Number</Typography></Grid>
                                <Grid item xs={6}><Typography variant="caption" color={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.newPassword) ? 'success.main' : 'text.secondary'}>• 1 Special character</Typography></Grid>
                            </Grid>
                        </Box>
                    </Box>
                )}

                {/* STEP 2: Profile Update */}
                {activeStep === 2 && (
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} />
                        </Grid>
                    </Grid>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button disabled={activeStep === 0 || loading} onClick={handleBack}>
                        Back
                    </Button>
                    <Button 
                        variant="contained" 
                        onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : (activeStep === steps.length - 1 ? 'Complete Setup' : 'Next')}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default AdminSetupWizard;
