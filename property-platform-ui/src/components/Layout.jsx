import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Box, Drawer, AppBar, Toolbar, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Button, Divider } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessIcon from '@mui/icons-material/Business';
import ApartmentIcon from '@mui/icons-material/Apartment';
import BuildIcon from '@mui/icons-material/Build';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DescriptionIcon from '@mui/icons-material/Description';
import LogoutIcon from '@mui/icons-material/Logout';
import PaymentIcon from '@mui/icons-material/Payment';
import CampaignIcon from '@mui/icons-material/Campaign';
import { logout } from '../api/authService';

const drawerWidth = 260;

const Layout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const email = localStorage.getItem('email');
    const role = localStorage.getItem('role'); // Kullanıcı rolü burada alınıyor

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // --- YÖNETİCİLER (ADMIN / SUPER_ADMIN) İÇİN MENÜ ---
    const adminMenuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'Properties', icon: <BusinessIcon />, path: '/properties' },
        { text: 'Communities', icon: <ApartmentIcon />, path: '/communities' },
        { text: 'Announcements', icon: <CampaignIcon />, path: '/announcements' },
        { text: 'Maintenance', icon: <BuildIcon />, path: '/maintenance' },
        { text: 'Invoices', icon: <ReceiptIcon />, path: '/invoices' },
        { text: 'Documents', icon: <DescriptionIcon />, path: '/documents' },
    ];

    // --- KİRACILAR (TENANT) İÇİN MENÜ ---
    const tenantMenuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'My Lease', icon: <DescriptionIcon />, path: '/my-lease' },
        { text: 'My Payments', icon: <PaymentIcon />, path: '/my-payments' },
        { text: 'My Requests', icon: <BuildIcon />, path: '/my-requests' },
    ];

    // Role göre hangi menünün gösterileceğini belirliyoruz
    const isTenant = role === 'TENANT';
    const menuItems = isTenant ? tenantMenuItems : adminMenuItems;

    return (
        <Box sx={{ display: 'flex' }}>
            {/* ÜST MENÜ (Navbar) */}
            <AppBar position="fixed" elevation={0} sx={{
                width: `calc(100% - ${drawerWidth}px)`,
                ml: `${drawerWidth}px`,
                bgcolor: '#FFFFFF',
                color: 'text.primary',
                borderBottom: '1px solid #E2E8F0'
            }}>
                <Toolbar sx={{ px: 4 }}>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: '-0.02em', color: '#0F172A' }}>
                        Property Management Platform
                    </Typography>
                    <Typography variant="body2" sx={{ mr: 3, color: '#475569', fontWeight: 500 }}>
                        {email} <span style={{ opacity: 0.7 }}>({role})</span>
                    </Typography>
                    <Button color="error" variant="outlined" size="small" startIcon={<LogoutIcon />} onClick={handleLogout} sx={{ fontWeight: 600, borderRadius: '8px', px: 2 }}>
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>

            {/* SOL MENÜ (Sidebar) */}
            <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': { 
                        width: drawerWidth, 
                        boxSizing: 'border-box', 
                        bgcolor: '#0F172A', // Deep Blue
                        color: 'white',
                        borderRight: 'none'
                    },
                }}
                variant="permanent"
                anchor="left"
            >
                <Toolbar sx={{ px: 3, py: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', fontSize: '18px' }}>
                        {isTenant ? 'Tenant Portal' : 'Admin Portal'}
                    </Typography>
                </Toolbar>
                <Divider sx={{ bgcolor: 'rgba(255,255,255,0.08)', mb: 2 }} />
                <List sx={{ px: 2 }}>
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <ListItem disablePadding key={item.text} sx={{ mb: 1 }}>
                                <ListItemButton
                                    onClick={() => navigate(item.path)}
                                    sx={{
                                        bgcolor: isActive ? '#2563EB' : 'transparent', // Lively blue background for active
                                        '&:hover': { 
                                            bgcolor: isActive ? '#1D4ED8' : 'rgba(255,255,255,0.1)',
                                        },
                                        borderRadius: '8px',
                                        py: 1.2,
                                        px: 2,
                                        transition: 'all 0.2s ease-in-out'
                                    }}
                                >
                                    <ListItemIcon sx={{ color: isActive ? '#FFFFFF' : '#94A3B8', minWidth: '40px' }}>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        disableTypography
                                        primary={
                                            <Typography sx={{ 
                                                fontWeight: isActive ? 600 : 500, 
                                                fontSize: '15px', 
                                                letterSpacing: '0.02em', 
                                                color: isActive ? '#FFFFFF' : '#E2E8F0' 
                                            }}>
                                                {item.text}
                                            </Typography>
                                        }
                                    />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </Drawer>

            {/* ANA İÇERİK BÖLGESİ */}
            <Box component="main" sx={{
                flexGrow: 1,
                bgcolor: 'background.default',
                p: { xs: 2, sm: 3, md: 4 }, // Generous padding
                minHeight: '100vh',
                width: `calc(100% - ${drawerWidth}px)`
            }}>
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
};

export default Layout;