import React, { useState, useEffect } from 'react';
import {
  Box, Button, Typography, Chip, IconButton, TextField, MenuItem, Paper
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Edit, Delete, Public, Archive, Add } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import dayjs from 'dayjs';

import api from '../api/axiosInstance';
import { announcementAPI } from './announcementService';
import { CreateAnnouncementModal } from './CreateAnnouncementModal';

export const AdminAnnouncements = () => {
  const { enqueueSnackbar } = useSnackbar();

  const [communities, setCommunities] = useState<any[]>([]);
  const [selectedCommunityId, setSelectedCommunityId] = useState('');

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [totalRows, setTotalRows] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const response = await api.get('/communities');
        const fetchedCommunities = response.data.content || response.data;
        setCommunities(fetchedCommunities);

        if (fetchedCommunities.length > 0) {
          setSelectedCommunityId(fetchedCommunities[0].id);
        }
      } catch (error) {
        enqueueSnackbar('Failed to load communities', { variant: 'error' });
      }
    };
    fetchCommunities();
  }, [enqueueSnackbar]);

  useEffect(() => {
    if (!selectedCommunityId) return;

    const fetchAnnouncements = async () => {
      setLoading(true);
      try {
        const response = await announcementAPI.getAdminAnnouncements(selectedCommunityId, {
          page: paginationModel.page,
          size: paginationModel.pageSize,
          search: search || undefined,
          status: statusFilter || undefined,
        });
        setData(response.data.content);
        setTotalRows(response.data.totalElements);
      } catch (error) {
        enqueueSnackbar('Failed to load announcements', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [selectedCommunityId, paginationModel, search, statusFilter, enqueueSnackbar]);

  const refreshTable = () => {
    setPaginationModel({ ...paginationModel });
  };

  const handleAction = async (action: 'publish' | 'archive' | 'delete', id: string) => {
    if (action === 'delete' && !window.confirm('Are you sure you want to delete this?')) return;
    try {
      if (action === 'publish') await announcementAPI.publish(id);
      if (action === 'archive') await announcementAPI.archive(id);
      if (action === 'delete') await announcementAPI.delete(id);
      enqueueSnackbar(`Successfully ${action}ed announcement`, { variant: 'success' });
      refreshTable();
    } catch (error) {
      enqueueSnackbar(`Failed to ${action} announcement`, { variant: 'error' });
    }
  };

  const columns: GridColDef[] = [
    { field: 'title', headerName: 'Title', flex: 1 },
    {
      field: 'category',
      headerName: 'Category',
      width: 130,
      renderCell: (params) => <Chip size="small" label={params.value} variant="outlined" />
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => {
        const colors: any = { PUBLISHED: 'success', DRAFT: 'default', SCHEDULED: 'info', ARCHIVED: 'error' };
        return <Chip size="small" label={params.value} color={colors[params.value]} />;
      }
    },
    {
      field: 'publishDate',
      headerName: 'Publish Date',
      width: 150,
      valueGetter: (params) => params.row?.publishDate ? dayjs(params.row.publishDate).format('MMM DD, YYYY') : '-'
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      sortable: false,
      renderCell: (params) => (
        <Box>
          {params.row.status !== 'PUBLISHED' && (
            <IconButton onClick={() => handleAction('publish', params.row.id)} size="small" color="success"><Public /></IconButton>
          )}
          {params.row.status !== 'ARCHIVED' && (
            <IconButton onClick={() => handleAction('archive', params.row.id)} size="small" color="warning"><Archive /></IconButton>
          )}
          <IconButton onClick={() => handleAction('delete', params.row.id)} size="small" color="error"><Delete /></IconButton>
        </Box>
      )
    }
  ];

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>

      {/* BAŞLIK VE BUTON */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">Announcements</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setIsModalOpen(true)}
          disabled={communities.length === 0}
        >
          New Announcement
        </Button>
      </Box>

      {/* FİLTRELER */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          select
          size="small"
          label="Select Community"
          value={selectedCommunityId}
          onChange={(e) => setSelectedCommunityId(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          {communities.map((comm) => (
            <MenuItem key={comm.id} value={comm.id}>{comm.name}</MenuItem>
          ))}
        </TextField>

        <TextField
          size="small"
          label="Search title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <TextField
          size="small"
          select
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ width: 150 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="DRAFT">Draft</MenuItem>
          <MenuItem value="PUBLISHED">Published</MenuItem>
          <MenuItem value="ARCHIVED">Archived</MenuItem>
        </TextField>
      </Box>

      {/* TABLO */}
      <DataGrid
        rows={data}
        columns={columns}
        rowCount={totalRows}
        loading={loading}
        pageSizeOptions={[10, 25, 50]}
        paginationModel={paginationModel}
        paginationMode="server"
        onPaginationModelChange={setPaginationModel}
        disableRowSelectionOnClick
        autoHeight
      />

      {/* MODAL */}
      <CreateAnnouncementModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={refreshTable}
        communities={communities}
        defaultCommunityId={selectedCommunityId}
      />

    </Paper>
  );
};