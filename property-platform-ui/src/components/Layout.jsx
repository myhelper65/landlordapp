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
// --- YÖNETİCİLER (ADMIN / SUPER_ADMIN) İÇİN MENÜ ---
    const adminMenuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'Properties', icon: <BusinessIcon />, path: '/properties' },
        { text: 'Communities', icon: <ApartmentIcon />, path: '/communities' },
        { text: 'Announcements', icon: <CampaignIcon />, path: '/announcements' }, // <--- BU SATIRI EKLE
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
            <AppBar position="fixed" elevation={0} className="glass-nav" sx={{
                width: `calc(100% - ${drawerWidth}px)`,
                ml: `${drawerWidth}px`,
                color: 'text.primary',
                bgcolor: '#FFFFFF',
                borderBottom: '1px solid #E7E5E4'
            }}>
                <Toolbar>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 'bold', fontFamily: "'Inter', sans-serif" }}>
                        Property Management Platform
                    </Typography>
                    <Typography variant="body2" sx={{ mr: 2, color: 'text.secondary', fontWeight: 500 }}>
                        {email} <span style={{opacity: 0.6}}>({role})</span>
                    </Typography>
                    <Button color="error" startIcon={<LogoutIcon />} onClick={handleLogout} sx={{ fontWeight: 'bold' }}>
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
                        backgroundColor: '#1C1917', // Deep Charcoal
                        color: '#FFFFFF',
                        borderRight: 'none',
                    },
                }}
                variant="permanent"
                anchor="left"
            >
                <Toolbar>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFFFFF', ml: 1, letterSpacing: '-0.5px' }}>
                        {isTenant ? 'Tenant Panel' : 'Admin Panel'}
                    </Typography>
                </Toolbar>
                <Divider sx={{ borderColor: '#44403C' }} />
                <List sx={{ mt: 1, px: 2 }}>
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <ListItem disablePadding key={item.text}>
                                <ListItemButton
                                    onClick={() => navigate(item.path)}
                                    sx={{
                                        bgcolor: isActive ? '#D97706' : 'transparent', // Amber 600
                                        '&:hover': { 
                                            bgcolor: isActive ? '#D97706' : '#292524',
                                        },
                                        mb: 0.5,
                                        borderRadius: '6px',
                                        transition: 'background-color 0.2s',
                                        color: isActive ? '#FFFFFF' : '#A8A29E',
                                    }}
                                >
                                    <ListItemIcon sx={{ color: isActive ? '#FFFFFF' : '#A8A29E', minWidth: '40px' }}>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        disableTypography
                                        primary={
                                            <Typography sx={{ 
                                                fontWeight: isActive ? 600 : 500,
                                                fontSize: '0.9rem',
                                                color: isActive ? '#FFFFFF' : '#A8A29E' 
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
                bgcolor: '#FAFAF9',
                p: 0,
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