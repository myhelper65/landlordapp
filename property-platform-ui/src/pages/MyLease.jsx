import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, CircularProgress, Divider } from '@mui/material';
import { PictureAsPdf, InsertDriveFile, Visibility } from '@mui/icons-material';
import api from '../api/axiosInstance';

const MyLease = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    const theme = {
        bgMain: '#fafafa', primary: '#1976d2', textDark: '#111827', textGrey: '#6b7280'
    };

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                // Call the new Tenant Controller endpoint
                const response = await api.get('/tenant/documents');
                setDocuments(response.data);
            } catch (error) {
                console.error("Error fetching lease documents:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDocuments();
    }, []);

    // Function to open the document in a new tab
    const handleViewDocument = (fileUrl) => {
        // Because your WebConfig maps /uploads/**, we can access it directly.
        // Adjust the (import.meta.env.VITE_API_URL || 'http://localhost:8080') part if your backend runs on a different port/URL!
        const backendBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8080');
        window.open(`${backendBaseUrl}${fileUrl}`, '_blank');
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: theme.bgMain }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: theme.bgMain, minHeight: 'calc(100vh - 64px)' }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: theme.textDark, fontFamily: "'Merriweather', serif" }}>
                    My Lease Documents
                </Typography>
                <Typography variant="body1" sx={{ color: theme.textGrey, mt: 1 }}>
                    View and download important documents related to your apartment.
                </Typography>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {documents.length === 0 ? (
                <Card sx={{ borderRadius: 3, border: '1px solid #e5e7eb', boxShadow: 'none', p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                        No documents have been uploaded for your property yet.
                    </Typography>
                </Card>
            ) : (
                <Grid container spacing={3}>
                    {documents.map((doc) => (
                        <Grid item xs={12} sm={6} md={4} key={doc.id}>
                            <Card sx={{
                                textAlign: 'center',
                                p: 2,
                                borderRadius: 3,
                                border: '1px solid #e5e7eb',
                                boxShadow: 'none',
                                transition: '0.2s',
                                '&:hover': { borderColor: theme.primary, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }
                            }}>
                                <CardContent>
                                    {/* Show PDF icon if it's a PDF, otherwise a generic file icon */}
                                    {doc.fileType && doc.fileType.includes('pdf') ? (
                                        <PictureAsPdf sx={{ fontSize: 70, color: '#d32f2f', mb: 2 }} />
                                    ) : (
                                        <InsertDriveFile sx={{ fontSize: 70, color: '#1976d2', mb: 2 }} />
                                    )}

                                    <Typography variant="subtitle1" noWrap sx={{ fontWeight: 700, color: theme.textDark, mb: 2 }} title={doc.fileName}>
                                        {doc.fileName}
                                    </Typography>

                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        startIcon={<Visibility />}
                                        sx={{
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            borderRadius: 2,
                                            color: theme.primary,
                                            borderColor: `${theme.primary}50`
                                        }}
                                        onClick={() => handleViewDocument(doc.fileUrl)}
                                    >
                                        VIEW DOCUMENT
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default MyLease;