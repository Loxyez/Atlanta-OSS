import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Container, 
    Grid, 
    Paper, 
    Typography, 
    TextField, 
    Button, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions 
} from '@mui/material';
import { Autocomplete } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { LocalizationProvider } from '@mui/x-date-pickers';
import CustomNavbar from '../navigation-bar/navbar';
import SuccessModal from '../Modal/SuccessModal';
import ErrorModal from '../Modal/ErrorModel';
import config from '../../utils/config';
import { CloudUpload } from '@mui/icons-material';

export default function CreateTask() {
  const [members, setMembers] = useState([]);
  const [staffDetails, setStaffDetails] = useState([]);
  const [taskDetail, setTaskDetail] = useState('');
  const [taskFixDetail, setTaskFixDetail] = useState('');
  const [taskDeviceDetail, setTaskDeviceDetail] = useState('');
  const [taskEndDate, setTaskEndDate] = useState(null);
  const [memberId, setMemberId] = useState(null);
  const [staffCardId, setStaffCardId] = useState('');
  const [memberName, setMemberName] = useState('');
  const [staffName, setStaffName] = useState('');
  const [taskPic, setTaskPic] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');

  // Fetch members and staff details
  useEffect(() => {
    const fetchMembers = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      try {
        const res = await axios.get(`${config.apiBaseUrl}/members/get_all_members`, {
          headers: { Authorization: `Bearer ${token}` }
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
          headers: { Authorization: `Bearer ${token}` }
        });
        setStaffDetails(res.data);
      } catch (error) {
        console.error('Error fetching staff details', error);
      }
    };

    fetchMembers();
    fetchStaffDetails();
  }, []);

  const handleMemberChange = (e, value) => {
    setMemberId(value?.memberid || '');
    setMemberName(value?.member_name || '');
  };

  const handleStaffChange = (e, value) => {
    setStaffCardId(value?.staff_cardid || '');
    setStaffName(value?.staff_name || '');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTaskPic(file);
    }
  };

  const resetForm = () => {
    setTaskDetail('');
    setTaskFixDetail('');
    setTaskDeviceDetail('');
    setTaskEndDate(null);
    setMemberId('');
    setMemberName('');
    setStaffCardId('');
    setStaffName('');
    setTaskPic(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedTaskEndDate = taskEndDate 
        ? new Date(taskEndDate).toISOString()
        : null;

    const taskData = new FormData();
    taskData.append('memberid', memberId);
    taskData.append('task_status', 'Pending');
    taskData.append('task_detail', taskDetail);
    taskData.append('task_fix_detail', taskFixDetail);
    taskData.append('task_device_detail', taskDeviceDetail);
    taskData.append('staff_cardid', staffCardId);
    taskData.append('task_end_date_at', formattedTaskEndDate);
    
    if (taskPic) {
      taskData.append('task_pic', taskPic);
    }

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await axios.post(`${config.apiBaseUrl}/tasks/create_task`, taskData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' 
        }
      });

      if (res.status === 201) {
        setSuccess('เพิ่มข้อมูลงานเสร็จเรียบร้อย');
        setShowSuccessModal(true);
        resetForm(); // Clear form after successful submission
      } else {
        setError('ไม่สามารถเพิ่มข้อมูลงานได้');
        setShowErrorModal(true);
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาดขณะเพิ่มข้อมูลงาน');
      setShowErrorModal(true);
    }
  };

  const handleCloseSuccessModal = () => setShowSuccessModal(false);
  const handleCloseErrorModal = () => setShowErrorModal(false);

  // Add new member dialog handling
  const openAddMemberDialog = () => setShowAddMemberDialog(true);
  const closeAddMemberDialog = () => {
    setShowAddMemberDialog(false);
    setNewMemberName('');
    setNewMemberPhone('');
  };

  const handleAddMember = async () => {
    if (!/^\d{10}$/.test(newMemberPhone)) {
      setError('กรุณากรอกเบอร์โทรที่ถูกต้อง (10 หลัก)');
      setShowErrorModal(true); // เปิด Error Modal
      return;
    }
  
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    try {
      const res = await axios.post(
        `${config.apiBaseUrl}/members/add_member`, 
        { member_name: newMemberName, member_phone: newMemberPhone },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (res.status === 201) {
        setSuccess('เพิ่มสมาชิกใหม่เรียบร้อย');
        setShowSuccessModal(true); // เปิด Success Modal
        setMembers((prev) => [...prev, res.data]);
        closeAddMemberDialog(); // ปิด Dialog เพิ่มสมาชิก
      } else {
        setError('ไม่สามารถเพิ่มสมาชิกได้');
        setShowErrorModal(true); // เปิด Error Modal
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาดขณะเพิ่มสมาชิก');
      setShowErrorModal(true); // เปิด Error Modal
    }
  };

  return (
    <div>
      <CustomNavbar />
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>เพิ่มงานใหม่</Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={members}
                  getOptionLabel={(option) => option.member_name}
                  onChange={handleMemberChange}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label="เลือกสมาชิก" 
                      fullWidth 
                      required 
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {params.InputProps.endAdornment}
                            <Button onClick={openAddMemberDialog}>เพิ่มสมาชิก</Button>
                          </>
                        )
                      }}
                    />
                  )}
                />
                {memberId && <Typography variant="body2">ID สมาชิก: {memberId}</Typography>}
              </Grid>

              <Grid item xs={12} sm={6}>
                <Autocomplete
                    options={staffDetails}
                    getOptionLabel={(option) => option.staff_name || ''} 
                    onChange={handleStaffChange}
                    renderInput={(params) => (
                    <TextField 
                        {...params} 
                        label="เลือกพนักงาน (ชื่อเล่น)" 
                        fullWidth 
                        required 
                    />
                    )}
                />
                {staffCardId && (
                    <Typography variant="body2">Card ID พนักงาน: {staffCardId}</Typography>
                )}
              </Grid>

              {/* Task Detail Input */}
              <Grid item xs={12}>
                <TextField
                  label="รายละเอียดงาน"
                  multiline
                  rows={4}
                  value={taskDetail}
                  onChange={(e) => setTaskDetail(e.target.value)}
                  fullWidth
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                    label="รายละเอียดการแก้ไขงาน"
                    multiline
                    rows={4}
                    value={taskFixDetail}
                    onChange={(e) => setTaskFixDetail(e.target.value)}
                    fullWidth
                    required
                />
                </Grid>

                <Grid item xs={12}>
                <TextField
                    label="Device Detail"
                    value={taskDeviceDetail}
                    onChange={(e) => setTaskDeviceDetail(e.target.value)}
                    fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="วันที่สิ้นสุด"
                    value={taskEndDate}
                    onChange={(newValue) => setTaskEndDate(newValue)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUpload />}
                  fullWidth
                >
                  อัปโหลดรูปภาพ
                  <input 
                    type="file" 
                    accept="image/*" 
                    hidden 
                    onChange={handleFileChange} 
                  />
                </Button>
                {taskPic && <Typography variant="body2">ไฟล์: {taskPic.name}</Typography>}
              </Grid>
            </Grid>
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }}>
              เพิ่มงาน
            </Button>
          </form>
        </Paper>
      </Container>

      {/* Success Modal */}
        <Dialog open={showSuccessModal} onClose={handleCloseSuccessModal}>
        <DialogTitle>สำเร็จ</DialogTitle>
        <DialogContent>
            <Typography>{success}</Typography>
        </DialogContent>
        <DialogActions>
            <Button onClick={handleCloseSuccessModal} color="primary">
            ตกลง
            </Button>
        </DialogActions>
        </Dialog>

        {/* Error Modal */}
        <Dialog open={showErrorModal} onClose={handleCloseErrorModal}>
        <DialogTitle>เกิดข้อผิดพลาด</DialogTitle>
        <DialogContent>
            <Typography>{error}</Typography>
        </DialogContent>
        <DialogActions>
            <Button onClick={handleCloseErrorModal} color="primary">
            ตกลง
            </Button>
        </DialogActions>
        </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={showAddMemberDialog} onClose={closeAddMemberDialog}>
        <DialogTitle>เพิ่มสมาชิกใหม่</DialogTitle>
        <DialogContent>
          <TextField
            label="ชื่อสมาชิก"
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="เบอร์โทรศัพท์"
            value={newMemberPhone}
            onChange={(e) => setNewMemberPhone(e.target.value)}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAddMemberDialog} color="error">
            ยกเลิก
          </Button>
          <Button onClick={handleAddMember} color="primary">
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
