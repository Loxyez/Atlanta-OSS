import React, { useState, useEffect } from 'react';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper, 
    Button, 
    Dialog, 
    DialogActions, 
    DialogContent, 
    DialogContentText, 
    DialogTitle, 
    TablePagination,
    Typography,
    CircularProgress,
    TextField,
    Grid,
    Chip,
    Divider,
    Box,
    InputAdornment
} from '@mui/material';
import {
    Edit,
    Delete,
    AddCircleOutline,
    RemoveCircleOutline
} from '@mui/icons-material';
import axios from 'axios';
import config from '../../utils/config';
import CustomNavbar from '../navigation-bar/navbar';
import { Container } from 'react-bootstrap';

export default function StaffManagementDetail () {
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [staffDetails, setStaffDetails] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [openErrorDialog, setOpenErrorDialog] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [openSuccessDialog, setOpenSuccessDialog] = useState(false);

    useEffect(() => {
        fetchStaffDetails();
        fetchLeaveTypes();
    }, []);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const fetchStaffDetails = async () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        setLoading(true);
        try {
            const response = await axios.get(`${config.apiBaseUrl}/staffs/get_staff_detils`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStaffDetails(response.data);
        } catch (error) {
            console.error('Failed to fetch staff details', error);
        } finally {
            setLoading(false);
        }
    }

    const fetchLeaveTypes = async () => {
        try {
            const res = await axios.get(`${config.apiBaseUrl}/leave_requests/leave_types`);
            setLeaveTypes(res.data);
        } catch (error) {
            console.error('Error fetching the leave types', error);
        }
    };

    const handleEdit = (staff) => {
        setSelectedStaff(staff);
        setOpenEditDialog(true);
    };
    
    const handleDelete = (staff) => {
        setSelectedStaff(staff);
        setOpenDeleteDialog(true);
    };

    const confirmDelete = async () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        try {
            await axios.delete(`${config.apiBaseUrl}/staffs/delete_staff/${selectedStaff.staffid}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchStaffDetails();
            setOpenDeleteDialog(false);
            setOpenSuccessDialog(true);
        } catch (error) {
            console.error('Failed to delete staff', error);
            setErrorMessage('Failed to delete staff');
            setOpenErrorDialog(true);
        }
    }

    const handleSaveEdit = async () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        try {
            const response = await axios.put(`${config.apiBaseUrl}/staffs/update_staff/${selectedStaff.staffid}`, selectedStaff, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOpenEditDialog(false);
            fetchStaffDetails();
            setOpenSuccessDialog(true);
        } catch (error) {
            console.error('Failed to update staff details', error);
            setErrorMessage('Failed to update staff details');
            setOpenErrorDialog(true);
        }
    };

    const handleLeaveBalanceChange = (leaveTypeId, adjustment) => {
        setSelectedStaff(prevState => {
            const updatedBalances = prevState.leave_balances.map(balance => {
                if (balance.leave_type_id === leaveTypeId) {
                    return {
                        ...balance,
                        leave_days_left: Math.max(0, balance.leave_days_left + adjustment)
                    };
                }
                return balance;
            });
            return {
                ...prevState,
                leave_balances: updatedBalances
            };
        });
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
    };

    const handleCloseEditDialog = () => {
        setOpenEditDialog(false);
    };

    const getLeaveTypeName = (leaveTypeId) => {
        const leaveType = leaveTypes.find(type => type.leave_type_id === leaveTypeId);
        return leaveType ? leaveType.leave_name : 'Unknown';
    };

    const handleCloseErrorDialog = () => {
        setOpenErrorDialog(false);
        setErrorMessage('');
    };

    const handleCloseSuccessDialog = () => {
        setOpenSuccessDialog(false);
    };

    const roleMapping = {
        "Manager": "ผู้จัดการ",
        "Clerk": "เสมียน",
        "Engineer": "ช่าง",
        "Trainee": "นักศึกษาฝึกงาน",
        "Developer": "Developer FE/BE"
    };

    return (
        <div>
            <CustomNavbar/>
            <Container>
                <Typography variant="h4" sx={{ mt: 4, mb: 4 }} gutterBottom>
                    ระบบจัดการข้อมูลงาน
                </Typography>
                <Divider/>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4}}>
                        <CircularProgress />
                    </Box>
                ):(
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>รหัสประจำตัวพนักงาน</TableCell>
                                    <TableCell>ชื่อพนักงาน</TableCell>
                                    <TableCell>ตำแหน่ง</TableCell>
                                    <TableCell>เบอร์โทรศัพท์</TableCell>
                                    <TableCell>จำนวนวันลาที่เหลือ</TableCell>
                                    <TableCell>จัดการข้อมูล</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {staffDetails.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((staff) => (
                                    <TableRow key={staff.staffid}>
                                        <TableCell>{staff.staff_cardid}</TableCell>
                                        <TableCell>{staff.staff_name}</TableCell>
                                        <TableCell>{roleMapping[staff.staff_position] || staff.staff_position}</TableCell>
                                        <TableCell>{staff.staff_phone}</TableCell>
                                        <TableCell>
                                            {staff.leave_balances.map(balance => (
                                                <Chip 
                                                    key={balance.balance_id}
                                                    label={`${getLeaveTypeName(balance.leave_type_id)}: ${balance.leave_days_left} วัน`}
                                                    sx={{ m: 0.5 }}
                                                />
                                            ))}
                                        </TableCell>
                                        <TableCell>
                                            <Button 
                                                startIcon={<Edit />} 
                                                variant="contained" 
                                                color="primary" 
                                                onClick={() => handleEdit(staff)}
                                                sx={{ mr: 1 }}
                                            >
                                                แก้ไข
                                            </Button>
                                            <Button 
                                                startIcon={<Delete />} 
                                                variant="contained" 
                                                color="error" 
                                                onClick={() => handleDelete(staff)}
                                            >
                                                ลบข้อมูล
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <TablePagination
                            rowsPerPageOptions={[10, 25, 50]}
                            component="div"
                            count={staffDetails.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </TableContainer>
                )}

                {/* Delete Confirmation Dialog */}
                <Dialog
                    open={openDeleteDialog}
                    onClose={handleCloseDeleteDialog}
                >
                    <DialogTitle>ยืนยันการลบข้อมูล</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            คุณต้องการลบข้อมูลพนังงานคนนี้ใช่หรือไม่? 
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDeleteDialog} color="primary">
                            ยกเลิก
                        </Button>
                        <Button onClick={confirmDelete} color="error">
                            ลบ
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Edit Staff Dialog */}
                <Dialog
                    open={openEditDialog}
                    onClose={handleCloseEditDialog}
                >
                    <DialogTitle>Edit Staff Details</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Edit the details of the staff member.
                        </DialogContentText>
                        {/* Add form fields to edit the staff details */}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseEditDialog} color="primary">
                            Cancel
                        </Button>
                        <Button color="primary">
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Error Dialog */}
                <Dialog
                    open={openErrorDialog}
                    onClose={handleCloseErrorDialog}
                >
                    <DialogTitle>Error</DialogTitle>
                    <DialogContent>
                        <DialogContentText>{errorMessage}</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseErrorDialog} color="primary">ปิด</Button>
                    </DialogActions>
                </Dialog>

                {/* Success Dialog */}
                <Dialog
                    open={openSuccessDialog}
                    onClose={handleCloseSuccessDialog}
                >
                    <DialogTitle>Success</DialogTitle>
                    <DialogContent>
                        <DialogContentText>ระบบได้ทำการบันทึกเข้าสู่ฐานข้อมูลเรียบร้อย</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseSuccessDialog} color="primary">ปิด</Button>
                    </DialogActions>
                </Dialog>

                {/* Edit Staff Dialog */}
                <Dialog
                    open={openEditDialog}
                    onClose={handleCloseEditDialog}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>แก้ไขข้อมูลพนักงาน</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            แก้ไขข้อมูลพนักงาน และ แก้ไขวันลาต่างๆของพนักงาน
                        </DialogContentText>
                        <Grid container spacing={2} sx={{ mt: 2 }}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="ชื่อ-นามสกุล"
                                    value={selectedStaff?.staff_name || ''}
                                    onChange={(e) => setSelectedStaff({ ...selectedStaff, staff_name: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="ชื่อเล่น"
                                    value={selectedStaff?.staff_nickname || ''}
                                    onChange={(e) => setSelectedStaff({ ...selectedStaff, staff_nickname: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="เบอร์โทรศัพท์"
                                    value={selectedStaff?.staff_phone || ''}
                                    onChange={(e) => setSelectedStaff({ ...selectedStaff, staff_phone: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="ตำแหน่ง"
                                    value={selectedStaff?.staff_position || ''}
                                    onChange={(e) => setSelectedStaff({ ...selectedStaff, staff_position: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="ที่อยู่"
                                    value={selectedStaff?.staff_address || ''}
                                    onChange={(e) => setSelectedStaff({ ...selectedStaff, staff_address: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="LINE ID"
                                    value={selectedStaff?.staff_lineid || ''}
                                    onChange={(e) => setSelectedStaff({ ...selectedStaff, staff_lineid: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="เบอร์โทรติดต่อฉุกเฉิน"
                                    value={selectedStaff?.staff_econtract || ''}
                                    onChange={(e) => setSelectedStaff({ ...selectedStaff, staff_econtract: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="ข้อมูลเพิ่มเติม"
                                    value={selectedStaff?.staff_detail || ''}
                                    onChange={(e) => setSelectedStaff({ ...selectedStaff, staff_detail: e.target.value })}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="h6">แก้ไขข้อมูลวันลา</Typography>
                                {selectedStaff?.leave_balances.map(balance => (
                                    <Grid container spacing={1} key={balance.balance_id} alignItems="center">
                                        <Grid item xs={6}>
                                            {getLeaveTypeName(balance.leave_type_id)}
                                        </Grid>
                                        <Grid item xs={4}>
                                            <TextField
                                                fullWidth
                                                value={balance.leave_days_left}
                                                InputProps={{
                                                    readOnly: true,
                                                    endAdornment: <InputAdornment position="end">วัน</InputAdornment>,
                                                }}
                                            />
                                        </Grid>
                                        <Grid item xs={1}>
                                            <Button onClick={() => handleLeaveBalanceChange(balance.leave_type_id, 1)}>
                                                <AddCircleOutline />
                                            </Button>
                                        </Grid>
                                        <Grid item xs={1}>
                                            <Button onClick={() => handleLeaveBalanceChange(balance.leave_type_id, -1)}>
                                                <RemoveCircleOutline />
                                            </Button>
                                        </Grid>
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseEditDialog} color="primary">
                            ยกเลิก
                        </Button>
                        <Button onClick={handleSaveEdit} color="primary">
                            บันทึกข้อมูล
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </div>
    )
}