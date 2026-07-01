import React, { useEffect, useState } from 'react';
import {
    Container, Typography, Box, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress, Button,
    Dialog, DialogTitle, DialogContent, TextField, DialogActions, IconButton
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { getAllCommunities, createCommunity, deleteCommunity, updateCommunity } from '../api/communityService';

const CommunitiesPage = () => {
    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [newCommunity, setNewCommunity] = useState({
        name: '', address: '', city: '', state: '', zipCode: ''
    });

    const fetchData = async () => {
        try {
            const data = await getAllCommunities();
            setCommunities(data.content || data || []);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSave = async () => {
        try {
            if (isEditMode) {
                await updateCommunity(newCommunity.id, newCommunity);
            } else {
                await createCommunity(newCommunity);
            }
            setOpen(false);
            fetchData();
        } catch (error) {
            console.error("Save failed:", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bu siteyi silmek istediğinize emin misiniz?")) {
            try {
                await deleteCommunity(id);
                fetchData();
            } catch (error) {
                alert(error.response?.data?.message || "Bu site silinemez! İçerisinde aktif mülkler bulunuyor olabilir.");
            }
        }
    };

    const handleEdit = (community) => {
        setNewCommunity(community);
        setIsEditMode(true);
        setOpen(true);
    };

    const openCreateModal = () => {
        setNewCommunity({ name: '', address: '', city: '', state: '', zipCode: '' });
        setIsEditMode(false);
        setOpen(true);
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 20 }}><CircularProgress /></Box>;

    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>Communities</Typography>
                <Button variant="contained" onClick={openCreateModal}>+ Add Community</Button>
            </Box>

            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f4f6f8' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>City</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>State</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {communities.map((c) => (
                            <TableRow key={c.id}>
                                <TableCell>{c.name}</TableCell>
                                <TableCell>{c.city}</TableCell>
                                <TableCell>{c.state}</TableCell>
                                <TableCell align="center">
                                    <IconButton color="primary" onClick={() => handleEdit(c)}>
                                        <Edit fontSize="small" />
                                    </IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(c.id)}>
                                        <Delete fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>{isEditMode ? "Edit Community" : "Add New Community"}</DialogTitle>
                <DialogContent>
                    <TextField fullWidth margin="normal" label="Community Name" value={newCommunity.name} onChange={(e) => setNewCommunity({...newCommunity, name: e.target.value})} />
                    <TextField fullWidth margin="normal" label="Address" value={newCommunity.address} onChange={(e) => setNewCommunity({...newCommunity, address: e.target.value})} />
                    <TextField fullWidth margin="normal" label="City" value={newCommunity.city} onChange={(e) => setNewCommunity({...newCommunity, city: e.target.value})} />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField fullWidth margin="normal" label="State" value={newCommunity.state} onChange={(e) => setNewCommunity({...newCommunity, state: e.target.value})} />
                        <TextField fullWidth margin="normal" label="Zip Code" value={newCommunity.zipCode} onChange={(e) => setNewCommunity({...newCommunity, zipCode: e.target.value})} />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}>{isEditMode ? "Update" : "Save"}</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default CommunitiesPage;