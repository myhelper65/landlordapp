import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box, Typography, Card, Table, TableBody, TableCell, TableHead, TableRow,
    Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    FormControl, InputLabel, Select, MenuItem, CircularProgress, Grid, IconButton
} from '@mui/material';
import { Build, AddCircle, CloudUpload, Delete, Edit } from '@mui/icons-material';

const RepairRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);

    // Düzenleme Modu için Eklendi
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const [formData, setFormData] = useState({ title: '', description: '', priority: 'LOW' });
    const [selectedImage, setSelectedImage] = useState(null);

    const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080');

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/api/v1/tenant/repair-requests`, {
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
        } catch (error) {
            console.error("Fetch Error:", error);
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRequests(); }, []);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) setSelectedImage(e.target.files[0]);
    };

    const openCreateModal = () => {
        setIsEditing(false);
        setEditId(null);
        setFormData({ title: '', description: '', priority: 'LOW' });
        setSelectedImage(null);
        setOpenModal(true);
    };

    const openEditModal = (req) => {
        setIsEditing(true);
        setEditId(req.id);
        setFormData({ title: req.title, description: req.description, priority: req.priority });
        setSelectedImage(null);
        setOpenModal(true);
    };

    // SİLME İŞLEMİ
    const handleDelete = async (id) => {
        if (!window.confirm("Bu talebi silmek istediğinize emin misiniz?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/api/v1/tenant/repair-requests/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchRequests(); // Sildikten sonra listeyi yenile
        } catch (error) {
            console.error("Delete Error:", error);
            alert("Silme işlemi başarısız oldu.");
        }
    };

    // KAYDETME VEYA GÜNCELLEME İŞLEMİ
    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('priority', formData.priority);
            if (selectedImage) data.append('file', selectedImage);

            if (isEditing) {
                // Güncelleme İsteği (PUT)
                await axios.put(`${API_BASE_URL}/api/v1/tenant/repair-requests/${editId}`, data, {
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
                });
            } else {
                // Yeni Oluşturma İsteği (POST)
                await axios.post(`${API_BASE_URL}/api/v1/tenant/repair-requests`, data, {
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
                });
            }

            setOpenModal(false);
            fetchRequests();
        } catch (error) {
            console.error("Submit Error:", error);
            alert("İşlem başarısız oldu.");
        }
    };

    const getPriorityChip = (priority) => {
        switch(priority) {
            case 'LOW': return <Chip label="LOW" size="small" sx={{ bgcolor: '#4caf50', color: '#fff', fontWeight: 700, fontSize: '0.7rem' }} />;
            case 'MEDIUM': return <Chip label="MEDIUM" size="small" sx={{ bgcolor: '#ed6c02', color: '#fff', fontWeight: 700, fontSize: '0.7rem' }} />;
            case 'HIGH':
            case 'URGENT': return <Chip label={priority} size="small" sx={{ bgcolor: '#d32f2f', color: '#fff', fontWeight: 700, fontSize: '0.7rem' }} />;
            default: return <Chip label={priority || 'LOW'} size="small" />;
        }
    };

    const getStatusChip = (status) => {
        switch(status) {
            case 'OPEN': return <Chip label="OPEN" size="small" variant="outlined" color="primary" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />;
            case 'IN_PROGRESS': return <Chip label="IN_PROGRESS" size="small" variant="outlined" color="warning" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />;
            case 'RESOLVED': return <Chip label="RESOLVED" size="small" variant="outlined" color="success" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />;
            default: return <Chip label={status || 'UNKNOWN'} size="small" variant="outlined" />;
        }
    };

    if (loading) return <Box sx={{ mt: 10, textAlign: 'center' }}><CircularProgress /></Box>;

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Build sx={{ fontSize: 32, color: '#1976d2', mr: 1.5 }} />
                    <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: "'Merriweather', serif" }}>
                        My Repair Requests
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<AddCircle />} onClick={openCreateModal} sx={{ fontWeight: 600 }}>
                    NEW REQUEST
                </Button>
            </Box>

            <Card sx={{ borderRadius: 3, border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f9fafb' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Work Order #</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Property / Unit</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Image</TableCell>
                            <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {!requests || requests.length === 0 ? (
                            <TableRow><TableCell colSpan={7} align="center" sx={{ py: 3 }}>No repair requests found.</TableCell></TableRow>
                        ) : (
                            requests.map((req, index) => (
                                <TableRow key={req.id || index} hover>
                                    <TableCell sx={{ fontWeight: 700, color: '#1976d2' }}>{req.workOrderNumber}</TableCell>
                                    <TableCell>{req.title}</TableCell>
                                    <TableCell>{req.property?.unitNumber || 'N/A'}</TableCell>
                                    <TableCell>{getPriorityChip(req.priority)}</TableCell>
                                    <TableCell>{getStatusChip(req.status)}</TableCell>
                                    <TableCell align="center">
                                        {req.photoUrl ? (
                                            <img src={`${API_BASE_URL}${req.photoUrl}`} alt="T" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />
                                        ) : (
                                            <Typography variant="caption" color="textSecondary">-</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell align="center">
                                        {/* GÜNCELLEME VE SİLME BUTONLARI AKTİFLEŞTİRİLDİ */}
                                        <IconButton size="small" color="primary" onClick={() => openEditModal(req)}>
                                            <Edit fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" color="error" onClick={() => handleDelete(req.id)}>
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* MODAL */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 800 }}>{isEditing ? 'Edit Request' : 'Create Repair Request'}</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Issue Title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Priority</InputLabel>
                                <Select value={formData.priority} label="Priority" onChange={(e) => setFormData({...formData, priority: e.target.value})}>
                                    <MenuItem value="LOW">Low</MenuItem>
                                    <MenuItem value="MEDIUM">Medium</MenuItem>
                                    <MenuItem value="HIGH">High</MenuItem>
                                    <MenuItem value="URGENT">Urgent</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth multiline rows={4} label="Detailed Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ border: '1px dashed #ccc', p: 2, textAlign: 'center', borderRadius: 2 }}>
                                <Button component="label" variant="outlined" startIcon={<CloudUpload />}>
                                    {isEditing ? 'Update Image (Optional)' : 'Upload Image (Optional)'}
                                    <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                                </Button>
                                {selectedImage && <Typography display="block" sx={{ mt: 1 }}>{selectedImage.name}</Typography>}
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenModal(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit}>{isEditing ? 'Save Changes' : 'Submit Request'}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default RepairRequests;