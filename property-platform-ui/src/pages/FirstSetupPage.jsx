import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, Box, Typography, TextField, Button, Paper,
    Stepper, Step, StepLabel, Alert, CircularProgress, InputAdornment, IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axiosInstance from '../api/axiosInstance';
import theme from '../theme';

const steps = ['Verify Current Password', 'Create New Password', 'Update Profile', 'Save Changes'];

const FirstSetupPage = () => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        email: localStorage.getItem('email') || '',
        phoneNumber: '',
        profilePictureUrl: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNext = () => {
        setError(null);

        // Validation per step
        if (activeStep === 0 && !formData.currentPassword) {
            setError("Current password is required");
            return;
        }

        if (activeStep === 1) {
            const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\S+$).{12,}$/;
            if (!passwordRegex.test(formData.newPassword)) {
                setError("Password must be at least 12 characters, include one uppercase, one lowercase, one number, and one special character.");
                return;
            }
            if (formData.newPassword !== formData.confirmPassword) {
                setError("New passwords do not match.");
                return;
            }
        }

        if (activeStep === 2) {
            if (!formData.firstName || !formData.lastName || !formData.email) {
                setError("First name, last name, and email are required.");
                return;
            }
        }

        if (activeStep === steps.length - 1) {
            handleSubmit();
        } else {
            setActiveStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
        setError(null);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            await axiosInstance.post('/profile/first-setup', {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                profilePictureUrl: formData.profilePictureUrl
            });

            // Update local storage
            localStorage.setItem('email', formData.email);
            localStorage.setItem('firstLoginRequired', 'false');
            
            // Redirect to dashboard
            navigate('/dashboard');
        } catch (err) {
            console.error("Setup error:", err);
            setError(err.response?.data?.message || 'An error occurred during setup.');
            setActiveStep(0); // Optional: go back to step 1 to re-enter password
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            To secure your administrator account, please enter your current temporary password.
                        </Typography>
                        <TextField
                            fullWidth
                            label="Current Password"
                            name="currentPassword"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.currentPassword}
                            onChange={handleChange}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>
                );
            case 1:
                return (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            Password must be at least 12 characters and include uppercase, lowercase, numbers, and special characters.
                        </Typography>
                        <TextField
                            fullWidth
                            margin="normal"
                            label="New Password"
                            name="newPassword"
                            type="password"
                            value={formData.newPassword}
                            onChange={handleChange}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Confirm New Password"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                    </Box>
                );
            case 2:
                return (
                    <Box sx={{ mt: 2 }}>
                        <TextField fullWidth margin="normal" label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} />
                        <TextField fullWidth margin="normal" label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />
                        <TextField fullWidth margin="normal" label="Professional Email" name="email" type="email" value={formData.email} onChange={handleChange} />
                        <TextField fullWidth margin="normal" label="Phone Number" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
                        <TextField fullWidth margin="normal" label="Profile Picture URL (Optional)" name="profilePictureUrl" value={formData.profilePictureUrl} onChange={handleChange} />
                    </Box>
                );
            case 3:
                return (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Typography variant="h6" gutterBottom>Review & Save</Typography>
                        <Typography variant="body1">Name: {formData.firstName} {formData.lastName}</Typography>
                        <Typography variant="body1">Email: {formData.email}</Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                            Clicking "Save & Continue" will permanently update your account and revoke the temporary password.
                        </Typography>
                    </Box>
                );
            default:
                return 'Unknown step';
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: theme.bgLight }}>
            <Container maxWidth="sm">
                <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                    <Typography variant="h4" align="center" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                        Account Security Setup
                    </Typography>
                    <Typography variant="body1" align="center" color="textSecondary" sx={{ mb: 4 }}>
                        Welcome to Property Management Platform. Before you begin, please secure your administrator account by updating your login credentials.
                    </Typography>

                    <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                    {renderStepContent(activeStep)}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                        <Button disabled={activeStep === 0 || loading} onClick={handleBack}>
                            Back
                        </Button>
                        <Button variant="contained" color="primary" onClick={handleNext} disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : (activeStep === steps.length - 1 ? 'Save & Continue' : 'Next')}
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default FirstSetupPage;
