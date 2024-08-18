import React, { useState } from 'react';
import {
    TextField,
    Button,
    Box,
    Grid,
    Typography,
    Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import config from '../utils/config';
import CustomNavbar from '../components/navigation-bar/navbar';

const FormContainer = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    marginTop: theme.spacing(4),
}));

const StyledButton = styled(Button)(({ theme }) => ({
    marginTop: theme.spacing(4),
    padding: theme.spacing(1.5),
    fontWeight: 'bold',
}));

export default function CreateItem() {
    const [formData, setFormData] = useState({
        item_name: '',
        item_category: '',
        item_description: '',
        item_prices: '',
        item_pstid: `PSI${Math.floor(10000 + Math.random() * 90000)}`, // Generate unique ID
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        try {
            const response = await axios.post(`${config.apiBaseUrl}/items/create_item`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.status === 201) {
                setFormData({
                    item_name: '',
                    item_category: '',
                    item_description: '',
                    item_prices: '',
                    item_pstid: `PSI${Math.floor(10000 + Math.random() * 90000)}`, // Reset ID
                });
            }
        } catch (error) {
            console.error('Error creating item:', error);
        }
    };

    return (
        <div>
            <CustomNavbar />
            <Box mt={4} p={3} bgcolor="white" borderRadius={2} boxShadow={3}>
                <Typography variant="h5" gutterBottom>
                    เพิ่มสินค้า
                </Typography>
                <FormContainer elevation={3}>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="ชื่อสินค้า"
                                    name="item_name"
                                    value={formData.item_name}
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="หมวดหมู่"
                                    name="item_category"
                                    value={formData.item_category}
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="คำอธิบาย"
                                    name="item_description"
                                    value={formData.item_description}
                                    onChange={handleChange}
                                    multiline
                                    rows={4}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="ราคาสินค้า"
                                    name="item_prices"
                                    value={formData.item_prices}
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="รหัสสินค้า"
                                    name="item_pstid"
                                    value={formData.item_pstid}
                                    onChange={handleChange}
                                    variant="outlined"
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <StyledButton fullWidth type="submit" variant="contained" color="primary">
                                    Save Item
                                </StyledButton>
                            </Grid>
                        </Grid>
                    </form>
                </FormContainer>
            </Box>
        </div>
    );
}
