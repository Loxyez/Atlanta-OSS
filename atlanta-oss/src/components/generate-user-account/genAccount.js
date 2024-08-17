import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import config from '../../utils/config';
import { Spinner, Tab } from 'react-bootstrap';
import CustomNavbar from '../navigation-bar/navbar';
import SuccessModal from '../Modal/SuccessModal';
import ErrorModal from '../Modal/ErrorModel';
import {
    Box,
    Button,
    Container,
    CircularProgress,
    Grid,
    MenuItem,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TextField,
    Typography,
    Card,
    CardContent,
    Divider,
    InputLabel
} from '@mui/material';
import { jwtDecode } from 'jwt-decode';

export default function CreateAccount() {
    const [request, setRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [requestAccounts, setRequestAccount] = useState([]);
    const [user, setUser] = useState({
        user_name: '',
        user_password: '',
        user_role: '',
        user_uid: '',
    });
    const [userDetail, setUserDetail] = useState(null);
    const [userRole, setUserRole] = useState([]);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const [ticketID, setTicketID] = useState('');
    const [status, setStatus] = useState('');
    const [loadingAccount, setLoadingAccount] = useState(false);
    const [loadingOther, setLoadingOther] = useState(false);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    useEffect(() => {

        const token = localStorage.getItem('token') || sessionStorage.getItem('token');

        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                const userData = {
                    name: decodedToken.user_name,
                    role: decodedToken.user_role
                };
                setUserDetail(userData);
            } catch (err) {
                console.error('Failed to decode token', err);
            }
        }

        fetchDataRequest();
        fetchDataRoles();
        fetchDataAccount();
    }, []);

    const fetchDataRequest = async () => {
        const token = localStorage.getItem('token');
        try {
            setLoadingOther(true);
            const res = await axios.get(`${config.apiBaseUrl}/requests/open_tickets`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (Array.isArray(res.data)) {
                setRequests(res.data);
            } else {
                setRequests([]);
            }
        } catch (error) {
            console.error('Error fetching the request data', error);
            setRequests([]);
        } finally {
            setLoadingOther(false);
        }
    };

    const fetchDataRoles = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get(`${config.apiBaseUrl}/users/user_roles`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setUserRole(res.data);
        } catch (error) {
            console.error('Error fetching the user roles',  error);
        }
    };

    const fetchDataAccount = async () => {
        const token = localStorage.getItem('token');
        try {
            setLoadingAccount(true);
            const res = await axios.get(`${config.apiBaseUrl}/users/user_accounts`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (Array.isArray(res.data)) {
                setRequestAccount(res.data);
            } else {
                setRequestAccount([]);
            }
        } catch (error) {
            console.error('Error fetching the request data', error);
            setRequestAccount([]);
        } finally {
            setLoadingAccount(false);
        }
    }

    const handleTicketChange = async (e) => {
        const selectedTicketID = e.target.value;
        setTicketID(selectedTicketID);
        const token = localStorage.getItem('token');
    
        if (selectedTicketID !== '-' && selectedTicketID !== 'N/A') {
          try {
            const res = await axios.get(`${config.apiBaseUrl}/requests/${selectedTicketID}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setSelectedRequest(res.data);
          } catch (error) {
            console.error('Error fetching the selected request details', error);
          }
        } else {
          setSelectedRequest(null);
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            const res = await axios.post(`${config.apiBaseUrl}/users/create_user`, user, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data && res.data.ticketid && res.data.mid) {
                setRequests([...request, res.data]);
            }

                setMessage('User created successfully');
                setUser({
                user_name: '',
                user_password: '',
                user_role: '',
                user_uid: '',
            });

            setTicketID('');
            setUser({
                user_name: '',
                user_password: '',
                user_role: '',
                user_uid: '',
            })
            setSelectedRequest(null);
            setShowSuccessModal(true);
            fetchDataRequest();
            fetchDataAccount();
        } catch (err) {
            setMessage('Error creating user');
            setShowErrorModal(true);
        } finally {
            setLoading(false);
        }
    };
    
    const handleStatusChange = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            await axios.put(
            `${config.apiBaseUrl}/requests/${ticketID}/status`,{ status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage('Request status updated successfully');
            setShowSuccessModal(true);
            setSelectedRequest({ ...selectedRequest, status });
            fetchDataRequest();
        } catch (err) {
            setMessage('Error updating request status.');
            setShowErrorModal(true);
        } finally {
            setLoading(false);
        }
    };
    
    const sendEmail = async (email, user_name, user_password) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${config.apiBaseUrl}/users/send_email`, { email, user_name, user_password }, { 
                    headers: { Authorization: `Bearer ${token}` } 
                }
            );

            if (res.data.success) {
            setMessage('Email sent successfully');
            setShowSuccessModal(true);
            } else {
            setMessage('Failed to send email');
            setShowErrorModal(true);
            }
        } catch (error) {
            setMessage('Failed to send email');
            setShowErrorModal(true);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    
    const handleCloseSuccessModal = () => {
        setShowSuccessModal(false);
    };

    const handleCloseErrorModal = () => {
        setShowErrorModal(false);
    };

    return (
        <div>
            <CustomNavbar user={userDetail} />
            <Container maxWidth="lg" sx={{ mt: 5 }}>
                <Typography variant="h4" gutterBottom>
                    Create User Account
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                    For operator only - This operation allows you to generate a user account for access to the one-stop service.
                </Typography>
            <Card mt={3} mb={2}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Open Tickets
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Ticket ID</TableCell>
                                    <TableCell>UID</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Telephone</TableCell>
                                    <TableCell>Role</TableCell>
                                    <TableCell>Reason</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Created</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loadingOther ? (
                                    <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        <CircularProgress />
                                    </TableCell>
                                    </TableRow>
                                ) : (
                                    request.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                                    <TableRow key={row.ticketid}>
                                        <TableCell>{row.ticketid}</TableCell>
                                        <TableCell>{row.uid}</TableCell>
                                        <TableCell>{row.email}</TableCell>
                                        <TableCell>{row.tel}</TableCell>
                                        <TableCell>{row.role}</TableCell>
                                        <TableCell>{row.reason}</TableCell>
                                        <TableCell>{row.status}</TableCell>
                                        <TableCell>{new Date(row.created_at).toLocaleString()}</TableCell>
                                    </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={request.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Ticket Detail
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <form>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <InputLabel style={{ color: 'black' }}>Select Ticket ID</InputLabel>
                                <Select
                                    fullWidth
                                    value={ticketID}
                                    onChange={handleTicketChange}
                                    displayEmpty
                                >
                                    <MenuItem value="-">-</MenuItem>
                                    {request.length > 0 ? (
                                    request.map((val) => (
                                        <MenuItem key={val.mid} value={val.ticketid}>
                                        {val.ticketid}
                                        </MenuItem>
                                    ))
                                    ) : (
                                    <MenuItem value="-">No data has been found</MenuItem>
                                    )}
                                </Select>
                            </Grid>
                        </Grid>
                        {selectedRequest && (
                            <Box mt={2}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <InputLabel style={{ color: 'black' }}>Email</InputLabel>
                                        <TextField
                                            fullWidth
                                            value={selectedRequest.email}
                                            readOnly
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <InputLabel style={{ color: 'black' }}>Telephone</InputLabel>
                                        <TextField
                                            fullWidth
                                            value={selectedRequest.tel}
                                            readOnly
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <InputLabel style={{ color: 'black' }}>Role</InputLabel>
                                        <TextField
                                            fullWidth
                                            value={selectedRequest.role}
                                            readOnly
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <InputLabel style={{ color: 'black' }}>Ticket Status</InputLabel>
                                        <Select
                                            fullWidth
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                            displayEmpty
                                        >
                                            <MenuItem value="-">-</MenuItem>
                                            <MenuItem value="Close">Close</MenuItem>
                                            <MenuItem value="Re-Open">Re-Open</MenuItem>
                                        </Select>
                                    </Grid>
                                </Grid>
                                <Box mt={2}>
                                    <InputLabel style={{ color: 'black' }}>Reason</InputLabel>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={4}
                                        value={selectedRequest?.reason || ''}
                                        InputProps={{
                                            readOnly: true,
                                        }}
                                    />
                                </Box>
                                <Box mt={2} textAlign="right">
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleStatusChange}
                                        disabled={loading}
                                    >
                                    {loading ? <CircularProgress size={24} /> : 'Update Status'}
                                    </Button>
                                </Box>
                            </Box>
                        )}
                    </form>
                </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Create User Account
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <InputLabel style={{ color: 'black' }}>Username</InputLabel>
                                <TextField
                                    fullWidth
                                    name="user_name"
                                    value={user.user_name}
                                    onChange={(e) => setUser({ ...user, user_name: e.target.value })}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <InputLabel style={{ color: 'black' }}>Password</InputLabel>
                                <TextField
                                    fullWidth
                                    name="user_password"
                                    type="password"
                                    value={user.user_password}
                                    onChange={(e) => setUser({ ...user, user_password: e.target.value })}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <InputLabel style={{ color: 'black' }}>Role</InputLabel>
                                <Select
                                    fullWidth
                                    value={user.user_role}
                                    onChange={(e) => setUser({ ...user, user_role: e.target.value })}
                                    displayEmpty
                                    required
                                >
                                        <MenuItem value="-">-</MenuItem>
                                {userRole.length > 0 ? (
                                    userRole.map((val) => (
                                        <MenuItem key={val.role_id} value={val.role_name}>
                                        {val.role_name}
                                        </MenuItem>
                                    ))
                                ) : (
                                    <MenuItem value="-">No roles available</MenuItem>
                                )}
                                </Select>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <InputLabel style={{ color: 'black' }}>USER UID</InputLabel>
                                <TextField
                                    fullWidth
                                    label="User UID"
                                    name="user_uid"
                                    value={user.user_uid}
                                    onChange={(e) => setUser({ ...user, user_uid: e.target.value })}
                                    required
                                />
                            </Grid>
                        </Grid>
                        <Box mt={2} textAlign="right">
                            <Button variant="contained" color="success" type="submit" disabled={loading}>
                                {loading ? <CircularProgress size={24} /> : 'Create User'}
                            </Button>
                        </Box>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        User Accounts
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>UID</TableCell>
                                    <TableCell>Username</TableCell>
                                    <TableCell>Role</TableCell>
                                    <TableCell>Created</TableCell>
                                    <TableCell>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loadingAccount ? (
                                    <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        <CircularProgress />
                                    </TableCell>
                                    </TableRow>
                                ) : (
                                    requestAccounts
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((row) => (
                                        <TableRow key={row.user_uid}>
                                        <TableCell>{row.user_uid}</TableCell>
                                        <TableCell>{row.user_name}</TableCell>
                                        <TableCell>{row.user_role}</TableCell>
                                        <TableCell>{new Date(row.created_at).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Button
                                            variant="contained"
                                            onClick={() =>
                                                sendEmail(row.user_name, row.user_name, row.n_user_password)
                                            }
                                            >
                                            Send Email
                                            </Button>
                                        </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={requestAccounts.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </CardContent>
            </Card>
            </Container>
            
            <SuccessModal show={showSuccessModal} handleClose={handleCloseSuccessModal} message={message} />
            <ErrorModal show={showErrorModal} handleClose={handleCloseErrorModal} message={message} />
        </div>
    );
}