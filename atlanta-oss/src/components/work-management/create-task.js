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
    DialogActions,
    CircularProgress
} from '@mui/material';
import { Autocomplete } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { LocalizationProvider } from '@mui/x-date-pickers';
import CustomNavbar from '../navigation-bar/navbar';
import config from '../../utils/config';
import { CloudUpload } from '@mui/icons-material';

export default function CreateTask() {
  const [members, setMembers] = useState([]);
  const [deviceModel, setDeviceModel] = useState([]);
  const [deviceCategory, setDeviceCategory] = useState([]);
  const [staffDetails, setStaffDetails] = useState([]);
  const [taskDetail, setTaskDetail] = useState('');
  const [taskFixDetail, setTaskFixDetail] = useState('');
  const [taskDeviceModel, setTaskDeviceModel] = useState('');
  const [taskDeviceCategory, setTaskDeviceCategory] = useState('');
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

  const [showAddDeviceModelDialog, setShowAddDeviceModelDialog] = useState(false);
  const [newDeviceModel, setNewDeviceModel] = useState('');

  const [showAddDeviceCategoryDialog, setShowAddDeviceCategoryDialog] = useState(false);
  const [newDeviceCategory, setNewDeviceCategory] = useState('');

  const [loading, setLoading] = useState(false);

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

    const fetchDeviceModel = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      try {
        const res = await axios.get(`${config.apiBaseUrl}/devices/get_device_models`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDeviceModel(res.data);
      } catch (error) {
        console.error('Error fetching device models', error);
      }
    };

    const fetchDeviceCategory = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      try {
        const res = await axios.get(`${config.apiBaseUrl}/devices/get_device_category`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDeviceCategory(res.data);
      } catch (error) {
        console.error('Error fetching device categories', error);
      }
    };

    fetchMembers();
    fetchStaffDetails();
    fetchDeviceModel();
    fetchDeviceCategory();
  }, []);

  const handleMemberChange = (e, value) => {
    setMemberId(value?.memberid || '');
    setMemberName(value?.member_name || '');
  };

  const handleDeviceModelChange = (e, value) => {
    setTaskDeviceModel(value?.name || '');
  };

  const handleDeviceCategoryChange = (e, value) => {
    setTaskDeviceCategory(value?.name || '');
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
    setTaskDeviceModel('');
    setTaskDeviceCategory('');
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
    setLoading(true);

    const formattedTaskEndDate = taskEndDate 
        ? new Date(taskEndDate).toISOString()
        : null;

    const taskData = new FormData();
    taskData.append('memberid', memberId);
    taskData.append('task_status', 'Pending');
    taskData.append('task_detail', taskDetail);
    taskData.append('task_fix_detail', taskFixDetail);
    taskData.append('task_device_model', taskDeviceModel);
    taskData.append('task_device_category', taskDeviceCategory);
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
        setLoading(false);
      } else {
        setError('ไม่สามารถเพิ่มข้อมูลงานได้');
        setShowErrorModal(true);
        setLoading(false);
      }
    } catch (error) {
      // if return status is 400
      console.log(error.response.status);
      if (error.response.status === 400) {
        setError(error.response.data.message);
      } else {
        setError('เกิดข้อผิดพลาดขณะเพิ่มข้อมูลงาน');
      }
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

  const openAddDeviceModelDialog = () => setShowAddDeviceModelDialog(true);
  const closeAddDeviceModelDialog = () => {
    setShowAddDeviceModelDialog(false);
    setNewDeviceModel('');
  };

  const openAddDeviceCategoryDialog = () => setShowAddDeviceCategoryDialog(true);
  const closeAddDeviceCategoryDialog = () => {
    setShowAddDeviceCategoryDialog(false);
    setNewDeviceCategory('');
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

  const handleAddDeviceModel = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    try {
      const res = await axios.post(
        `${config.apiBaseUrl}/devices/add_device_model`, 
        { name: newDeviceModel },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (res.status === 201) {
        setSuccess('เพิ่มรุ่นอุปกรณ์ใหม่เรียบร้อย');
        setShowSuccessModal(true); // เปิด Success Modal
        setDeviceModel((prev) => [...prev, res.data]);
        closeAddDeviceModelDialog(); // ปิด Dialog เพิ่มรุ่นอุปกรณ์
      } else {
        setError('ไม่สามารถเพิ่มรุ่นอุปกรณ์ได้');
        setShowErrorModal(true); // เปิด Error Modal
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาดขณะเพิ่มรุ่นอุปกรณ์');
      setShowErrorModal(true); // เปิด Error Modal
    }
  }

  const handleAddDeviceCategory = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    try {
      const res = await axios.post(
        `${config.apiBaseUrl}/devices/add_device_category`, 
        { name: newDeviceCategory },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 201) {
        setSuccess('เพิ่มประเภทอุปกรณ์ใหม่เรียบร้อย');
        setShowSuccessModal(true); // เปิด Success Modal
        setDeviceCategory((prev) => [...prev, res.data]);
        closeAddDeviceCategoryDialog(); // ปิด Dialog เพิ่มประเภทอุปกรณ์
      } else {
        setError('ไม่สามารถเพิ่มประเภทอุปกรณ์ได้');
        setShowErrorModal(true); // เปิด Error Modal
      }
    }
    catch (error) {
      setError('เกิดข้อผิดพลาดขณะเพิ่มประเภทอุปกรณ์');
      setShowErrorModal(true); // เปิด Error Modal
    }
  }

  return (
    <div>
      <CustomNavbar />
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>เพิ่มข้อมูลงาน</Typography>
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

              <Grid item xs={6}>
                <Autocomplete
                    options={deviceCategory}
                    getOptionLabel={(option) => option.name}
                    onChange={handleDeviceCategoryChange}
                    renderInput={(params) => (
                      <TextField 
                          {...params} 
                          label="เลือกประเภทอุปกรณ์" 
                          fullWidth 
                          required
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {params.InputProps.endAdornment}
                                <Button onClick={openAddDeviceCategoryDialog}>เพิ่มประเภทอุปกรณ์</Button>
                              </>
                            )
                          }}
                      />
                    )}
                />
              </Grid>

              <Grid item xs={6}>
                <Autocomplete
                    options={deviceModel}
                    getOptionLabel={(option) => option.name}
                    onChange={handleDeviceModelChange}
                    renderInput={(params) => (
                      <TextField 
                          {...params} 
                          label="เลือกรุ่นอุปกรณ์" 
                          fullWidth 
                          required
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {params.InputProps.endAdornment}
                                <Button onClick={openAddDeviceModelDialog}>เพิ่มรุ่นอุปกรณ์</Button>
                              </>
                            )
                          }}
                      />
                    )}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                    label="รายระเอียดอุปกรณ์"
                    value={taskDeviceDetail}
                    onChange={(e) => setTaskDeviceDetail(e.target.value)}
                    fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="วันที่กำหนดส่งงาน"
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
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }} disabled={loading}>
              {loading ? <CircularProgress size={24} color="inherit"/> : 'บันทึกข้อมูล'}
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

      {/* Add Device Model Dialog */}
      <Dialog open={showAddDeviceModelDialog} onClose={closeAddDeviceModelDialog}>
        <DialogTitle>เพิ่มรุ่นอุปกรณ์ใหม่</DialogTitle>
        <DialogContent>
          <TextField
            label="ชื่อรุ่นอุปกรณ์"
            value={newDeviceModel}
            onChange={(e) => setNewDeviceModel(e.target.value)}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAddDeviceModelDialog} color="error">
            ยกเลิก
          </Button>
          <Button onClick={handleAddDeviceModel} color="primary">
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Device Category Dialog */}
      <Dialog open={showAddDeviceCategoryDialog} onClose={closeAddDeviceCategoryDialog}>
        <DialogTitle>เพิ่มประเภทอุปกรณ์ใหม่</DialogTitle>
        <DialogContent>
          <TextField
            label="ชื่อประเภทอุปกรณ์"
            value={newDeviceCategory}
            onChange={(e) => setNewDeviceCategory(e.target.value)}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAddDeviceCategoryDialog} color="error">
            ยกเลิก
          </Button>
          <Button onClick={handleAddDeviceCategory} color="primary">
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
