import React, {useEffect, useState} from 'react';
import {
  TextField,
  Button,
  Box,
  Grid,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  MenuItem,
} from '@mui/material';
import {styled} from '@mui/material/styles';
import axios from 'axios';
import config from '../../utils/config';
import CustomNavbar from '../navigation-bar/navbar';

const FormContainer = styled(Paper)(({theme}) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
}));

const StyledButton = styled(Button)(({theme}) => ({
  marginTop: theme.spacing(4),
  padding: theme.spacing(1.5),
  fontWeight: 'bold',
}));

export default function CraeteStaff() {
  const [formData, setFormData] = useState({
    staff_name: '',
    staff_nickname: '',
    staff_phone: '',
    staff_position: '',
    staff_address: '',
    staff_cardid: `PST${Math.floor(10000 + Math.random() * 9000)}`, // Generate unique ID starting with PST
    staff_lineid: '',
    staff_econtract: '',
    staff_detail: '',
  });
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);
  const [userRole, setUserRole] = useState([]);

  useEffect(() => {
    fetchDataRoles();
  }, []);

  const fetchDataRoles = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    try {
      const res = await axios.get(`${config.apiBaseUrl}/users/user_roles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserRole(res.data);
    } catch (error) {
      console.error('Error fetching the user roles', error);
    }
  };

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    e.preventDefault();
    try {
      const response = await axios.post(`${config.apiBaseUrl}/staffs/create_staff`, formData, {
        headers: {Authorization: `Bearer ${token}`},
      });
      if (response.status === 201) {
        setOpenSuccess(true);
        setFormData({
          staff_name: '',
          staff_nickname: '',
          staff_phone: '',
          staff_position: '',
          staff_address: '',
          staff_cardid: `PST${Math.floor(10000 + Math.random() * 90000)}`, // Generate unique ID starting with PST
          staff_lineid: '',
          staff_econtract: '',
          staff_detail: '',
        });
      }
    } catch (error) {
      setOpenError(true);
    }
  };

  const roleMapping = {
    Manager: 'ผู้จัดการ',
    Clerk: 'เสมียน',
    Engineer: 'ช่าง',
    Trainee: 'นักศึกษาฝึกงาน',
    Developer: 'Developer FE/BE',
  };

  return (
    <div>
      <CustomNavbar />
      <Box mt={4} p={3} bgcolor='white' borderRadius={2} boxShadow={3}>
        <Typography variant='h5' gutterBottom>
          เพิ่มข้อมูลพนักงาน
        </Typography>
        <FormContainer elevation={3}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='ชื่อเต็ม'
                  name='staff_name'
                  value={formData.staff_name}
                  onChange={handleChange}
                  required
                  variant='outlined'
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='ชื่อเล่น'
                  name='staff_nickname'
                  value={formData.staff_nickname}
                  onChange={handleChange}
                  required
                  variant='outlined'
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='เบอร์โทรศัพท์'
                  name='staff_phone'
                  value={formData.staff_phone}
                  onChange={handleChange}
                  required
                  variant='outlined'
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label='ตำแหน่ง'
                  name='staff_position'
                  value={formData.staff_position}
                  onChange={handleChange}
                  fullWidth
                  required
                >
                  <MenuItem value=''>
                    <em>เลือกตำแหน่ง</em>
                  </MenuItem>
                  {userRole.length > 0 ? (
                    userRole.map((role) => (
                      <MenuItem key={role.role_id} value={role.role_name}>
                        {roleMapping[role.role_name] || role.role_name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value=''>ไม่พบรายชื่อของตำแหน่ง</MenuItem>
                  )}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='ที่อยู่'
                  name='staff_address'
                  value={formData.staff_address}
                  onChange={handleChange}
                  required
                  variant='outlined'
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='Card ID'
                  name='staff_cardid'
                  value={formData.staff_cardid}
                  onChange={handleChange}
                  variant='outlined'
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='LINE ID'
                  name='staff_lineid'
                  value={formData.staff_lineid}
                  onChange={handleChange}
                  variant='outlined'
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='ข้อมูลการติดต่อฉุกเฉิน'
                  name='staff_econtract'
                  value={formData.staff_econtract}
                  onChange={handleChange}
                  variant='outlined'
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label='รายละเอียดเพิ่มเติม'
                  name='staff_detail'
                  value={formData.staff_detail}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  variant='outlined'
                />
              </Grid>
              <Grid item xs={12}>
                <StyledButton fullWidth type='submit' variant='contained' color='primary'>
                  บันทึกข้อมูล
                </StyledButton>
              </Grid>
            </Grid>
          </form>
        </FormContainer>
      </Box>

      <Dialog open={openSuccess} onClose={() => setOpenSuccess(false)}>
        <DialogTitle>Success</DialogTitle>
        <DialogContent>
          <DialogContentText>Staff details have been successfully added.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSuccess(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openError} onClose={() => setOpenError(false)}>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <DialogContentText>There was an error adding staff details. Please try again.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenError(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
