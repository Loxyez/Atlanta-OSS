import React, { useEffect, useState } from 'react';
import { 
    TextField, 
    Box,
    Grid,
    Typography,
    Paper,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { jwtDecode } from 'jwt-decode'; 
import CustomNavbar from '../navigation-bar/navbar';
import axios from 'axios';
import config from '../../utils/config';

const FormContainer = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    marginTop: theme.spacing(4),
    maxWidth: '800px',
    margin: 'auto',
}));

export default function EditUserAccount() {
    const [formData, setFormData] = useState({
        user_name: '',
        staff_name: '',
        staff_nickname: '',
        staff_phone: '',
        staff_address: '',
        staff_cardid: '',
        staff_lineid: '',
        staff_econtract: '',
        staff_detail: '',
        staff_position: ''
    });

    // Loading status to manage the loading state during API calls
    const [loading, setLoading] = useState(true);

    // State สำหรับจัดการ Dialog success และ fail
    const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
    const [openFailDialog, setOpenFailDialog] = useState(false);

    useEffect(() => {
        fetchLoggedInUserData();
        fetchStaffData(); // Fetch staff data on mount
    }, []);

    // ดึงข้อมูล user_name ของ user ที่ล็อกอินอยู่
    const fetchLoggedInUserData = () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setFormData((prevData) => ({
                    ...prevData,
                    user_name: decoded.user_name || 'User', // Set the decoded user_name
                }));
            } catch (error) {
                console.error('Error decoding token', error);
            }
        }
    };

    // ดึงข้อมูลพนักงานจาก staff_details โดยใช้ token ของ user ที่ login
    const fetchStaffData = async () => {
        setLoading(true); // Begin loading state
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await axios.get(`${config.apiBaseUrl}/staffs/get_logged_in_staff`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data) {
                setFormData((prevData) => ({
                    ...prevData,
                    staff_name: response.data.staff_name,
                    staff_nickname: response.data.staff_nickname,
                    staff_phone: response.data.staff_phone,
                    staff_address: response.data.staff_address,
                    staff_cardid: response.data.staff_cardid,
                    staff_lineid: response.data.staff_lineid,
                    staff_econtract: response.data.staff_econtract,
                    staff_detail: response.data.staff_detail,
                    staff_position: response.data.staff_position,
                }));
            }
        } catch (error) {
            console.error('Error fetching staff data', error);
        } finally {
            setLoading(false); // Stop loading state once done
        }
    };

    // ฟังก์ชันที่ใช้เมื่อข้อมูลในฟอร์มถูกเปลี่ยนแปลง
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // ปรับปรุง handleSubmit เพื่อใช้กับ Dialog
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await axios.put(`${config.apiBaseUrl}/staffs/update_specific_staff_details`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.status === 200) {
                setOpenSuccessDialog(true); // เปิด dialog success
            }
        } catch (error) {
            setOpenFailDialog(true); // เปิด dialog fail เมื่อเกิดข้อผิดพลาด
            console.error('Error updating staff information', error);
        }
    };

    if (loading) {
        return <Typography variant="h6">กำลังโหลดข้อมูล...</Typography>;
    }

    return (
        <div>
            <CustomNavbar />
            <Box mt={4} p={3} bgcolor="white" borderRadius={2} boxShadow={3}>
                <Typography variant="h5" gutterBottom>
                    แก้ไขข้อมูลผู้ใช้งาน
                </Typography>
                <FormContainer elevation={3}>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="ชื่อผู้ใช้งาน"
                                    name="user_name"
                                    value={formData.user_name}
                                    variant="outlined"
                                    disabled // ไม่สามารถแก้ไขได้
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="ชื่อพนักงาน"
                                    name="staff_name"
                                    value={formData.staff_name}
                                    onChange={handleChange}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="ชื่อเล่นพนักงาน"
                                    name="staff_nickname"
                                    value={formData.staff_nickname}
                                    onChange={handleChange}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="เบอร์โทรศัพท์"
                                    name="staff_phone"
                                    value={formData.staff_phone}
                                    onChange={handleChange}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="ที่อยู่"
                                    name="staff_address"
                                    value={formData.staff_address}
                                    onChange={handleChange}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="รหัสบัตรพนักงาน"
                                    name="staff_cardid"
                                    value={formData.staff_cardid}
                                    variant="outlined"
                                    disabled // ไม่สามารถแก้ไขได้
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Line ID"
                                    name="staff_lineid"
                                    value={formData.staff_lineid}
                                    onChange={handleChange}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="E-contract"
                                    name="staff_econtract"
                                    value={formData.staff_econtract}
                                    onChange={handleChange}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="รายละเอียด"
                                    name="staff_detail"
                                    value={formData.staff_detail}
                                    onChange={handleChange}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="ตำแหน่ง"
                                    name="staff_position"
                                    value={formData.staff_position}
                                    variant="outlined"
                                    disabled // ไม่สามารถแก้ไขได้
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button type="submit" variant="contained" color="primary">
                                    บันทึกการเปลี่ยนแปลง
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </FormContainer>
            </Box>

            {/* Success Dialog */}
            <Dialog open={openSuccessDialog} onClose={() => setOpenSuccessDialog(false)}>
                <DialogTitle>การเปลี่ยนแปลงสำเร็จ</DialogTitle>
                <DialogContent>
                    <Typography>ข้อมูลพนักงานได้รับการอัปเดตเรียบร้อยแล้ว!</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenSuccessDialog(false)} color="primary">
                        ปิด
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Fail Dialog */}
            <Dialog open={openFailDialog} onClose={() => setOpenFailDialog(false)}>
                <DialogTitle>การเปลี่ยนแปลงล้มเหลว</DialogTitle>
                <DialogContent>
                    <Typography>เกิดข้อผิดพลาดในการอัปเดตข้อมูลพนักงาน</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenFailDialog(false)} color="primary">
                        ปิด
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
