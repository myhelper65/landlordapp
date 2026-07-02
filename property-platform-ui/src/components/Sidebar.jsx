// src/components/Sidebar.jsx
import React from 'react';
import { Box, List, ListItem, ListItemButton, AppIcon, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { Dashboard, Apartment, HolidayVillage, Build, Receipt, Description, Campaign } from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();

    // Sol menüdeki tüm elemanlar ve yönlenecekleri rotalar
    const menuItems = [
        { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
        { text: 'Properties', icon: <Apartment />, path: '/properties' },
        { text: 'Communities', icon: <HolidayVillage />, path: '/communities' }, // Yeni eklenen kısım
        { text: 'Announcements', icon: <Campaign />, path: '/announcements' },
        { text: 'Maintenance', icon: <Build />, path: '/maintenance' },
        { text: 'Invoices', icon: <Receipt />, path: '/invoices' },
        { text: 'Documents', icon: <Description />, path: '/documents' },
    ];

    return (
        <Box
            sx={{
                width: 240,
                height: '100vh',
                bgcolor: '#1a1d29', // Ekran görüntündeki koyu arka plan rengi
                color: '#fff',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                left: 0,
                top: 0
            }}
        >
            {/* Panel Başlığı */}
            <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', letterSpacing: '0.5px' }}>
                    Admin Panel
                </Typography>
            </Box>

            {/* Menü Listesi */}
            <List sx={{ p: 2, flexGrow: 1 }}>
                {menuItems.map((item) => {
                    // Mevcut URL ile menü linki eşleşiyorsa aktiftir
                    const isActive = location.pathname === item.path;

                    return (
                        <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                component={Link}
                                to={item.path}
                                sx={{
                                    borderRadius: '8px',
                                    // Aktif menü öğesinin arka plan ve yazı rengi değişir
                                    bgcolor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                                    color: isActive ? '#90caf9' : 'rgba(255, 255, 255, 0.7)',
                                    '&:hover': {
                                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                                        color: '#fff',
                                        '& .MuiListItemIcon-root': { color: '#fff' }
                                    },
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        color: isActive ? '#90caf9' : 'rgba(255,255,255,0.6)',
                                        minWidth: 40
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{
                                        fontSize: '0.95rem',
                                        fontWeight: isActive ? 'medium' : 'regular'
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </Box>
    );
};

export default Sidebar;