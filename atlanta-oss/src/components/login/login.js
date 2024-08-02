import React, { useState } from 'react';
import axios from 'axios';
import config from '../../utils/config';
import { useNavigate } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import CustomNavbar from '../navigation-bar/navbar';
import { FaUserCircle, FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import './login.css';

export default function LoginOperator() {
    const [credentials, setCredentials] = useState({ user_name: '', user_password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(''); // Clear previous errors
        try {
            const res = await axios.post(`${config.apiBaseUrl}/operator_login`, credentials);
            if (res.data.success) {
                localStorage.setItem('token', res.data.token);
                navigate('/create_user_account');
            } else {
                setError(res.data.message);
            }
        } catch (err) {
            setError('Server error, please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <CustomNavbar />
            <div className="login-container">
                <h1 className="mb-4">Login</h1>
                <div className="card login-card">
                    <div className="card-body">
                        <div className="text-center mb-4">
                            <FaUserCircle size={70} color="#5cb85c" />
                            <h2 className="mt-2">Sign In</h2>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group mb-3">
                                <div className="input-group">
                                    <div className="input-group-prepend-icon">
                                        <FaUser size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="user_name"
                                        name="user_name"
                                        placeholder="Username"
                                        value={credentials.user_name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group mb-3">
                                <div className="input-group">
                                    <div className="input-group-prepend-icon">
                                        <FaLock size={20} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="form-control"
                                        id="user_password"
                                        name="user_password"
                                        placeholder="Password"
                                        value={credentials.user_password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <div
                                        className="input-group-append-icon"
                                        onClick={() => setShowPassword(!showPassword)}
                                        title={showPassword ? "Hide Password" : "Show Password"}
                                    >
                                        {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div className="form-check">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="rememberMe"
                                        checked={rememberMe}
                                        onChange={() => setRememberMe(!rememberMe)}
                                    />
                                    <label className="form-check-label" htmlFor="rememberMe">
                                        Remember Me
                                    </label>
                                </div>
                                <a href="/forget_password" className="text-decoration-none forget-password">
                                    Forget Password
                                </a>
                            </div>
                            {error && <div className="alert alert-danger">{error}</div>}
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Login'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
