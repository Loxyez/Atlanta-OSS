import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../../utils/config';
import CustomNavbar from '../navigation-bar/navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import SuccessModal from '../Modal/SuccessModal';
import ErrorModal from '../Modal/ErrorModel';

export default function RequestForm () {
    const [requests, setRequests] = useState([]);
    const [userRole, setUserRole] = useState([]);
    const [formData, setFormData] = useState({
        uid: '',
        email: '',
        tel: '',
        role: '',
        reason: '',
        status: 'Open'
    });
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${config.apiBaseUrl}/requests_form`);
                setRequests(res.data);
            } catch (error) {
                console.error('Error fetching the request data', error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${config.apiBaseUrl}/user_roles`);
                setUserRole(res.data);
            } catch (error) {
                console.error('Error fetching the user roles',  error);
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.uid || !formData.email || !formData.tel || !formData.role){
            setErrorMessage('กรุณากรอกข้อมูลให้ครบถ้วน');
            setShowErrorModal(true);
            return;
        }

        try {
            const res = await axios.post(`${config.apiBaseUrl}/submit_request_form`, formData);
            setRequests([...requests, res.data]);
            setFormData({
                uid: '',
                email: '',
                tel: '',
                role: '',
                reason: '',
                status: ''
            });
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Error submitting the request', error);
        }
    };

    const handleCloseSuccessModal = () => {
        setShowSuccessModal(false);
    };

    const handleCloseErrorModal = () => {
        setShowErrorModal(false);
    }

    return (
        <div>
            <CustomNavbar/>
            <div className='container mt-5'>
                <h1>ส่งคำร้องขอเข้าใช้ระบบ</h1>
                <p>แบบฟอร์มสำหรับส่งขอร้องขอเข้าใช้ระบบ / ขอสิทธิ์เข้าใช้ระบบชั่วคราวของ OSS</p>
                <hr/>
                <form onSubmit={handleSubmit} className='mb-5'>
                    <div className='form-group row'>
                        <div className='col-sm-6 mb-3 mb-sm-0'>
                            <label htmlFor='uid'>รหัสพนักงาน</label>
                            <input
                                type='text'
                                className='form-control'
                                id='uid'
                                name='uid'
                                value={formData.uid}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className='col-sm-6'>
                            <label htmlFor="email">อีเมล</label>
                            <input
                                type='email'
                                className='form-control'
                                id='email'
                                name='email'
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div className='form-group row'>
                        <div className='col-sm-6 mb-3 mb-sm-0'>
                            <label htmlFor='tel'>หมายเลขโทรศัพท์</label>
                            <input
                                type='text'
                                className='form-control'
                                id='tel'
                                name='tel'
                                value={formData.tel}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className='col-sm-6'>
                            <label htmlFor='role'>ตำแหน่ง</label>
                            <select className='form-select' id="RoleCategory" name="RoleCategory" onChange={(e) => {
                                formData.role = e.target.value;
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
                    <div className='form-group'>
                        <label htmlFor="reason">เหตุผล</label>
                        <textarea
                            className='form-control'
                            id='reason'
                            name='reason'
                            value={formData.reason}
                            onChange={handleChange}
                            required
                        ></textarea>
                    </div>
                    <hr/>
                    <button type='submit' className='btn btn-success'>ส่งคำร้องขอ</button>
                </form>
            </div>
            <SuccessModal show={showSuccessModal} handleClose={handleCloseSuccessModal}/>
            <ErrorModal show={showErrorModal} handleClose={handleCloseErrorModal} message={errorMessage}/>
        </div>
    )
}