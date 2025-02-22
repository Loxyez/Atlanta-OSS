import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../../utils/config';
import CustomNavbar from '../navigation-bar/navbar';
import {
    Container,
    Grid,
    TextField,
    Button,
    Typography,
    CircularProgress,
    Box,
    MenuItem,
} from '@mui/material';
import SuccessModal from '../Modal/SuccessModal';
import ErrorModal from '../Modal/ErrorModel';
import './css/request-form.css'; // Import the CSS file for additional styling

export default function RequestForm() {
    const [userRole, setUserRole] = useState([]);
    const [formData, setFormData] = useState({
        ticketid: '',
        uid: '',
        email: '',
        tel: '',
        role: '',
        reason: '',
        status: 'Open'
    });
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${config.apiBaseUrl}/users/user_roles`);
                setUserRole(res.data);
            } catch (error) {
                console.error('Error fetching the user roles', error);
            }
        };

        fetchData();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const generateTicketID = () => {
        const currentDate = new Date();
        const day = String(currentDate.getDate()).padStart(2, '0');
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const year = String(currentDate.getFullYear()).slice(-2);
        const seconds = String(formData.uid).slice(-2);
        return `PT${day}${month}${year}${seconds}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const ticketid = generateTicketID();
        const newRequest = { ...formData, ticketid };
        setLoading(true);

        if (!formData.uid || !formData.email || !formData.tel || !formData.role) {
            setMessage('กรุณากรอกข้อมูลให้ครบถ้วน');
            setShowErrorModal(true);
            setLoading(false);
            return;
        }

        try {
            const res = await axios.post(`${config.apiBaseUrl}/requests/submit_request_form`, newRequest);
            setFormData({
                ticketid: '',
                uid: '',
                email: '',
                tel: '',
                role: '',
                reason: '',
                status: 'Open'
            });
            setMessage('ระบบได้ทำการบันทึกคำร้องขอไว้เรียบร้อย และจะใช้เวลาพิจารณาภายใน 1-2 วัน');
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Error submitting the request', error);
            setMessage('ไม่สามารถส่งคำร้องขอได้ โปรดลองใหม่');
            setShowErrorModal(true);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSuccessModal = () => {
        setShowSuccessModal(false);
    };

    const handleCloseErrorModal = () => {
        setShowErrorModal(false);
    };

    const roleMapping = {
        "Manager": "ผู้จัดการ",
        "Clerk": "เสมียน",
        "Engineer": "วิศวกร",
        "Trainee": "นักศึกษาฝึกงาน",
        "Developer": "Developer FE/BE"
    };    

    return (
        <Box>
            <CustomNavbar />
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Typography variant="h4" gutterBottom>
                    ส่งคำร้องขอเข้าใช้ระบบ
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                    แบบฟอร์มสำหรับส่งคำร้องขอเข้าใช้ระบบ / ขอสิทธิ์เข้าใช้ระบบชั่วคราวของ OSS
                </Typography>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="รหัสพนักงาน"
                                name="uid"
                                value={formData.uid}
                                onChange={handleChange}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="อีเมล"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="หมายเลขโทรศัพท์"
                                name="tel"
                                value={formData.tel}
                                onChange={handleChange}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                label="ตำแหน่ง"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                fullWidth
                                required
                            >
                                <MenuItem value="">
                                    <em>เลือกตำแหน่ง</em>
                                </MenuItem>
                                {userRole.length > 0 ? (
                                    userRole.map((role) => (
                                        <MenuItem key={role.role_id} value={role.role_name}>
                                            {roleMapping[role.role_name] || role.role_name}
                                        </MenuItem>
                                    ))
                                ) : (
                                    <MenuItem value="">
                                        ไม่พบรายชื่อของตำแหน่ง
                                    </MenuItem>
                                )}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="เหตุผล"
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                fullWidth
                                multiline
                                rows={4}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                disabled={loading}
                                sx={{ padding: '10px' }}
                            >
                                {loading ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    'ส่งคำร้องขอ'
                                )}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Container>
            <SuccessModal show={showSuccessModal} handleClose={handleCloseSuccessModal} message={message} />
            <ErrorModal show={showErrorModal} handleClose={handleCloseErrorModal} message={message} />
        </Box>
    );
}