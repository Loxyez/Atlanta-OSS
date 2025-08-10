import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import CustomNavbar from '../navigation-bar/navbar';
import {Container, Typography, Box, Button, Grid, Paper} from '@mui/material';
import {jwtDecode} from 'jwt-decode';
import {CheckCircle, AddCircle, AttachMoney, CalendarMonth, AssignmentInd} from '@mui/icons-material';

export default function LandingPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const userDetail = {
          name: decodedToken.user_name,
          role: decodedToken.user_role,
        };
        setUser(userDetail);
      } catch (err) {
        console.error('Failed to decode token', err);
      }
    }
  }, []);

  return (
    <div>
      <CustomNavbar user={user} />
      <Container maxWidth='lg'>
        <Box sx={{flexGrow: 1, mt: 5}}>
          <Typography variant='h3' align='center' gutterBottom>
            ยินดีต้อนรับ {user ? user.name : ''}
          </Typography>
          <Typography variant='h6' align='centeer' gutterBottom>
            โปรดเลือกชนิด เมนู ที่ท่านต้องการใช้งาน
          </Typography>
          <Grid container spacing={3} justifyContent='center'>
            <Grid item xs={12} sm={6} md={4}>
              <Paper
                elevation={3}
                sx={{
                  padding: 2,
                  maxWidth: 350,
                  mx: 'auto',
                  textAlign: 'center',
                }}
              >
                <Typography variant='h6' gutterBottom>
                  ตรวจสอบสิทธิ์วันลา
                </Typography>
                <Button
                  onClick={() => {
                    navigate('/request_form');
                  }}
                  variant='contained'
                  color='primary'
                  sx={{mt: 2, width: '100%'}}
                  startIcon={<CheckCircle />}
                >
                  ไปที่หน้าตรวจสอบ/วันลา
                </Button>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper
                elevation={3}
                sx={{
                  padding: 2,
                  maxWidth: 350,
                  mx: 'auto',
                  textAlign: 'center',
                }}
              >
                <Typography variant='h6' gutterBottom>
                  ยื่นคำร้องขอวันลา
                </Typography>
                <Button
                  onClick={() => {
                    navigate('/request_leave');
                  }}
                  variant='contained'
                  color='primary'
                  sx={{mt: 2, width: '100%'}}
                  startIcon={<AddCircle />}
                >
                  ไปที่หน้ายื่นคำร้องขอวันลา
                </Button>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper
                elevation={3}
                sx={{
                  padding: 2,
                  maxWidth: 350,
                  mx: 'auto',
                  textAlign: 'center',
                }}
              >
                <Typography variant='h6' gutterBottom>
                  ยื่นคำร้องขอเอกสารต่างๆ
                </Typography>
                <Button
                  onClick={() => {
                    navigate('/request_form');
                  }}
                  variant='contained'
                  color='primary'
                  sx={{mt: 2, width: '100%'}}
                  disabled
                  startIcon={<AddCircle />}
                >
                  ไปที่หน้าขอเอกสาร
                </Button>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper
                elevation={3}
                sx={{
                  padding: 2,
                  maxWidth: 350,
                  mx: 'auto',
                  textAlign: 'center',
                }}
              >
                <Typography variant='h6' gutterBottom>
                  ตรวจสอบสถานะเงินเดือน
                </Typography>
                <Button
                  onClick={() => {
                    navigate('/request_form');
                  }}
                  variant='contained'
                  color='primary'
                  disabled
                  sx={{mt: 2, width: '100%'}}
                  startIcon={<AttachMoney />}
                >
                  ไปที่หน้าตรวจสอบสถานะเงินเดือน
                </Button>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper
                elevation={3}
                sx={{
                  padding: 2,
                  maxWidth: 350,
                  mx: 'auto',
                  textAlign: 'center',
                }}
              >
                <Typography variant='h6' gutterBottom>
                  ยื่นเอกสารประกอบวันลา
                </Typography>
                <Button
                  onClick={() => {
                    navigate('/request_form');
                  }}
                  variant='contained'
                  color='primary'
                  sx={{mt: 2, width: '100%'}}
                  disabled
                  startIcon={<CalendarMonth />}
                >
                  ไปที่หน้ายื่นเอกสารประกอบวันลา
                </Button>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper
                elevation={3}
                sx={{
                  padding: 2,
                  maxWidth: 350,
                  mx: 'auto',
                  textAlign: 'center',
                }}
              >
                <Typography variant='h6' gutterBottom>
                  จัดการงาน ทั้งหมด / เฉพาะฉัน
                </Typography>
                <Button
                  onClick={() => {
                    navigate('/task_management');
                  }}
                  variant='contained'
                  color='primary'
                  sx={{mt: 2, width: '100%'}}
                  startIcon={<AssignmentInd />}
                >
                  ไปที่หน้าจัดการงาน
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </div>
  );
}
