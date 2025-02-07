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
    Grid,
    Divider,
    Box,
    TextField,
} from '@mui/material';
import { Edit, Delete, Image, Visibility } from '@mui/icons-material';
import { Autocomplete } from '@mui/material';
import axios from 'axios';
import config from '../../utils/config';
import { Container } from 'react-bootstrap';
import CustomNavbar from '../navigation-bar/navbar';

export default function TaskManagement() {
    const [tasks, setTasks] = useState([]);
    const [members, setMembers] = useState([]);
    const [staffDetails, setStaffDetails] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [openDetailDialog, setOpenDetailDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openImageDialog, setOpenImageDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [successDialog, setSuccessDialog] = useState(false);
    const [imageToShow, setImageToShow] = useState('');
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [editedTask, setEditedTask] = useState({}); 
    const [detailToShow, setDetailToShow] = useState({});

    useEffect(() => {
        fetchTasks();
        fetchMembers();
        fetchStaffDetails();
    }, []);

    const fetchTasks = async () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        setLoading(true);
        try {
            const response = await axios.get(`${config.apiBaseUrl}/tasks/get_all_tasks`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTasks(response.data);
            // Sort tasks by taskid in ascending order
            const sortedTasks = response.data.sort((a, b) => a.taskid - b.taskid);
            setTasks(sortedTasks);
        } catch (error) {
            console.error('Failed to fetch tasks', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMembers = async () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        try {
            const res = await axios.get(`${config.apiBaseUrl}/members/get_all_members`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMembers(res.data);
        } catch (error) {
            console.error('Error fetching members', error);
        }
    };

    const fetchStaffDetails = async () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        try {
            const res = await axios.get(`${config.apiBaseUrl}/staffs/get_staff_cardids`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setStaffDetails(res.data);
        } catch (error) {
            console.error('Error fetching staff details', error);
        }
    };

    const handleEdit = (task) => {
        setSelectedTask(task);
        setEditedTask({ ...task }); // ตั้งค่าเริ่มต้นของฟอร์มแก้ไข
        setOpenEditDialog(true);
    };

    const handleDelete = (task) => {
        setSelectedTask(task);
        setOpenDeleteDialog(true);
    };

    const confirmDelete = async () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        try {
            await axios.delete(`${config.apiBaseUrl}/tasks/delete_task/${selectedTask.taskid}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchTasks();
            setOpenDeleteDialog(false);
        } catch (error) {
            console.error('Failed to delete task', error);
        }
    };

    const handleUpdateTask = async () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const formData = new FormData();
    
        formData.append('memberid', editedTask.memberid);
        formData.append('staff_cardid', editedTask.staff_cardid);
        formData.append('task_end_date_at', editedTask.task_end_date_at);
        formData.append('task_detail', editedTask.task_detail);
        formData.append('task_fix_detail', editedTask.task_fix_detail);
        if (editedTask.task_pic && typeof editedTask.task_pic !== 'string') {
            formData.append('task_pic', editedTask.task_pic);
        }
    
        try {
            await axios.put(`${config.apiBaseUrl}/tasks/update_task/${editedTask.taskid}`, formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
            });
            fetchTasks();
            setOpenEditDialog(false);
            setSuccessDialog(true);
        } catch (error) {
            console.error('Failed to update task', error);
        }
    };

    const handleCloseSuccessDialog = () => {
        setSuccessDialog(false);
    };

    const handleOpenImageDialog = (imageUrl) => {
        setImageToShow(imageUrl);
        setOpenImageDialog(true);
    };

    const handleCloseImageDialog = () => {
        setOpenImageDialog(false);
        setImageToShow('');
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleViewDetails = (field, value) => {
        setDetailToShow({ field, value });
        setOpenDetailDialog(true);
    };

    const handleCloseDetailDialog = () => {
        setOpenDetailDialog(false);
        setDetailToShow({});
    };

    const getMemberName = (memberid) => {
        const member = members.find((m) => m.memberid === memberid);
        return member ? member.member_name : 'Unknown';
    };

    const getStaffName = (staffCardId) => {
        const staff = staffDetails.find((s) => s.staff_cardid === staffCardId);
        return staff ? staff.staff_name : 'Unknown';
    };

    return (
        <div>
            <CustomNavbar />
            <Container>
                <Typography variant="h4" sx={{ mt: 4, mb: 4 }} gutterBottom>
                    ระบบจัดการข้อมูลงาน (Task Management)
                </Typography>
                <Divider />
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <TableContainer component={Paper} >
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ชื่อสมาชิก</TableCell>
                                    <TableCell>ผู้รับผิดชอบงาน</TableCell>
                                    <TableCell>รายละเอียดงาน</TableCell>
                                    <TableCell>รายละเอียดการแก้ไข</TableCell>
                                    <TableCell>รูปภาพ</TableCell>
                                    <TableCell>อุปกรณ์</TableCell>
                                    <TableCell>สถานะ</TableCell>
                                    <TableCell>วันที่สิ้นสุด</TableCell>
                                    <TableCell>จัดการ</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tasks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((task) => (
                                    <TableRow key={task.taskid}>
                                        <TableCell>{getMemberName(task.memberid)}</TableCell>
                                        <TableCell>{getStaffName(task.staff_cardid)}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                size="small"
                                                startIcon={<Visibility />}
                                                onClick={() => handleViewDetails('รายละเอียดงาน', task.task_detail)}
                                            >
                                                ดูรายละเอียด
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                size="small"
                                                startIcon={<Visibility />}
                                                onClick={() => handleViewDetails('รายละเอียดการแก้ไข', task.task_fix_detail)}
                                            >
                                                ดูรายละเอียด
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            {task.task_pic ? (
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    size="small"
                                                    startIcon={<Image />}
                                                    onClick={() => handleOpenImageDialog(task.task_pic)}
                                                >
                                                    ดูรูปภาพ
                                                </Button>
                                            ) : (
                                                'ไม่มีรูปภาพ'
                                            )}
                                        </TableCell>
                                        <TableCell>{task.task_device_detail}</TableCell>
                                        <TableCell>{task.task_status}</TableCell>
                                        <TableCell>{task.task_end_date_at}</TableCell>
                                        <TableCell>
                                            <Grid container justifyContent="center" spacing={1} >
                                                <Grid item>
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        size="small"
                                                        onClick={() => handleEdit(task)}
                                                        startIcon={<Edit />}
                                                    >
                                                        แก้ไข
                                                    </Button>
                                                </Grid>
                                                <Grid item>
                                                    <Button
                                                        variant="contained"
                                                        color="error"
                                                        size="small"
                                                        onClick={() => handleDelete(task)}
                                                        startIcon={<Delete />}
                                                    >
                                                        ลบ
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <TablePagination
                            rowsPerPageOptions={[10, 25, 50]}
                            component="div"
                            count={tasks.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </TableContainer>
                )}

                {/* Delete Confirmation Dialog */}
                <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                    <DialogTitle>ยืนยันการลบงาน</DialogTitle>
                    <DialogContent>
                        <DialogContentText>คุณต้องการลบงานนี้ใช่หรือไม่?</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
                            ยกเลิก
                        </Button>
                        <Button onClick={confirmDelete} color="error">
                            ลบ
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Image Dialog */}
                <Dialog open={openImageDialog} onClose={handleCloseImageDialog} maxWidth="sm" fullWidth>
                    <DialogTitle>รูปภาพงาน</DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            {imageToShow ? (
                                <img
                                    src={`${imageToShow}`}
                                    alt="Task"
                                    style={{ maxWidth: '100%', maxHeight: '400px' }}
                                />
                            ) : (
                                'ไม่พบรูปภาพ'
                            )}
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseImageDialog} color="primary">
                            ปิด
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Detail Dialog */}
                <Dialog open={openDetailDialog} onClose={handleCloseDetailDialog}>
                    <DialogTitle>{detailToShow.field}</DialogTitle>
                    <DialogContent>
                        <Typography
                            variant="body1"
                            sx={{
                                whiteSpace: 'pre-wrap', // รองรับการแสดงผลหลายบรรทัด
                                wordWrap: 'break-word', // ทำให้ข้อความที่ยาวไม่เกินหน้าจอ
                                maxHeight: '400px', // จำกัดความสูง
                                overflowY: 'auto', // เพิ่ม scroll หากข้อความยาวเกินไป
                            }}
                        >
                            {detailToShow.value}
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDetailDialog} color="primary">
                            ปิด
                        </Button>
                    </DialogActions>
                </Dialog>


                {/* Edit Task Dialog */}
                <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>แก้ไขงาน</DialogTitle>
                    <DialogContent>
                        {/* เปลี่ยนชื่อสมาชิก */}
                        <Autocomplete
                            options={members}
                            getOptionLabel={(option) => option.member_name}
                            value={members.find((m) => m.memberid === editedTask.memberid) || null}
                            onChange={(event, newValue) => setEditedTask({ ...editedTask, memberid: newValue?.memberid || '' })}
                            renderInput={(params) => <TextField {...params} label="ชื่อสมาชิก" fullWidth margin="normal" />}
                        />
                        
                        {/* เปลี่ยนชื่อผู้รับผิดชอบงาน */}
                        <Autocomplete
                            options={staffDetails}
                            getOptionLabel={(option) => option.staff_name}
                            value={staffDetails.find((s) => s.staff_cardid === editedTask.staff_cardid) || null}
                            onChange={(event, newValue) => setEditedTask({ ...editedTask, staff_cardid: newValue?.staff_cardid || '' })}
                            renderInput={(params) => <TextField {...params} label="ผู้รับผิดชอบงาน" fullWidth margin="normal" />}
                        />

                        {/* วันที่สิ้นสุด */}
                        <TextField
                            fullWidth
                            label="วันที่สิ้นสุด"
                            type="date"
                            value={editedTask.task_end_date_at || ''}
                            onChange={(e) => setEditedTask({ ...editedTask, task_end_date_at: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            margin="normal"
                            sx={{ marginBottom: 2 }}
                        />

                        {/* รายละเอียดงาน */}
                        <TextField
                            label="รายละเอียดของงาน"
                            value={editedTask.task_detail || ''}
                            onChange={(e) => setEditedTask({ ...editedTask, task_detail: e.target.value })}
                            fullWidth
                            multiline
                            variant="outlined"
                            sx={{ marginBottom: 2 }}
                        />

                        {/* รายละเอียดการแก้ไข */}
                        <TextField
                            label="รายละเอียดการแก้ไข"
                            value={editedTask.task_fix_detail || ''}
                            onChange={(e) => setEditedTask({ ...editedTask, task_fix_detail: e.target.value })}
                            fullWidth
                            multiline
                            variant="outlined"
                            sx={{ marginBottom: 2 }}
                        />

                        {/* อัปโหลดรูปภาพ */}
                        <Button
                            variant="contained"
                            component="label"
                            sx={{ mt: 2 }}
                        >
                            อัปโหลดรูปภาพใหม่
                            <input
                                type="file"
                                hidden
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    setEditedTask({ ...editedTask, task_pic: file });
                                }}
                            />
                        </Button>
                        {editedTask.task_pic && typeof editedTask.task_pic === 'string' && (
                            <Typography sx={{ mt: 1 }}>รูปภาพเดิม: {editedTask.task_pic}</Typography>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleUpdateTask} color="primary">
                            บันทึก
                        </Button>
                        <Button onClick={() => setOpenEditDialog(false)} color="error">
                            ยกเลิก
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Success Dialog */}
                <Dialog open={successDialog} onClose={handleCloseSuccessDialog}>
                    <DialogTitle>บันทึกสำเร็จ</DialogTitle>
                    <DialogContent>
                        <DialogContentText>การแก้ไขงานเสร็จสมบูรณ์</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseSuccessDialog}>ตกลง</Button>
                    </DialogActions>
                </Dialog>
            </Container>            
        </div>
    );
}
