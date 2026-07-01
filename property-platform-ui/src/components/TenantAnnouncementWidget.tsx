import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Chip, Box, Badge, IconButton, Divider } from '@mui/material';
import { Campaign, FiberManualRecord, ChevronRight } from '@mui/icons-material';
import { announcementAPI } from "../pages/announcementService";
import dayjs from 'dayjs';

export const TenantAnnouncementWidget = () => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWidgetData();
  }, []);

  const fetchWidgetData = async () => {
    try {
      const { data } = await announcementAPI.getTenantAnnouncements({ page: 0, size: 5 });
      setAnnouncements(data.content);
    } catch (error) {
      console.error("Failed to load announcements", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRead = async (announcement: any) => {
    if (!announcement.read) {
      // Optimistic UI update
      setAnnouncements(prev => prev.map(a => a.id === announcement.id ? { ...a, read: true } : a));
      await announcementAPI.markAsRead(announcement.id);
    }
    // TODO: Open modal/dialog to read full 'content' text
  };

  if (loading) return <Typography>Loading board...</Typography>;

  return (
    <Card elevation={2} sx={{ borderRadius: 3, height: '100%', border: '1px solid #e0e0e0' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid #eee', bgcolor: '#fafafa', display: 'flex', alignItems: 'center', gap: 1 }}>
        <Campaign color="primary" />
        <Typography variant="h6" fontWeight="bold">Community Board</Typography>
      </Box>

      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        {announcements.length === 0 ? (
          <Box p={3} textAlign="center">
            <Typography color="text.secondary">No new announcements</Typography>
          </Box>
        ) : (
          announcements.map((ann, index) => (
            <Box
              key={ann.id}
              onClick={() => handleRead(ann)}
              sx={{
                p: 2,
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: ann.read ? 'transparent' : '#f4f8ff',
                borderLeft: `4px solid ${ann.priority === 'CRITICAL' ? '#d32f2f' : ann.priority === 'HIGH' ? '#ed6c02' : 'transparent'}`,
                '&:hover': { bgcolor: '#f5f5f5' }
              }}
            >
              <Box>
                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                  {!ann.read && <FiberManualRecord sx={{ fontSize: 12, color: '#1976d2' }} />}
                  <Typography variant="subtitle2" fontWeight={ann.read ? 500 : 700} color={ann.read ? 'text.primary' : '#1976d2'}>
                    {ann.title}
                  </Typography>
                </Box>
                <Box display="flex" gap={1.5} alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    {dayjs(ann.publishDate).format('MMM DD, YYYY')}
                  </Typography>
                  <Chip size="small" label={ann.category} sx={{ height: 20, fontSize: '0.7rem' }} />
                </Box>
              </Box>
              <IconButton size="small" sx={{ color: 'text.secondary' }}>
                <ChevronRight />
              </IconButton>
            </Box>
          ))
        )}
      </CardContent>
    </Card>
  );
};