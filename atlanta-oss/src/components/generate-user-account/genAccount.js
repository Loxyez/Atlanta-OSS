import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../../utils/config';
import CustomNavbar from '../navigation-bar/navbar';

export default function CreateAccount() {
    const [request, setRequests] = useState([]);
    const [user, setUser] = useState({
        user_name: '',
        user_password: '',
        user_role: '',
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${config.apiBaseUrl}/requests_form`);
                setRequests(res.data);
            } catch (error) {
                console.error('Error fetching the request data', error);
            }
        }
    })

    const handleChange = (e) => {
        setUser({...user, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const res = await axios.post(`${config.apiBaseUrl}/create_user`, user, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setMessage('User created successfully');
            setRequests([...request, res.data]);
            setUser({
                user_name: '',
                user_password: '',
                user_role: ''
            });
        } catch (err) {
            setMessage('Error creating user.');
        }
    };

    return (
        <div>
            <CustomNavbar/>
            <div className='container mt-5'>
                <h1>Create User</h1>
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
                        <div className='col-sm-5 mb-3 mb-sm-0'>

                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}