import React, { useState } from 'react';
import axios from 'axios';
import config from '../../utils/config';
import { useNavigate } from 'react-router-dom';
import CustomNavbar from '../navigation-bar/navbar';

export default function LoginOperator() {
    const [credentials, setCredentials] = useState({ user_name: '', user_password: ''});
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async(e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${config.apiBaseUrl}/operator_login`, credentials);
            if (res.data.success){
                localStorage.setItem('token', res.data.token);
                navigate('/create_user_account');
            } else {
                setError(res.data.message);
            }
        } catch (err) {
            setError('Server error, Please try again later.');
        }
    };

    return (
        <div>
            <CustomNavbar/>
            <div className='container mt-5'>
                <h1>Operator Login</h1>
                <form onSubmit={handleSubmit}>
                    <div className='form-group'>
                        <label htmlFor='user_name'>User Name</label>
                        <input
                            type='text'
                            className='form-control'
                            id='user_name'
                            name='user_name'
                            value={credentials.user_name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className='form-group'>
                        <label htmlFor='user_password'>Password</label>
                        <input
                            type='password'
                            className='form-control'
                            id='user_password'
                            name='user_password'
                            value={credentials.user_password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <button type="submit" className="btn btn-primary">Login</button>
                </form>
            </div>
        </div>
    )
}