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
    ListItem,
    ListItemIcon, 
    ListItemText,
    ListSubheader,
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
    AccountBox,
    Create,
    Visibility,
    Category,
    Group,
    ManageAccounts,
    PersonAdd,
    CalendarMonth,
    Task,
    PostAdd,
    Sync,
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

    const [taskManagementAnchorEl, setTaskMangementAnchorEl] = useState(null);
    const [staffManagementAnchorEl, setstaffManagementAnchorEl] = useState(null);
    const [stockManagementAnchorEl, setStockManagementAnchorEl] = useState(null);
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
            case 'stockManagement':
                setStockManagementAnchorEl(event.currentTarget);
                break;
            case 'staffManagement':
                setstaffManagementAnchorEl(event.currentTarget);
                break;
            case 'taskManagement':
                setTaskMangementAnchorEl(event.currentTarget);
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
            case 'stockManagement':
                setStockManagementAnchorEl(null);
                break;
            case 'staffManagement':
                setstaffManagementAnchorEl(null);
                break;
            case 'taskManagement':
                setTaskMangementAnchorEl(null);
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
        stockManagement: {
            roles: ['Manager', 'operator', 'Developer', 'Clerk'],
            items: [
                { label: 'เพิ่มหมวดหมู่สินค้า', icon: <Category />, path: '/create_category'},
                { label: 'เพิ่มสินค้า', icon: <Create />, path: '/create_item'},
                { label: 'จัดการสต๊อกสินค้า', icon: <Inventory />, path: '/stock_management' },
                { label: 'ดูคลังสินค้า', icon: <Visibility />, path: '/view_stock'}
            ]
        },
        staffManagement: {
            roles: ['Manager', 'operator', 'Developer'],
            items: [
                { label: 'จัดการข้อมลพนักงาน', icon: <ManageAccounts />, path: '/staff_list' },
                { label: 'เพิ่มข้อมูลพนักงาน', icon: <PersonAdd />, path: '/create_staff'},
                { label: 'จัดการวันลา', icon: <CalendarMonth />, path: '/manage_leave'}
            ]
        },
        taskManagement: {
            roles: ['Manager', 'operator', 'Developer', 'Clerk', 'Engineer', 'Trainee', 'Intern'],
            items: [
                { label: 'จัดการข้อมูลงาน', icon: <Task />, path: '/task_management' },
                // { label: 'จัดการสถานะงาน', icon: <Sync />, path: '/task_status' },
                { label: 'เพิ่มข้อมูลงาน', icon: <PostAdd />, path: '/create_task' },
            ]
        },
        requests: {
            roles: ['Manager', 'operator', 'Developer', 'Clerk', 'Engineer', 'Trainee', 'Intern'],
            items: [
                { label: 'ส่งคำร้องขอ ลากิจ/ลาอื่นๆ', icon: <RequestPage />, path: '/request_leave', disabled: !isLoggedIn }
            ]
        },
        account: {
            roles: ['Manager', 'operator', 'Developer', 'Clerk', 'Engineer', 'Trainee', 'Intern'],
            items: [
                { label: 'แก้ไขข้อมูล/บัญชี', icon: <AccountCircle />, path: '/edit_account' },
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
                case 'stockManagement':
                    return <Inventory />;
                case 'staffManagement':
                    return <Group/>
                case 'taskManagement':
                    return <Work/>
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
                case 'stockManagement':
                    return 'ระบบจัดการคลังสินค้า';
                case 'staffManagement':
                    return 'ระบบจัดการข้อมูลพนักงาน';
                case 'taskManagement':
                    return 'ระบบจัดการข้อมูลงาน';
                case 'requests':
                    return 'ระบบยื่นคำร้อง';
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

    const renderMobileMenu = (groupName, items = []) => {
        if (!Array.isArray(items)) return null; // Ensure items is an array
    
        return (
            <>
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
                <Divider />
            </>
        );
    };
    
    const groupNameMapping = {
        stockManagement: 'ระบบจัดการคลังสินค้า',
        staffManagement: 'ระบบจัดการข้อมูลพนักงาน',
        taskManagement: 'ระบบจัดการข้อมูลงาน',
        requests: 'ระบบยื่นคำร้อง',
        account: 'จัดการบัญชี',
        guest: 'เข้าสู่ระบบ',
    };    

    const renderMobileMenuWithGroups = () => (
        <Box sx={{ width: 250 }}>
            {Object.keys(navGroups).map((groupKey) => {
                const items = getRoleBasedNavItems(groupKey);
                const groupLabel = groupNameMapping[groupKey] || ''; // Corrected to use groupNameMapping
                
                if (items.length > 0) {
                    return (
                        <React.Fragment key={groupKey}>
                            {groupLabel && <ListSubheader>{groupLabel}</ListSubheader>}
                            {renderMobileMenu(groupKey, items)}
                            <Divider />
                        </React.Fragment>
                    );
                }
                return null;
            })}
        </Box>
    );
        

    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <Typography 
                        onClick={() => { 
                            navigate(user.name != '' ? '/landing' : '/'); 
                            setMobileOpen(false); 
                        }} 
                        variant="h6" 
                        sx={{ flexGrow: 1 }}
                    >
                        <Dashboard/> Atlanta-OSS
                    </Typography>
                    {!isMobile && isLoggedIn && (
                        <>
                            {getRoleBasedNavItems('stockManagement').length > 0 && renderDesktopMenu('stockManagement', getRoleBasedNavItems('stockManagement'), stockManagementAnchorEl, handleMenuClose)}
                            {getRoleBasedNavItems('staffManagement').length > 0 && renderDesktopMenu('staffManagement', getRoleBasedNavItems('staffManagement'), staffManagementAnchorEl, handleMenuClose)}
                            {getRoleBasedNavItems('taskManagement').length > 0 && renderDesktopMenu('taskManagement', getRoleBasedNavItems('taskManagement'), taskManagementAnchorEl, handleMenuClose)}
                            {getRoleBasedNavItems('requests').length > 0 && renderDesktopMenu('requests', getRoleBasedNavItems('requests'), requestsAnchorEl, handleMenuClose)}
                            {getRoleBasedNavItems('account').length > 0 && renderDesktopMenu('account', getRoleBasedNavItems('account'), accountAnchorEl, handleMenuClose)}
                        </>
                    )}
                    {!isMobile && !isLoggedIn && (
                        <Button color="inherit" onClick={() => navigate('/login')}>
                            เข้าสู่ระบบ
                        </Button>
                    )}
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ display: { xs: 'block', md: 'none' }, mr: 2 }}
                        onClick={handleDrawerToggle}
                    >
                        <MenuIcon />
                    </IconButton>
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
                {renderMobileMenuWithGroups()}
            </Drawer>
            <SuccessModal show={showSuccessModal} handleClose={handleCloseModal} message={message} />
        </>
    );
}
