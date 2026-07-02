import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, Card, CardContent, Grid, Button, CircularProgress } from '@mui/material';
import { Description, PictureAsPdf, InsertDriveFile } from '@mui/icons-material';

const MyLease = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const API_BASE_URL = 'http://localhost:8080';

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_BASE_URL}/api/v1/tenant/documents`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDocuments(response.data);
            } catch (error) {
                console.error("Error fetching lease docs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDocs();
    }, []);

    if (loading) return <Box sx={{ mt: 10, textAlign: 'center' }}><CircularProgress /></Box>;

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <Description sx={{ fontSize: 32, color: '#1976d2', mr: 1.5 }} />
                <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: "'Merriweather', serif" }}>
                    My Lease Documents
                </Typography>
            </Box>

            {documents.length === 0 ? (
                <Typography color="textSecondary">No documents have been uploaded for your property yet.</Typography>
            ) : (
                <Grid container spacing={3}>
                    {documents.map((doc) => (
                        <Grid item xs={12} sm={6} md={4} key={doc.id}>
                            <Card sx={{ borderRadius: 3, border: '1px solid #e5e7eb', boxShadow: 'none', textAlign: 'center', p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                                <Box sx={{ flexGrow: 1 }}>
                                    {doc.fileType === 'application/pdf' ? (
                                        <PictureAsPdf sx={{ fontSize: 60, color: '#d32f2f', mb: 1 }} />
                                    ) : (
                                        <InsertDriveFile sx={{ fontSize: 60, color: '#1976d2', mb: 1 }} />
                                    )}
                                    <Typography variant="subtitle2" noWrap sx={{ mb: 1, fontWeight: 600 }} title={doc.fileName}>
                                        {doc.fileName}
                                    </Typography>
                                    {doc.notes && (
                                        <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 2, lineHeight: 1.2, maxHeight: '3.6em', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }} title={doc.notes}>
                                            {doc.notes}
                                        </Typography>
                                    )}
                                </Box>
                                <Button variant="outlined" size="small" fullWidth target="_blank" href={`${API_BASE_URL}${doc.fileUrl}`}>
                                    View Document
                                </Button>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default MyLease;