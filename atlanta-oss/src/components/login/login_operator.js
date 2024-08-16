import React, { useState } from 'react';
import axios from 'axios';
import config from '../../utils/config';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    TextField,
    Button,
    Typography,
    CircularProgress,
    Alert,
    Card,
    CardContent
} from '@mui/material';
import CustomNavbar from '../navigation-bar/navbar';

export default function LoginOperator() {
    const [credentials, setCredentials] = useState({ user_name: '', user_password: ''});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async(e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(`${config.apiBaseUrl}/auth/operator_login`, credentials);
            if (res.data.success){
                localStorage.setItem('token', res.data.token);
                navigate('/create_user_account');
            } else {
                setError(res.data.message);
            }
        } catch (err) {
            setError('Server error, Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <CustomNavbar />
            <Container maxWidth="sm" sx={{ mt: 5 }}>
                <Card>
                    <CardContent>
                        <Typography variant="h4" gutterBottom>
                            Operator Login
                        </Typography>
                        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                            <TextField
                                fullWidth
                                id="user_name"
                                name="user_name"
                                label="User Name"
                                variant="outlined"
                                margin="normal"
                                value={credentials.user_name}
                                onChange={handleChange}
                                required
                            />
                            <TextField
                                fullWidth
                                id="user_password"
                                name="user_password"
                                label="Password"
                                type="password"
                                variant="outlined"
                                margin="normal"
                                value={credentials.user_password}
                                onChange={handleChange}
                                required
                            />
                            {error && (
                                <Alert severity="error" sx={{ mt: 2 }}>
                                    {error}
                                </Alert>
                            )}
                            <Box sx={{ mt: 3, position: 'relative' }}>
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    disabled={loading}
                                    sx={{ padding: '10px 0' }}
                                >
                                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
                                </Button>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Container>
        </div>
    )
}







