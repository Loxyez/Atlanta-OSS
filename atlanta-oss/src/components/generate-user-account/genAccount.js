import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../../utils/config';
import { Spinner } from 'react-bootstrap';
import CustomNavbar from '../navigation-bar/navbar';
import SuccessModal from '../Modal/SuccessModal';
import ErrorModal from '../Modal/ErrorModel';

export default function CreateAccount() {
    const [request, setRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [user, setUser] = useState({
        user_name: '',
        user_password: '',
        user_role: '',
    });
    const [userRole, setUserRole] = useState([]);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const [ticketID, setTicketID] = useState('');
    const [status, setStatus] = useState('');

    useEffect(() => {
        const fetchDataRequest = async () => {
            try {
                const res = await axios.get(`${config.apiBaseUrl}/requests_form`);
                if (Array.isArray(res.data)) {
                    setRequests(res.data);
                } else {
                    setRequests([]);
                }
            } catch (error) {
                console.error('Error fetching the request data', error);
                setRequests([]);
            }
        };

        const fetchDataRoles = async () => {
            try {
                const res = await axios.get(`${config.apiBaseUrl}/user_roles`);
                setUserRole(res.data);
            } catch (error) {
                console.error('Error fetching the user roles',  error);
            }
        };

        fetchDataRequest();
        fetchDataRoles();
    }, []);

    const handleChange = (e) => {
        setUser({...user, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(false);
        const token = localStorage.getItem('token');
        if (!token) {
            setMessage('User is not authenticated');
            showErrorModal(true);
            return;
        }
        try {
            const res = await axios.post(`${config.apiBaseUrl}/create_user`, user, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.data && res.data.ticketid && res.data.mid) {
                setRequests([...request, res.data]);
            }

            setMessage('User created successfully');
            setUser({
                user_name: '',
                user_password: '',
                user_role: ''
            });
            setTicketID('');
            setSelectedRequest(null);
            setShowSuccessModal(true);
        } catch (err) {
            setMessage('Error creating user', err);
            setShowErrorModal(true);
        } finally {
            setLoading(false);
        }
    };

    const handleTicketChange = async (e) => {
        const ticketID = e.target.value;
        setTicketID(ticketID);
        if (ticketID !== '-' && ticketID !== 'N/A') {
            try {
                const res = await axios.get(`${config.apiBaseUrl}/request_form/${ticketID}`);
                setSelectedRequest(res.data);
            } catch (error) {
                console.error('Error fetching the selected request details', error);
            }
        } else {
            setSelectedRequest(null);
        }
    };

    const handleStatusChange = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
            setMessage('User is not authenticated');
            return;
        }
        try {
            const res = await axios.put(`${config.apiBaseUrl}/request_form/${ticketID}/status`, {status}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setMessage('Request status updated successfully');
            setShowSuccessModal(true);
            setSelectedRequest({ ...selectedRequest, status });
        } catch (err) {
            setMessage('Error updating request status.');
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

    return (
        <div>
            <CustomNavbar/>
            <div className='container mt-5'>
                <h1>Create User Account</h1>
                <p>For operator only this operation allow generate user account for access the one stop service.</p>
                <hr/>
                <h5>Ticket Detail</h5>
                <form>
                    <div className='form-group row'>
                        <div className='col-sm-6 mb-3 mb-sm-0'>
                        <label htmlFor='TicketID'>Select Ticket</label>
                            <select className='form-select' id='TicketID' name="TicketID" onChange={handleTicketChange}>
                                <option value="-">-</option>
                                {
                                    request.length > 0 ? (
                                        request.map((val, key) => (
                                            val.ticketid ? (
                                                <option key={val.mid} value={val.ticketid}>{val.ticketid}</option>
                                            ) : (
                                                <option key={val.mid} value="N/A">No Ticket ID Load yet</option>
                                            )
                                        ))
                                    ) : (
                                        <option value="-">No data has been found</option>
                                    )
                                }
                            </select>
                        </div>
                    </div>
                    {selectedRequest && (
                        <div>
                            <div className='form-group row'>
                                <div className='col-sm-6 mb-3 mb-sm-0'>
                                    <label htmlFor='email'>Email</label>
                                    <input
                                        type='text'
                                        className='form-control'
                                        id='email'
                                        name='email'
                                        value={selectedRequest.email}
                                        readOnly
                                    />
                                </div>
                                <div className='col-sm-6'>
                                    <label htmlFor='tel'>Telephone</label>
                                    <input
                                        type='text'
                                        className='form-control'
                                        id='tel'
                                        name='tel'
                                        value={selectedRequest.tel}
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div className='form-group row'>
                                <div className='col-sm-6 mb-3 mb-sm-0'>
                                    <label htmlFor='role'>Role</label>
                                    <input
                                        type='text'
                                        className='form-control read-only'
                                        id='role'
                                        name='role'
                                        value={selectedRequest.role}
                                        readOnly
                                    />
                                </div>
                                <div className='col-sm-6'>
                                    <label htmlFor='status'>Status</label>
                                    <select
                                        className='form-select'
                                        id='status'
                                        name='status'
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                    >
                                        <option value="-">-</option>
                                        <option value="Close">Close</option>
                                        <option value="Re-Open">Re-Open</option>
                                    </select>
                                </div>
                            </div>
                            <div className='form-group row'>
                                <div className='col-sm-12'>
                                    <label htmlFor='reason'>Reason</label>
                                    <textarea
                                        className='form-control read-only'
                                        id='reason'
                                        name='reason'
                                        value={selectedRequest.reason}
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div className='col-sm-12 mt-3'>
                                <button type='submit' className='btn btn-primary' disabled={loading} onClick={handleStatusChange}>
                                    {loading ? <Spinner as='span' animation='border' size='sm' role='status' aria-hidden='true'/> : 'Update Status'}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
                <hr/>
                <h5>Create User Account</h5>
                <form onSubmit={handleSubmit}>
                    <div className='form-group row'>
                        <div className='col-sm-6 mb-3 mb-sm-0'>
                            <label htmlFor='user_name'>Username</label>
                            <input
                                type='text'
                                className='form-control'
                                id='user_name'
                                name='user_name'
                                value={user.user_name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className='col-sm-6'>
                            <label htmlFor='user_password'>Password</label>
                            <input
                                type='password'
                                className='form-control'
                                id='user_password'
                                name='user_password'
                                value={user.user_password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div className='form-group row'>
                        <div className='col-sm-6 mb-3 mb-sm-0'>
                            <label htmlFor='user_role'>User Role</label>
                            <select className='form-select' id="RoleCategory" name="RoleCategory" onChange={(e) => {
                                setUser({ ...user, user_role: e.target.value });
                            }} required>
                                <option value="-">-</option>
                                {userRole.length > 0 ? (
                                    userRole.map((val, key) => (
                                        <option key={val.role_id} value={val.role_name}>{val.role_name}</option>
                                    ))
                                ) : (
                                    <option value="-">ไม่พบรายชื่อของตำแหน่ง</option>
                                )}
                            </select>
                        </div>
                    </div>
                    <hr/>
                    <button type='submit' className='btn btn-success' disabled={loading}>
                        {loading ? <Spinner as='span' animation='border' size='sm' role='status' aria-hidden='true'/> : 'Create User'}
                    </button>
                </form>
            </div>
            <SuccessModal show={showSuccessModal} handleClose={handleCloseSuccessModal} message={message}/>
            <ErrorModal show={showErrorModal} handleClose={handleCloseErrorModal} message={message}/>
        </div>
    )
}