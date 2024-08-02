import React, { useState } from 'react';
import axios from 'axios';
import config from '../../utils/config';
import CustomNavbar from '../navigation-bar/navbar';
import { Spinner } from 'react-bootstrap';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; // เพิ่มการนำทาง
import './forget_password.css'; // Make sure this file exists in the correct path

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate(); // ใช้ useNavigate

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(''); // Clear previous messages
        setSuccess(false); // Clear previous success state
        try {
            const response = await axios.post(`${config.apiBaseUrl}/forgot_password`, { email });
            if (response.data.success) {
                setSuccess(true);
                setMessage('Password reset link has been sent to your email.');
            } else {
                setMessage(response.data.message);
            }
        } catch (err) {
            setMessage('Server error, please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <CustomNavbar />
            <div className="forgot-password-container">
                <h1 className="mb-4">Forgot Password</h1>
                <div className="card forgot-password-card">
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="form-group mb-3">
                                <div className="input-group">
                                    <div className="input-group-prepend-icon">
                                        <FaEnvelope size={20} />
                                    </div>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        name="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            {message && <div className={`alert ${success ? 'alert-success' : 'alert-danger'}`}>{message}</div>}
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Send Reset Link'}
                            </button>
                        </form>
                        <button className="btn btn-back mt-3" onClick={() => navigate('/login')}>
                            <FaArrowLeft size={16} /> Back
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
