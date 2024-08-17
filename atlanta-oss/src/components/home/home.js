import React from 'react';
import { Container, Typography, Box, Button, Grid, Paper } from '@mui/material';
import CustomNavbar from '../navigation-bar/navbar';
import { useNavigate } from "react-router-dom";

export default function Home() {
    const navigate = useNavigate();

    return (
        <div>
            <CustomNavbar />
            <Container maxWidth="lg">
                <Box sx={{ flexGrow: 1, mt: 5 }}>
                    <Typography variant="h3" align="center" gutterBottom>
                        Atlanta-OSS & PST-OSS
                    </Typography>
                    <Typography variant="h6" align="center" gutterBottom>
                        ระบบการจัดการข้อมูลและส่งคำร้องขอ
                    </Typography>
                    <Grid container spacing={3} justifyContent="center">
                        <Grid item xs={12} sm={6} md={4}>
                            <Paper elevation={3} sx={{ padding: 2, maxWidth: 350, mx: "auto", textAlign: 'center' }}>
                                <Typography variant="h6" gutterBottom>
                                    ขอสิทธิ์เข้าใช้ระบบ One Stop Service
                                </Typography>
                                <Button onClick={() => { navigate('/request_form') }} variant="contained" color="primary" sx={{ mt: 2, width: '100%' }}>
                                    ส่งคำร้องขอ
                                </Button>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Paper elevation={3} sx={{ padding: 2, maxWidth: 350, mx: "auto", textAlign: 'center' }}>
                                <Typography variant="h6" gutterBottom>
                                    ตรวจสอบสิทธ์วันลาต่างๆ
                                </Typography>
                                <Button onClick={() => { navigate('/login') }} variant="contained" color="secondary" sx={{ mt: 2, width: '100%' }}>
                                    ตรวจสอบสิทธิ์
                                </Button>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Paper elevation={3} sx={{ padding: 2, maxWidth: 350, mx: "auto", textAlign: 'center' }}>
                                <Typography variant="h6" gutterBottom>
                                    ส่งคำร้องขอวันลา
                                </Typography>
                                <Button onClick={() => { navigate('/login') }} variant="contained" color="success" sx={{ mt: 2, width: '100%' }}>
                                    ส่งคำร้องขอ
                                </Button>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            </Container>
        </div>
    );
}
