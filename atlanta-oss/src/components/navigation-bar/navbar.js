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
    Divider,
    useTheme,
    useMediaQuery 
} from '@mui/material';
import { 
    Menu as MenuIcon, 
    AccountCircle, 
    Work, 
    Inventory, 
    RequestPage,
    Login, 
    ExitToApp,
    Dashboard,
    Assignment,
    AccountBox
} from '@mui/icons-material';
import { useNavigate } from "react-router-dom";
import SuccessModal from "../Modal/SuccessModal";
import { jwtDecode } from 'jwt-decode';

export default function CustomNavbar() {
    const navigate = useNavigate();
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [message, setMessage] = useState('');
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [managementAnchorEl, setManagementAnchorEl] = useState(null);
    const [requestsAnchorEl, setRequestsAnchorEl] = useState(null);
    const [accountAnchorEl, setAccountAnchorEl] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
                localStorage.removeItem('token');
                sessionStorage.removeItem('token');
            }
        } else {
            // If not logged in, default to guest
            setUser({
                name: '',
                role: 'Guest'
            });
        }
    }, []);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleMenuOpen = (event, menu) => {
        switch (menu) {
            case 'management':
                setManagementAnchorEl(event.currentTarget);
                break;
            case 'requests':
                setRequestsAnchorEl(event.currentTarget);
                break;
            case 'account':
                setAccountAnchorEl(event.currentTarget);
                break;
            default:
                break;
        }
    };

    const handleMenuClose = (menu) => {
        switch (menu) {
            case 'management':
                setManagementAnchorEl(null);
                break;
            case 'requests':
                setRequestsAnchorEl(null);
                break;
            case 'account':
                setAccountAnchorEl(null);
                break;
            default:
                break;
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        setMessage('ท่านได้ออกจากระบบเรียบร้อยแล้ว');
        setShowSuccessModal(true);
        setUser({
            name: '',
            role: 'Guest'
        });
    }

    const handleCloseModal = () => {
        setShowSuccessModal(false);
        navigate('/');
    };

    // Role-based navigation groups
    const navGroups = {
        management: {
            roles: ['Manager', 'operator', 'Developer', 'Clerk'],
            items: [
                { label: 'จัดการระบบงาน', icon: <Work />, path: '/task_list' },
                { label: 'จัดการสต๊อกสินค้า', icon: <Inventory />, path: '/stock_list' }
            ]
        },
        requests: {
            roles: ['Manager', 'operator', 'Developer', 'Clerk'],
            items: [
                { label: 'ส่งคำร้องขอ ลากิจ/ลาอื่นๆ', icon: <RequestPage />, path: '/request_leave', disabled: !isLoggedIn }
            ]
        },
        account: {
            roles: ['Manager', 'operator', 'Developer', 'Clerk'],
            items: [
                { label: 'แก้ไขข้อมูล/บัญชี', icon: <AccountCircle />, path: '/account' },
                { label: 'ออกจากระบบ', icon: <ExitToApp />, onClick: handleLogout }
            ]
        },
        guest: {
            roles: ['Guest'],
            items: [
                { label: 'ส่งคำร้องขอบัญชีเข้าใช้ระบบ', icon: <RequestPage />, path: '/request_form' },
                { label: 'เข้าสู่ระบบ', icon: <Login />, path: '/login' }
            ]
        }
    };

    const getRoleBasedNavItems = (group) => {
        return navGroups[group].items.filter(item => navGroups[group].roles.includes(user?.role));
    };

    const renderDesktopMenu = (groupName, items, anchorEl, handleClose) => {
        const getIcon = () => {
            switch (groupName) {
                case 'management':
                    return <Dashboard />;
                case 'requests':
                    return <Assignment />;
                case 'account':
                    return <AccountBox />;
                default:
                    return null;
            }
        };
    
        const getLabel = () => {
            switch (groupName) {
                case 'management':
                    return 'จัดการคลังสินค้า';
                case 'requests':
                    return 'ยื่นคำร้อง';
                case 'account':
                    return `จัดการบัญชี [${user.name}]`;
                default:
                    return groupName;
            }
        };
    
        return (
            <>
                <Button
                    color="inherit"
                    onClick={(e) => handleMenuOpen(e, groupName)}
                    startIcon={getIcon()}
                >
                    {getLabel()}
                </Button>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => handleMenuClose(groupName)}>
                    {items.map((item, index) => (
                        <MenuItem 
                            key={index} 
                            onClick={() => { item.path ? navigate(item.path) : item.onClick(); handleClose(groupName); }} 
                            disabled={item.disabled}
                        >
                            {item.label}
                        </MenuItem>
                    ))}
                </Menu>
            </>
        );
    };

    const renderMobileMenu = (items) => (
        <List>
            {items.map((item, index) => (
                <ListItem 
                    button 
                    key={index} 
                    onClick={() => { item.path ? navigate(item.path) : item.onClick(); setMobileOpen(false); }} 
                    disabled={item.disabled}
                >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} />
                </ListItem>
            ))}
        </List>
    );

    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ display: { xs: 'block', md: 'none' }, mr: 2 }}
                        onClick={handleDrawerToggle}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography onClick={() => { navigate('/'); setMobileOpen(false); }} variant="h6" sx={{ flexGrow: 1 }}>
                        Atlanta-OSS
                    </Typography>
                    {!isMobile && isLoggedIn && (
                        <>
                            {getRoleBasedNavItems('management').length > 0 && renderDesktopMenu('management', getRoleBasedNavItems('management'), managementAnchorEl, handleMenuClose)}
                            {getRoleBasedNavItems('requests').length > 0 && renderDesktopMenu('requests', getRoleBasedNavItems('requests'), requestsAnchorEl, handleMenuClose)}
                            {getRoleBasedNavItems('account').length > 0 && renderDesktopMenu('account', getRoleBasedNavItems('account'), accountAnchorEl, handleMenuClose)}
                        </>
                    )}
                    {!isMobile && !isLoggedIn && (
                        <Button color="inherit" onClick={() => navigate('/login')}>
                            Login
                        </Button>
                    )}
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
                <Box sx={{ width: 250 }}>
                    {isLoggedIn && renderMobileMenu(getRoleBasedNavItems('management'))}
                    {isLoggedIn && <Divider />}
                    {isLoggedIn && renderMobileMenu(getRoleBasedNavItems('requests'))}
                    {isLoggedIn && <Divider />}
                    {isLoggedIn ? renderMobileMenu(getRoleBasedNavItems('account')) : renderMobileMenu(getRoleBasedNavItems('guest'))}
                </Box>
            </Drawer>
            <SuccessModal show={showSuccessModal} handleClose={handleCloseModal} message={message} />
        </>
    );
}
