import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Container, Typography, Box, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress, Button,
    Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
    FormControl, InputLabel, Select, MenuItem, Chip
} from '@mui/material';
import { Edit, Delete, CloudUpload, Build } from '@mui/icons-material';

import { getAllProperties } from '../api/propertyService';

const MaintenancePage = () => {
    const [requests, setRequests] = useState([]);
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editData, setEditData] = useState({ id: '', status: '' });

    const API_BASE_URL = 'http://localhost:8080';

    // 1. ADMIN İÇİN TÜM TALEPLERİ GETİR
    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/api/v1/admin/repair-requests`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            let data = response.data;
            if (typeof data === 'string') {
                try { data = JSON.parse(data); } catch (e) { console.error("Parse error", e); }
            }

            if (Array.isArray(data)) setRequests(data);
            else if (data && Array.isArray(data.content)) setRequests(data.content);
            else if (data && Array.isArray(data.data)) setRequests(data.data);
            else setRequests([]);

            const propData = await getAllProperties();
            setProperties(propData?.content || propData || []);
        } catch (error) {
            console.error("Veri çekme hatası:", error);
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // 2. ADMIN İÇİN DURUM GÜNCELLEME (UPDATE STATUS)
    const handleEditSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE_URL}/api/v1/admin/repair-requests/${editData.id}/status`,
                { status: editData.status },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setEditModalOpen(false);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || "Güncelleme başarısız.");
        }
    };

    // 3. ADMIN İÇİN SİLME (DELETE)
    const handleDelete = async (id) => {
        if (window.confirm("Bu iş emrini silmek istediğinize emin misiniz?")) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API_BASE_URL}/api/v1/tenant/repair-requests/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchData();
            } catch (error) {
                alert(error.response?.data?.message || "Silme işlemi başarısız.");
            }
        }
    };

    // 4. ADMIN İÇİN FOTOĞRAF YÜKLEME
    const handlePhotoChange = async (requestId, event) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        if (files.length > 6) {
            alert("Tek seferde en fazla 6 fotoğraf seçebilirsiniz!");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const data = new FormData();
            Array.from(files).forEach(file => data.append('files', file));

            await axios.post(`${API_BASE_URL}/api/v1/maintenance-requests/${requestId}/photo`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            fetchData();
        } catch (error) {
            alert(error.response?.data || "Fotoğraf yüklenirken bir hata oluştu.");
        }
    };

    const openEditModal = (req) => {
        setEditData({ id: req.id, status: req.status });
        setEditModalOpen(true);
    };

    const getPriorityChip = (priority) => {
        switch(priority) {
            case 'LOW': return <Chip label="LOW" size="small" sx={{ bgcolor: '#4caf50', color: '#fff', fontWeight: 700, fontSize: '0.7rem' }} />;
            case 'MEDIUM': return <Chip label="MEDIUM" size="small" sx={{ bgcolor: '#ed6c02', color: '#fff', fontWeight: 700, fontSize: '0.7rem' }} />;
            case 'HIGH':
            case 'URGENT': return <Chip label={priority} size="small" sx={{ bgcolor: '#d32f2f', color: '#fff', fontWeight: 700, fontSize: '0.7rem' }} />;
            default: return <Chip label={priority || 'LOW'} size="small" sx={{ bgcolor: '#4caf50', color: '#fff', fontWeight: 700, fontSize: '0.7rem' }} />;
        }
    };

    const getStatusChip = (status) => {
        switch(status) {
            case 'OPEN': return <Chip label="OPEN" size="small" variant="outlined" color="primary" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />;
            case 'IN_PROGRESS': return <Chip label="IN PROGRESS" size="small" variant="outlined" color="warning" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />;
            case 'RESOLVED':
            case 'COMPLETED': return <Chip label="RESOLVED" size="small" variant="outlined" color="success" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />;
            case 'CANCELLED': return <Chip label="CANCELLED" size="small" variant="outlined" color="error" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />;
            default: return <Chip label={status || 'UNKNOWN'} size="small" variant="outlined" />;
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 20 }}><CircularProgress /></Box>;

    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Build sx={{ fontSize: 32, color: '#1976d2', mr: 1.5 }} />
                    <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: "'Merriweather', serif", color: '#111827' }}>
                        Maintenance Requests
                    </Typography>
                </Box>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f9fafb' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700, color: '#374151' }}>Work Order #</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#374151' }}>Issue / Description</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#374151' }}>Property / Unit</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#374151' }}>Tenant</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#374151' }}>Priority</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#374151' }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#374151', textAlign: 'center' }}>Image</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#374151', textAlign: 'center' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {requests.map((r, index) => (
                            <TableRow key={r.id || index} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell sx={{ fontWeight: 700, color: '#1976d2' }}>
                                    {r.workOrderNumber || 'N/A'}
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{r.title}</Typography>
                                    <Typography variant="caption" color="textSecondary" sx={{ display: 'block', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {r.description}
                                    </Typography>
                                </TableCell>
                                <TableCell sx={{ fontWeight: 500 }}>{r.property?.community?.name || ''} - {r.property?.unitNumber || 'N/A'}</TableCell>
                                <TableCell sx={{ fontWeight: 500 }}>
                                    {r.user?.firstName} {r.user?.lastName}
                                    <Typography variant="caption" display="block" color="textSecondary">{r.user?.email}</Typography>
                                </TableCell>
                                <TableCell>
                                    {getPriorityChip(r.priority)}
                                </TableCell>
                                <TableCell>
                                    {getStatusChip(r.status)}
                                </TableCell>

                                <TableCell align="center" sx={{ width: '100px' }}>
                                    {r.photoUrl ? (
                                        <a href={`${API_BASE_URL}${r.photoUrl}`} target="_blank" rel="noopener noreferrer">
                                            <img
                                                src={`${API_BASE_URL}${r.photoUrl}`}
                                                alt="Issue Thumbnail"
                                                style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #ccc' }}
                                            />
                                        </a>
                                    ) : (
                                        <Button component="label" size="small" startIcon={<CloudUpload />} sx={{ fontSize: '11px', mt: 1, textTransform: 'none' }}>
                                            UPLOAD
                                            <input type="file" multiple accept="image/*" hidden onChange={(e) => handlePhotoChange(r.id, e)} />
                                        </Button>
                                    )}
                                </TableCell>

                                <TableCell align="center">
                                    <IconButton size="small" color="primary" title="Update Status" onClick={() => openEditModal(r)}>
                                        <Edit fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" color="error" title="Delete" onClick={() => handleDelete(r.id)}>
                                        <Delete fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {requests.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                    No repair requests found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* EDIT STATUS MODAL */}
            <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle sx={{ fontWeight: 800 }}>Update Request Status</DialogTitle>
                <DialogContent dividers>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={editData.status}
                            label="Status"
                            onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                        >
                            <MenuItem value="OPEN">Open</MenuItem>
                            <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                            <MenuItem value="RESOLVED">Resolved</MenuItem>
                            <MenuItem value="CANCELLED">Cancelled</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleEditSubmit}>Update Status</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default MaintenancePage;