import React, { useEffect, useState } from "react";
import { 
    AppBar, 
    Toolbar, 
    IconButton, 
    Typography, 
    Menu, 
    MenuItem, 
    Button, 
    Box, 
    Drawer, 
    List, 
    ListItem,
    ListItemIcon, 
    ListItemText,
    Divider } from '@mui/material';
import { 
    Menu as MenuIcon, 
    AccountCircle, 
    Work, 
    Inventory, 
    RequestPage,
    Login, 
    ExitToApp } from '@mui/icons-material';
import { useNavigate } from "react-router-dom";
import SuccessModal from "../Modal/SuccessModal";
import { jwtDecode } from 'jwt-decode';

export default function CustomNavbar() {
    const navigate = useNavigate();
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [message, setMessage] = useState('');
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        setIsLoggedIn(!!token);
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUser({
                    name: decoded.user_name || 'User',
                    role: decoded.user_role || 'Guest'
                });
            } catch (error) {
                console.error('Error decoding token:', error);
                // If token is invalid, remove it
                localStorage.removeItem('token');
                sessionStorage.removeItem('token');
            }
        }
    }, []);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    // Handle logout
    const handleLogout = () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        setMessage('ท่านได้ออกจากระบบเรียบร้อยแล้ว');
        setShowSuccessModal(true);
        setUser(null);
    }

    const handleCloseModal = () => {
        setShowSuccessModal(false);
        navigate('/'); // Navigate to homepage after modal closes
    };

    // Helper function to generate navigation items based on role
    const getNavItems = () => {
        switch (user?.role) {
            case 'Manager':
            case 'operator':
            case 'Developer':
                return (
                    <>
                        <ListItem button onClick={() => { navigate('/task_list'); setMobileOpen(false); }}>
                            <ListItemIcon><Work /></ListItemIcon>
                            <ListItemText primary="จัดการระบบงาน" />
                        </ListItem>
                        <ListItem button onClick={() => { navigate('/stock_list'); setMobileOpen(false); }}>
                            <ListItemIcon><Inventory /></ListItemIcon>
                            <ListItemText primary="จัดการสต๊อกสินค้า" />
                        </ListItem>
                        <ListItem button onClick={() => { navigate('/request_leave'); setMobileOpen(false); }} disabled={!isLoggedIn}>
                            <ListItemIcon><RequestPage /></ListItemIcon>
                            <ListItemText primary="ส่งคำร้องขอ ลากิจ/ลาอื่นๆ" />
                        </ListItem>
                    </>
                );
            case 'Clerk':
                return (
                    <>
                        <ListItem button onClick={() => { navigate('/task_list'); setMobileOpen(false); }}>
                            <ListItemIcon><Work /></ListItemIcon>
                            <ListItemText primary="จัดการระบบงาน" />
                        </ListItem>
                        <ListItem button onClick={() => { navigate('/stock_list'); setMobileOpen(false); }}>
                            <ListItemIcon><Inventory /></ListItemIcon>
                            <ListItemText primary="จัดการสต๊อกสินค้า" />
                        </ListItem>
                        <ListItem button onClick={() => { navigate('/request_leave'); setMobileOpen(false); }} disabled={!isLoggedIn}>
                            <ListItemIcon><RequestPage /></ListItemIcon>
                            <ListItemText primary="ส่งคำร้องขอ ลากิจ/ลาอื่นๆ" />
                        </ListItem>
                    </>
                );
            default:
                return (
                    <>
                        <ListItem button onClick={() => { navigate('/request_form'); setMobileOpen(false); }}>
                            <ListItemIcon><RequestPage /></ListItemIcon>
                            <ListItemText primary="ส่งคำร้องขอบัญชีเข้าใช้ระบบ" />
                        </ListItem>
                        <ListItem button onClick={() => { navigate('/login'); setMobileOpen(false); }}>
                            <ListItemIcon><Login /></ListItemIcon>
                            <ListItemText primary="เข้าสู่ระบบ" />
                        </ListItem>
                    </>
                );
        }
    };

    const drawer = (
        <Box sx={{ width: 250 }} onClick={handleDrawerToggle}>
            <List>
                {getNavItems()}
                <Divider />
                {user && (
                    <>
                        <ListItem button onClick={() => { navigate('/account'); setMobileOpen(false); }}>
                            <ListItemIcon><AccountCircle /></ListItemIcon>
                            <ListItemText primary="แก้ไขข้อมูล/บัญชี" />
                        </ListItem>
                        <ListItem button onClick={handleLogout}>
                            <ListItemIcon><ExitToApp /></ListItemIcon>
                            <ListItemText primary="ออกจากระบบ" />
                        </ListItem>
                    </>
                )}
            </List>
        </Box>
    );

    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ display: { xs: 'block', md: 'none' }, mr: 2 }} // Hide on desktop (md and up)
                        onClick={handleDrawerToggle}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography  onClick={() => { navigate('/'); setMobileOpen(false); }} variant="h6" sx={{ flexGrow: 1 }}>
                        Atlanta-OSS
                    </Typography>
                    <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                        {getNavItems()}
                        {user && (
                            <IconButton
                                edge="end"
                                color="inherit"
                                aria-label="account"
                                onClick={handleDrawerToggle}
                            >
                                <AccountCircle />
                                <Typography variant="subtitle1" sx={{ ml: 1 }}>
                                    {user.name}
                                </Typography>
                            </IconButton>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="temporary"
                anchor="left"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true,
                }}
            >
                {drawer}
            </Drawer>

            <SuccessModal show={showSuccessModal} handleClose={handleCloseModal} message={message} />
        </>
    );
}
