import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box, Typography, Card, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Button, IconButton, Chip, CircularProgress,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    FormControl, InputLabel, Select, MenuItem, Grid
} from '@mui/material';
import { Edit, Delete, Payment, ReceiptLong } from '@mui/icons-material';

const Invoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    const [openForm, setOpenForm] = useState(false);
    const [formMode, setFormMode] = useState('add');
    const [openDelete, setOpenDelete] = useState(false);
    const [openHistory, setOpenHistory] = useState(false);

    const [selectedInvoice, setSelectedInvoice] = useState(null);

    const [formData, setFormData] = useState({
        notes: '', propertyId: '', amount: '', dueDate: '', type: 'RENT', status: 'UNPAID'
    });

    const theme = {
        bgMain: '#fafafa', cardBg: '#ffffff', textDark: '#111827', textGrey: '#6b7280',
        borderLight: '#e5e7eb', primary: '#1976d2',
        greenBg: '#e6f4ea', greenText: '#1e8e3e',
        redBg: '#fce8e6', redText: '#d93025',
        orangeBg: '#fef7e0', orangeText: '#b06000'
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [invoicesRes, propertiesRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/v1/invoices`, { headers }),
                axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/v1/properties`, { headers })
            ]);

            setInvoices(invoicesRes.data);
            setProperties(propertiesRes.data);

        } catch (error) {
            console.error("Veriler çekilirken hata oluştu:", error);
            alert("Sistem verileri yüklenemedi. API servislerini kontrol edin.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getStatusChip = (status) => {
        switch (status) {
            case 'PAID': return <Chip label="PAID" size="small" sx={{ bgcolor: theme.greenBg, color: theme.greenText, fontWeight: 600, borderRadius: '6px' }} />;
            case 'UNPAID': return <Chip label="UNPAID" size="small" sx={{ bgcolor: theme.orangeBg, color: theme.orangeText, fontWeight: 600, borderRadius: '6px' }} />;
            case 'OVERDUE': return <Chip label="OVERDUE" size="small" sx={{ bgcolor: theme.redBg, color: theme.redText, fontWeight: 600, borderRadius: '6px' }} />;
            default: return <Chip label={status} size="small" />;
        }
    };

    // --- BUTON AKSİYONLARI ---
    const handleOpenAdd = () => {
        setFormMode('add');
        setFormData({ notes: '', propertyId: '', amount: '', dueDate: '', type: 'RENT', status: 'UNPAID' });
        setOpenForm(true);
    };

    const handleOpenEdit = async (invoice) => {
        setFormMode('edit');
        setSelectedInvoice(invoice);
        setFormData({
            notes: invoice.notes || '',
            propertyId: invoice.propertyId,
            amount: invoice.amount,
            dueDate: invoice.dueDate,
            type: invoice.type,
            status: invoice.status
        });
        setOpenForm(true);
    };

    const handleOpenDelete = (invoice) => {
        setSelectedInvoice(invoice);
        setOpenDelete(true);
    };

    const handleOpenHistory = (invoice) => {
        setSelectedInvoice(invoice);
        setOpenHistory(true);
    };

    // --- SAVE OR UPDATE INVOICE (POST & PUT) ---
    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const payload = {
                notes: formData.notes,
                propertyId: formData.propertyId,
                amount: Number(formData.amount),
                dueDate: formData.dueDate,
                type: formData.type,
                status: formData.status
            };

            if (formMode === 'add') {
                await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/v1/invoices`, payload, { headers });
            } else {
                await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/v1/invoices/${selectedInvoice.id}`, payload, { headers });
            }

            setOpenForm(false);
            fetchData();

        } catch (error) {
            console.error("Real Error:", error.response);

            if (error.response && error.response.status === 403) {
                alert("Error: You do not have permission to create invoices (403 Forbidden)!");
            } else if (error.response && error.response.data) {
                const backendMessage = typeof error.response.data === 'string'
                    ? error.response.data
                    : error.response.data.message || "An unknown database error occurred.";

                alert(`Backend Error:\n\n${backendMessage}`);
            } else {
                alert("Invoice could not be saved. Please check the fields or your connection.");
            }
        }
    };

    // --- FATURAYI SİL (DELETE) ---
    const handleDelete = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/v1/invoices/${selectedInvoice.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOpenDelete(false);
            fetchData();
        } catch (error) {
            console.error("Fatura silinemedi:", error);
        }
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)', bgcolor: theme.bgMain }}><CircularProgress /></Box>;
    }

    const propertyHistory = selectedInvoice
        ? invoices.filter(inv => inv.propertyId === selectedInvoice.propertyId)
        : [];

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: theme.bgMain, minHeight: 'calc(100vh - 64px)', width: '100%', boxSizing: 'border-box' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography sx={{ fontWeight: 900, color: theme.primary, fontSize: '28px', fontFamily: "'Merriweather', serif" }}>
                    Invoices
                </Typography>
                <Button
                    variant="contained" startIcon={<Payment />} onClick={handleOpenAdd}
                    sx={{ bgcolor: theme.primary, textTransform: 'none', fontWeight: 600, borderRadius: '8px', boxShadow: 'none' }}
                >
                    ADD INVOICE
                </Button>
            </Box>

            <Card sx={{ borderRadius: '12px', boxShadow: 'none', border: `1px solid ${theme.borderLight}` }}>
                <TableContainer>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead sx={{ bgcolor: '#f9fafb' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600, color: theme.textDark }}>Description</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: theme.textDark }}>Property / Unit</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: theme.textDark }}>Tenant</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: theme.textDark }}>Amount</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: theme.textDark }}>Due Date</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: theme.textDark }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: theme.textDark }} align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {invoices.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 3, color: theme.textGrey }}>No invoices found in database.</TableCell>
                                </TableRow>
                            ) : invoices.map((invoice) => (
                                <TableRow key={invoice.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell sx={{ color: theme.textDark, fontWeight: 500 }}>{invoice.description}</TableCell>
                                    <TableCell sx={{ color: theme.textGrey }}>{invoice.propertyName}</TableCell>
                                    <TableCell sx={{ color: theme.textGrey }}>{invoice.tenantName}</TableCell>
                                    <TableCell sx={{ color: theme.textDark, fontWeight: 600 }}>${invoice.amount.toLocaleString()}</TableCell>
                                    <TableCell sx={{ color: theme.textGrey }}>{invoice.dueDate}</TableCell>
                                    <TableCell>{getStatusChip(invoice.status)}</TableCell>
                                    <TableCell align="right">
                                        <IconButton onClick={() => handleOpenHistory(invoice)} title="Property Transactions" size="small" sx={{ color: '#4b5563', mr: 0.5 }}><ReceiptLong fontSize="small" /></IconButton>
                                        <IconButton onClick={() => handleOpenEdit(invoice)} title="Edit Invoice" size="small" sx={{ color: theme.primary, mr: 0.5 }}><Edit fontSize="small" /></IconButton>
                                        <IconButton onClick={() => handleOpenDelete(invoice)} title="Delete Invoice" size="small" sx={{ color: theme.redText }}><Delete fontSize="small" /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>

            <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 800, fontFamily: "'Merriweather', serif", color: theme.textDark }}>
                    {formMode === 'add' ? 'Create New Invoice' : 'Edit Invoice'}
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Type</InputLabel>
                                <Select value={formData.type} label="Type" onChange={(e) => setFormData({...formData, type: e.target.value})}>
                                    <MenuItem value="RENT">RENT</MenuItem>
                                    <MenuItem value="HOA_DUES">HOA DUES</MenuItem>
                                    <MenuItem value="WATER">WATER</MenuItem>
                                    <MenuItem value="ELECTRICITY">ELECTRICITY</MenuItem>
                                    <MenuItem value="MAINTENANCE_FEE">MAINTENANCE FEE</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select value={formData.status} label="Status" onChange={(e) => setFormData({...formData, status: e.target.value})}>
                                    <MenuItem value="UNPAID">UNPAID</MenuItem>
                                    <MenuItem value="PAID">PAID</MenuItem>
                                    <MenuItem value="OVERDUE">OVERDUE</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField fullWidth label="Notes (Optional)" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} helperText="e.g. August Rent" />
                        </Grid>

                        {/* UPDATED PROPERTY DROPDOWN */}
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel id="property-select-label">Property / Unit</InputLabel>
                                <Select
                                    labelId="property-select-label"
                                    value={formData.propertyId}
                                    label="Property / Unit"
                                    onChange={(e) => setFormData({...formData, propertyId: e.target.value})}
                                >
                                    {properties.map((prop) => (
                                        <MenuItem key={prop.id} value={prop.id}>
                                            Unit {prop.unitNumber} {prop.communityName ? `- ${prop.communityName}` : ''}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth type="number" label="Amount ($)" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth type="date" label="Due Date" InputLabelProps={{ shrink: true }} value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} />
                        </Grid>

                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2, bgcolor: '#f9fafb' }}>
                    <Button onClick={() => setOpenForm(false)} sx={{ color: theme.textGrey, fontWeight: 600 }}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained" sx={{ bgcolor: theme.primary, fontWeight: 600, boxShadow: 'none' }}>
                        {formMode === 'add' ? 'Create' : 'Save Changes'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modals for Delete and History remain unchanged below */}
            <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
                <DialogTitle sx={{ fontWeight: 800, color: theme.redText }}>Delete Invoice?</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this invoice? This action cannot be undone.</Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenDelete(false)} sx={{ color: theme.textGrey, fontWeight: 600 }}>Cancel</Button>
                    <Button onClick={handleDelete} variant="contained" color="error" sx={{ fontWeight: 600, boxShadow: 'none' }}>Delete</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openHistory} onClose={() => setOpenHistory(false)} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontWeight: 800, fontFamily: "'Merriweather', serif", color: theme.textDark }}>
                    Transaction History
                </DialogTitle>
                <DialogContent dividers sx={{ p: 0 }}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f9fafb' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {propertyHistory.map(inv => (
                                <TableRow key={inv.id}>
                                    <TableCell>{inv.dueDate}</TableCell>
                                    <TableCell>{inv.description}</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>${inv.amount.toLocaleString()}</TableCell>
                                    <TableCell>{getStatusChip(inv.status)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </DialogContent>
                <DialogActions sx={{ p: 2, bgcolor: '#f9fafb' }}>
                    <Button onClick={() => setOpenHistory(false)} variant="contained" sx={{ bgcolor: theme.textDark, fontWeight: 600, boxShadow: 'none' }}>Close</Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
};

export default Invoices;