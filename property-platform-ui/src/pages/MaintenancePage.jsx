import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Container, Typography, Box, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress, Button,
    Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
    FormControl, InputLabel, Select, MenuItem, Chip, TextField
} from '@mui/material';
import { Edit, Delete, CloudUpload, Build } from '@mui/icons-material';

import { getAllProperties } from '../api/propertyService';

const MaintenancePage = () => {
    const [requests, setRequests] = useState([]);
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editData, setEditData] = useState({ id: '', status: '', laborHours: '', outsourced: '', notes: '' });

    const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080');

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

    const handleEditSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            const payload = {
                status: editData.status,
                laborHours: editData.laborHours === '' ? null : Number(editData.laborHours),
                outsourced: editData.outsourced === '' ? null : editData.outsourced === 'true',
                notes: editData.notes
            };
            
            await axios.put(`${API_BASE_URL}/api/v1/admin/repair-requests/${editData.id}/status`,
                payload,
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
        setEditData({ 
            id: req.id, 
            status: req.status,
            laborHours: req.laborHours != null ? req.laborHours : '',
            outsourced: req.outsourced != null ? String(req.outsourced) : '',
            notes: req.notes || ''
        });
        setEditModalOpen(true);
    };

    const getPriorityChip = (priority) => {
        switch(priority) {
            case 'LOW': return <Chip label="LOW" size="small" sx={{ bgcolor: '#15803D', color: '#fff', fontWeight: 700, fontSize: '0.7rem' }} />;
            case 'MEDIUM': return <Chip label="MEDIUM" size="small" sx={{ bgcolor: '#D97706', color: '#fff', fontWeight: 700, fontSize: '0.7rem' }} />;
            case 'HIGH':
            case 'URGENT': return <Chip label={priority} size="small" sx={{ bgcolor: '#B91C1C', color: '#fff', fontWeight: 700, fontSize: '0.7rem' }} />;
            default: return <Chip label={priority || 'LOW'} size="small" sx={{ bgcolor: '#15803D', color: '#fff', fontWeight: 700, fontSize: '0.7rem' }} />;
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
                    <Build sx={{ fontSize: 32, color: '#D97706', mr: 1.5 }} />
                    <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: "'Merriweather', serif", color: '#1C1917' }}>
                        Maintenance Requests
                    </Typography>
                </Box>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid #E7E5E4', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#FAFAF9' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700, color: '#1C1917' }}>Work Order #</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#1C1917' }}>Issue / Description</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#1C1917' }}>Property / Unit</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#1C1917' }}>Tenant</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#1C1917' }}>Priority</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#1C1917' }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#1C1917' }}>Labor Hours</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#1C1917' }}>Outsourced</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#1C1917' }}>Notes</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#1C1917', textAlign: 'center' }}>Image</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#1C1917', textAlign: 'center' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {requests.map((r, index) => (
                            <TableRow key={r.id || index} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell sx={{ fontWeight: 700, color: '#D97706' }}>
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
                                <TableCell sx={{ fontWeight: 500 }}>
                                    {r.laborHours != null ? r.laborHours : '-'}
                                </TableCell>
                                <TableCell>
                                    {r.outsourced === true ? <Chip label="YES" size="small" color="primary" variant="outlined" /> : 
                                     r.outsourced === false ? <Chip label="NO" size="small" color="default" variant="outlined" /> : '-'}
                                </TableCell>
                                <TableCell sx={{ maxWidth: 150 }}>
                                    <Typography variant="body2" noWrap title={r.notes || ''}>
                                        {r.notes || '-'}
                                    </Typography>
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
                <DialogTitle sx={{ fontWeight: 800 }}>Update Request</DialogTitle>
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
                    
                    <TextField 
                        fullWidth 
                        margin="normal" 
                        label="Labor Hours" 
                        type="number"
                        value={editData.laborHours}
                        onChange={(e) => setEditData({ ...editData, laborHours: e.target.value })}
                    />
                    
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Outsourced</InputLabel>
                        <Select
                            value={editData.outsourced}
                            label="Outsourced"
                            onChange={(e) => setEditData({ ...editData, outsourced: e.target.value })}
                        >
                            <MenuItem value=""><em>None</em></MenuItem>
                            <MenuItem value="true">Yes</MenuItem>
                            <MenuItem value="false">No</MenuItem>
                        </Select>
                    </FormControl>
                    
                    <TextField 
                        fullWidth 
                        margin="normal" 
                        label="Notes" 
                        multiline
                        rows={3}
                        value={editData.notes}
                        onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleEditSubmit}>Update</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default MaintenancePage;