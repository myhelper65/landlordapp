import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Chip, Pagination, CircularProgress } from '@mui/material';
import dayjs from 'dayjs';
import { announcementAPI } from './announcementService'; // Yolun doğru olduğundan emin ol

export const TenantAnnouncementsList = () => {
  // TypeScript kısımları kaldırıldı
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchAnnouncements(page - 1);
  }, [page]);

  const fetchAnnouncements = async (pageIndex) => {
    setLoading(true);
    try {
      const response = await announcementAPI.getTenantAnnouncements({ page: pageIndex, size: 5 });
      setAnnouncements(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Duyurular yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityProps = (priority) => {
    switch (priority) {
      case 'URGENT':
        return { label: 'Important', color: 'error', sx: { bgcolor: '#ffebee', color: '#c62828' } };
      case 'WARNING':
        return { label: 'Notice', color: 'warning', sx: { bgcolor: '#fff3e0', color: '#ef6c00' } };
      case 'INFO':
      default:
        return { label: 'Update', color: 'success', sx: { bgcolor: '#e8f5e9', color: '#2e7d32' } };
    }
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 2, mt: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
      <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" gap={1} mb={3}>
        📢 Recent Announcements
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}><CircularProgress size={30} /></Box>
      ) : announcements.length === 0 ? (
        <Typography color="text.secondary">No recent announcements.</Typography>
      ) : (
        <Box display="flex" flexDirection="column" gap={3}>
          {announcements.map((announcement) => {
            const priorityStyle = getPriorityProps(announcement.priority);

            return (
              <Box
                key={announcement.id}
                sx={{
                  pb: 2,
                  borderBottom: '1px solid #eee',
                  '&:last-child': { borderBottom: 'none', pb: 0 }
                }}
              >
                <Chip
                  label={priorityStyle.label}
                  size="small"
                  sx={{
                    ...priorityStyle.sx,
                    fontWeight: 'bold',
                    height: 24,
                    fontSize: '0.75rem',
                    mb: 1
                  }}
                />

                <Typography variant="subtitle1" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {announcement.title}
                  {!announcement.isRead && (
                    <Box component="span" sx={{ width: 8, height: 8, bgcolor: 'primary.main', borderRadius: '50%' }} />
                  )}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {announcement.content}
                </Typography>

                <Typography variant="caption" color="primary.main" fontWeight="medium" sx={{ display: 'block', mt: 1 }}>
                  {dayjs(announcement.publishDate || announcement.createdAt).format('MMM D')}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            size="small"
          />
        </Box>
      )}
    </Paper>
  );
};