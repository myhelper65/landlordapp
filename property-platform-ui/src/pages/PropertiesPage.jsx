import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Container, Typography, Box, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress, Button,
    Dialog, DialogTitle, DialogContent, TextField, DialogActions, IconButton,
    FormControl, InputLabel, Select, MenuItem, Chip, Grid, Card, CardMedia,
    CardContent, CardActions, Divider
} from '@mui/material';
import { Edit, Delete, PersonAdd, Visibility, CloudUpload, InsertDriveFile, PictureAsPdf } from '@mui/icons-material';

// Mevcut API Servislerin
import { getAllProperties, createProperty, deleteProperty, updateProperty } from '../api/propertyService';
import { getAllUsers, inviteTenant } from '../api/userService';
import { assignUserToProperty } from '../api/userPropertyService';
import { getAllCommunities } from '../api/communityService';

const PropertiesPage = () => {
    const [properties, setProperties] = useState([]);
    const [users, setUsers] = useState([]);
    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form State'leri
    const [rentModalOpen, setRentModalOpen] = useState(false);
    const [rentData, setRentData] = useState({ userId: '', propertyId: '', type: 'TENANT' });

    const [inviteModalOpen, setInviteModalOpen] = useState(false);
    const [inviteData, setInviteData] = useState({ firstName: '', lastName: '', email: '' });

    const [addModalOpen, setAddModalOpen] = useState(false);
    const [newProperty, setNewProperty] = useState({ communityId: '', unitNumber: '', propertyType: 'SINGLE_FAMILY' });

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editProperty, setEditProperty] = useState({ id: '', communityId: '', unitNumber: '', propertyType: '' });

    // --- YENİ: MÜLK DETAY VE DÖKÜMAN STATE'LERİ ---
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [propertyDetails, setPropertyDetails] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploadingFiles, setUploadingFiles] = useState(false);

    // BASE URL for viewing files
    const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080');

    const fetchData = async () => {
        try {
            const propData = await getAllProperties();
            setProperties(propData?.content || propData || []);

            const userData = await getAllUsers();
            setUsers(userData?.content || userData || []);

            const commData = await getAllCommunities();
            setCommunities(commData?.content || commData || []);
        } catch (error) {
            console.error("Veri çekme hatası:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // --- MEVCUT İŞLEMLER (ADD, EDIT, RENT, DELETE) ---
    const handleAddSubmit = async () => {
        try {
            await createProperty(newProperty);
            setAddModalOpen(false);
            setNewProperty({ communityId: '', unitNumber: '', propertyType: 'SINGLE_FAMILY' });
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || "Mülk eklenirken hata oluştu.");
        }
    };

    const openEditModal = (p) => {
        setEditProperty({
            id: p.id,
            communityId: p.communityId || '',
            unitNumber: p.unitNumber,
            propertyType: p.propertyType || p.type || 'SINGLE_FAMILY'
        });
        setEditModalOpen(true);
    };

    const handleEditSubmit = async () => {
        try {
            await updateProperty(editProperty.id, editProperty);
            setEditModalOpen(false);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || "Güncelleme sırasında hata oluştu.");
        }
    };

    const openRentModal = (propertyId) => {
        setRentData({ userId: '', propertyId: propertyId, type: 'TENANT' });
        setRentModalOpen(true);
    };

    const handleRentSubmit = async () => {
        try {
            await assignUserToProperty(rentData);
            alert("Action successfully!");
            setRentModalOpen(false);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || "Failed action.");
        }
    };

    const handleInviteSubmit = async () => {
        try {
            const response = await inviteTenant(inviteData);
            alert(response.message || "Tenant invited successfully!");
            setInviteModalOpen(false);
            setInviteData({ firstName: '', lastName: '', email: '' });
            fetchData(); // Refresh the users list
        } catch (error) {
            alert(error.response?.data?.message || "Failed to invite tenant.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure to delete this?")) {
            try {
                await deleteProperty(id);
                fetchData();
            } catch (error) {
                alert(error.response?.data?.message || "Silme işlemi sırasında hata oluştu.");
            }
        }
    };

    // --- YENİ: MÜLK DETAYLARI VE DOSYA YÜKLEME ---
    const openDetailsModal = async (id) => {
        try {
            const token = localStorage.getItem('token');
            // Yeni yazdığımız detay endpointine istek atıyoruz
            const response = await axios.get(`${API_BASE_URL}/api/v1/properties/${id}/details`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPropertyDetails(response.data);
            setSelectedFiles([]);
            setDetailsModalOpen(true);
        } catch (error) {
            console.error("Detaylar alınamadı:", error);
            alert("Mülk detayları yüklenirken bir hata oluştu.");
        }
    };

    const handleFileSelection = (e) => {
            const files = Array.from(e.target.files);
            const currentDocCount = propertyDetails?.documents?.length || 0;

            // 1. KURAL: Maksimum 4 dosya
            if (currentDocCount + files.length > 4) {
                alert("Bir mülke en fazla 4 belge ekleyebilirsiniz!");
                return;
            }

            // 2. KURAL: Dosya boyutu sınırı (Örn: Maksimum 10 MB)
            const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB in bytes
            for (let file of files) {
                if (file.size > MAX_FILE_SIZE) {
                    alert(`Hata: "${file.name}" boyutu çok büyük! Lütfen 10MB'dan küçük bir dosya seçin.`);
                    return; // Yüklemeyi tamamen durdur
                }
            }

            setSelectedFiles(files);
        };

    const handleFileUpload = async () => {
        if (selectedFiles.length === 0) return;
        setUploadingFiles(true);

        try {
            const token = localStorage.getItem('token');
            for (let file of selectedFiles) {
                const formData = new FormData();
                formData.append("file", file);

                await axios.post(`${API_BASE_URL}/api/v1/properties/${propertyDetails.id}/documents`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`
                    }
                });
            }
            alert("Documents are uploaded!");
            setSelectedFiles([]);
            // Yükleme sonrası güncel dosyaları görmek için detayları tekrar çekiyoruz
            openDetailsModal(propertyDetails.id);
        } catch (error) {
            console.error("Upload error :", error);
            alert(error.response?.data?.message || "upload error while uploadingFiles.");
        } finally {
            setUploadingFiles(false);
        }
    };

    // Dosya türüne göre uygun ikonu/önizlemeyi render etme
    const renderFilePreview = (doc) => {
        const fileUrl = `${API_BASE_URL}${doc.fileUrl}`;
        const isImage = doc.fileType.startsWith('image/');
        const isPdf = doc.fileType === 'application/pdf';

        if (isImage) {
            return <CardMedia component="img" height="120" image={fileUrl} alt={doc.fileName} sx={{ objectFit: 'cover' }} />;
        }

        return (
            <Box sx={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f4f6f8' }}>
                {isPdf ? <PictureAsPdf sx={{ fontSize: 60, color: '#d32f2f' }} /> : <InsertDriveFile sx={{ fontSize: 60, color: '#1976d2' }} />}
            </Box>
        );
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 20 }}><CircularProgress /></Box>;

    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>Properties</Typography>
                <Button variant="contained" onClick={() => setAddModalOpen(true)}>
                    + ADD PROPERTY
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f4f6f8' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Community Name</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Unit Number</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {properties.map((p) => (
                            <TableRow key={p.id}>
                                <TableCell>{p.communityName || 'N/A'}</TableCell>
                                <TableCell>{p.unitNumber}</TableCell>
                                <TableCell>{p.propertyType || p.type}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={p.status}
                                        color={p.status === 'VACANT' ? 'success' : p.status === 'OCCUPIED' ? 'error' : 'default'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="center">
                                    {/* YENİ: DETAY GÖRÜNTÜLEME BUTONU */}
                                    <IconButton color="info" onClick={() => openDetailsModal(p.id)} title="View Details & Documents">
                                        <Visibility fontSize="small" />
                                    </IconButton>

                                    <IconButton color="success" onClick={() => openRentModal(p.id)} title="Rent to Tenant">
                                        <PersonAdd fontSize="small" />
                                    </IconButton>
                                    <IconButton color="primary" title="Edit" onClick={() => openEditModal(p)}>
                                        <Edit fontSize="small" />
                                    </IconButton>
                                    <IconButton color="error" title="Delete" onClick={() => handleDelete(p.id)}>
                                        <Delete fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {properties.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                   Kayıtlı mülk bulunamadı. Portföyünüzü yönetmeye başlamak için mülk ekleyin.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* --- DETAILS & DOCUMENTS MODAL (YENİ EKLENDİ) --- */}
            <Dialog open={detailsModalOpen} onClose={() => setDetailsModalOpen(false)} fullWidth maxWidth="md">
                {propertyDetails && (
                    <>
                        <DialogTitle sx={{ fontWeight: 'bold', bgcolor: '#f4f6f8' }}>
                            Property Details - {propertyDetails.communityName} / Unit {propertyDetails.unitNumber}
                        </DialogTitle>
                        <DialogContent dividers>
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" color="primary" sx={{ mb: 1 }}>Tenant Information</Typography>
                                <Typography variant="body1">
                                    <strong>Active Tenant:</strong> {propertyDetails.tenantName || 'No Active Tenant'}
                                </Typography>
                            </Box>
                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6" color="primary">Lease Agreements & Documents</Typography>
                                <Typography variant="caption" color="textSecondary">
                                    ({propertyDetails.documents?.length || 0}/4 Uploaded)
                                </Typography>
                            </Box>

                            {/* PREVIEW BÖLÜMÜ */}
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                {propertyDetails.documents?.map((doc) => (
                                    <Grid item xs={12} sm={6} md={3} key={doc.id}>
                                        <Card variant="outlined">
                                            {renderFilePreview(doc)}
                                            <CardContent sx={{ p: 1, pb: "8px !important" }}>
                                                <Typography variant="caption" noWrap display="block" title={doc.fileName}>
                                                    {doc.fileName}
                                                </Typography>
                                            </CardContent>
                                            <CardActions sx={{ p: 0, justifyContent: 'center' }}>
                                                <Button size="small" target="_blank" href={`${API_BASE_URL}${doc.fileUrl}`}>View</Button>
                                            </CardActions>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>

                            {/* UPLOAD BÖLÜMÜ */}
                            {(!propertyDetails.documents || propertyDetails.documents.length < 4) && (
                                <Box sx={{ mt: 2, p: 2, border: '1px dashed #ccc', borderRadius: 2, textAlign: 'center', bgcolor: '#fafafa' }}>
                                    <input
                                        accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                                        style={{ display: 'none' }}
                                        id="raised-button-file"
                                        multiple
                                        type="file"
                                        onChange={handleFileSelection}
                                    />
                                    <label htmlFor="raised-button-file">
                                        <Button variant="outlined" component="span" startIcon={<CloudUpload />}>
                                            Select Documents
                                        </Button>
                                    </label>
                                    {selectedFiles.length > 0 && (
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="body2">{selectedFiles.length} file(s) selected.</Typography>
                                            <Button
                                                variant="contained" color="primary"
                                                onClick={handleFileUpload} disabled={uploadingFiles} sx={{ mt: 1 }}
                                            >
                                                {uploadingFiles ? 'Uploading...' : 'Upload Selected Files'}
                                            </Button>
                                        </Box>
                                    )}
                                </Box>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setDetailsModalOpen(false)}>Close</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* --- ADD, EDIT, RENT MODALLARI (Değişmedi, Mevcut Kodunla Aynı) --- */}
            {/* ADD MODAL */}
            <Dialog open={addModalOpen} onClose={() => setAddModalOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Add New Property</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Community (Site)</InputLabel>
                        <Select value={newProperty.communityId} label="Community (Site)" onChange={(e) => setNewProperty({ ...newProperty, communityId: e.target.value })}>
                            {communities.map((c) => (<MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>))}
                        </Select>
                    </FormControl>
                    <TextField fullWidth margin="normal" label="Unit Number (Daire No)" value={newProperty.unitNumber} onChange={(e) => setNewProperty({ ...newProperty, unitNumber: e.target.value })}/>
                   <FormControl fullWidth margin="normal">
                       <InputLabel>Property Type</InputLabel>
                       <Select value={newProperty.propertyType} label="Property Type" onChange={(e) => setNewProperty({ ...newProperty, propertyType: e.target.value })}>
                           <MenuItem value="SINGLE_FAMILY">Single Family</MenuItem>
                           <MenuItem value="APARTMENT">Apartment</MenuItem>
                           <MenuItem value="TOWNHOUSE">Townhouse</MenuItem>
                       </Select>
                   </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddModalOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleAddSubmit}>Save Property</Button>
                </DialogActions>
            </Dialog>

            {/* EDIT MODAL */}
            <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Edit Property</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Community (Site)</InputLabel>
                        <Select value={editProperty.communityId} label="Community (Site)" onChange={(e) => setEditProperty({ ...editProperty, communityId: e.target.value })}>
                            {communities.map((c) => (<MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>))}
                        </Select>
                    </FormControl>
                    <TextField fullWidth margin="normal" label="Unit Number (Daire No)" value={editProperty.unitNumber} onChange={(e) => setEditProperty({ ...editProperty, unitNumber: e.target.value })}/>
                   <FormControl fullWidth margin="normal">
                       <InputLabel>Property Type</InputLabel>
                       <Select value={editProperty.propertyType} label="Property Type" onChange={(e) => setEditProperty({ ...editProperty, propertyType: e.target.value })}>
                           <MenuItem value="SINGLE_FAMILY">Single Family</MenuItem>
                           <MenuItem value="APARTMENT">Apartment</MenuItem>
                           <MenuItem value="TOWNHOUSE">Townhouse</MenuItem>
                       </Select>
                   </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleEditSubmit}>Update Property</Button>
                </DialogActions>
            </Dialog>

            {/* RENT MODAL */}
            <Dialog open={rentModalOpen} onClose={() => setRentModalOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Rent Property to Tenant</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Select Tenant</InputLabel>
                        <Select value={rentData.userId} label="Select Tenant" onChange={(e) => setRentData({ ...rentData, userId: e.target.value })}>
                            {users.map((user) => (
                                <MenuItem key={user.id} value={user.id}>
                                    {user.firstName} {user.lastName} ({user.email})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>Can't find the tenant in the list?</Typography>
                        <Button variant="outlined" size="small" onClick={() => { setRentModalOpen(false); setInviteModalOpen(true); }}>
                            Invite New Tenant
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRentModalOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="success" onClick={handleRentSubmit}>Confirm Rent</Button>
                </DialogActions>
            </Dialog>

            {/* INVITE TENANT MODAL */}
            <Dialog open={inviteModalOpen} onClose={() => setInviteModalOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Invite New Tenant</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        Create a pending account for the tenant. They will use this email to log in via Google.
                    </Typography>
                    <TextField fullWidth margin="normal" label="First Name" value={inviteData.firstName} onChange={(e) => setInviteData({ ...inviteData, firstName: e.target.value })} required />
                    <TextField fullWidth margin="normal" label="Last Name" value={inviteData.lastName} onChange={(e) => setInviteData({ ...inviteData, lastName: e.target.value })} required />
                    <TextField fullWidth margin="normal" label="Email Address" type="email" value={inviteData.email} onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })} required />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setInviteModalOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="primary" onClick={handleInviteSubmit} disabled={!inviteData.email || !inviteData.firstName}>Send Invitation</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default PropertiesPage;