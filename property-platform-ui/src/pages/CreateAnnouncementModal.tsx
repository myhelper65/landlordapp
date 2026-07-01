import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Box
} from '@mui/material';
import { announcementAPI } from './announcementService';
import { useSnackbar } from 'notistack';

export const CreateAnnouncementModal = ({ open, onClose, onSuccess, communities, defaultCommunityId }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    communityId: '',
    title: '',
    content: '',
    category: 'GENERAL',
    priority: 'NORMAL',
    status: 'PUBLISHED'
  });

//   // Modal açıldığında, arka planda seçili olan siteyi formda otomatik seçili yap
//   useEffect(() => {
//     if (open) {
//       setFormData(prev => ({ ...prev, communityId: defaultCommunityId || '' }));
//     }
//   }, [open, defaultCommunityId]);
//
//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

    // 1. useEffect: Sadece modal açıldığında değil,
    // defaultCommunityId değiştiğinde de form güncellensin
    useEffect(() => {
      if (open) {
        setFormData(prev => ({
          ...prev,
          communityId: defaultCommunityId || ''
        }));
      }
    }, [open, defaultCommunityId]);

    // 2. handleChange: Tip güvenliğini artır
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    // 3. ÖNEMLİ: Modal kapandığında formu sıfırlamak için
    // onClose fonksiyonunun içine şunu ekle (bunu Modal componentinde çağır):
    const handleClose = () => {
      setFormData({
        communityId: defaultCommunityId, // Veya boş string
        title: '',
        content: '',
        category: 'GENERAL',
        priority: 'NORMAL',
        status: 'PUBLISHED'
      });
      onClose();
    };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content || !formData.communityId) {
      enqueueSnackbar('Community, Title and Content are required', { variant: 'warning' });
      return;
    }

    setLoading(true);
    try {
      await announcementAPI.create(formData);

      enqueueSnackbar('Announcement created successfully!', { variant: 'success' });
      onSuccess();
      onClose();

      // Temizle
      setFormData({ communityId: defaultCommunityId, title: '', content: '', category: 'GENERAL', priority: 'NORMAL', status: 'PUBLISHED' });
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to create announcement', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle fontWeight="bold">Create New Announcement</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>

          {/* SİTE (COMMUNITY) SEÇİMİ BURAYA EKLENDİ */}
          <TextField
            select
            label="Select Community"
            name="communityId"
            value={formData.communityId}
            onChange={handleChange}
            fullWidth
            required
            color="primary"
          >
            {communities.map((comm) => (
              <MenuItem key={comm.id} value={comm.id}>
                {comm.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField label="Title" name="title" value={formData.title} onChange={handleChange} fullWidth required />
          <TextField label="Content / Message" name="content" value={formData.content} onChange={handleChange} multiline rows={4} fullWidth required />

          <Box display="flex" gap={2}>
            <TextField select label="Category" name="category" value={formData.category} onChange={handleChange} fullWidth>
              <MenuItem value="GENERAL">General</MenuItem>
              <MenuItem value="MAINTENANCE">Maintenance</MenuItem>
              <MenuItem value="EMERGENCY">Emergency</MenuItem>
              <MenuItem value="EVENT">Event</MenuItem>
              <MenuItem value="REMINDER">Reminder</MenuItem>
            </TextField>

            <TextField select label="Priority" name="priority" value={formData.priority} onChange={handleChange} fullWidth>
              <MenuItem value="LOW">Low</MenuItem>
              <MenuItem value="NORMAL">Normal</MenuItem>
              <MenuItem value="HIGH">High</MenuItem>
              <MenuItem value="CRITICAL">Critical</MenuItem>
            </TextField>
          </Box>

          <TextField select label="Initial Status" name="status" value={formData.status} onChange={handleChange} fullWidth>
            <MenuItem value="DRAFT">Draft (Save for later)</MenuItem>
            <MenuItem value="PUBLISHED">Publish Immediately</MenuItem>
          </TextField>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Creating...' : 'Create Announcement'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};