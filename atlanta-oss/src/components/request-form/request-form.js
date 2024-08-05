import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../../utils/config';
import CustomNavbar from '../navigation-bar/navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Spinner } from 'react-bootstrap';
import SuccessModal from '../Modal/SuccessModal';
import ErrorModal from '../Modal/ErrorModel';
import './request-form.css'; // Import the CSS file

export default function RequestForm () {
    const [userRole, setUserRole] = useState([]);
    const [formData, setFormData] = useState({
        ticketid: '',
        uid: '',
        email: '',
        tel: '',
        role: '',
        reason: '',
        status: 'Open'
    });
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${config.apiBaseUrl}/users/user_roles`);
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

    const generateTicketID = () => {
        const currentDate = new Date();
        const day = String(currentDate.getDate()).padStart(2, '0');
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const year = String(currentDate.getFullYear()).slice(-2);
        const seconds = String(formData.uid).slice(-2);
        return `PT${day}${month}${year}${seconds}`;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const ticketid = generateTicketID();
        const newRequest = {...formData, ticketid};
        setLoading(true);

        // Basic validation
        if (!formData.uid || !formData.email || !formData.tel || !formData.role){
            setMessage('กรุณากรอกข้อมูลให้ครบถ้วน');
            setShowErrorModal(true);
            return;
        }

        try {
            const res = await axios.post(`${config.apiBaseUrl}/requests/submit_request_form`, newRequest);
            setFormData({
                ticketid: '',
                uid: '',
                email: '',
                tel: '',
                role: '',
                reason: '',
                status: ''
            });
            setMessage('ระบบได้ทำการบันทึกคำร้องขอไว้เรียบร้อย และจะใช้เวลาพิจารณาภายใน 1-2 วัน')
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Error submitting the request', error);
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
                <h1>ส่งคำร้องขอเข้าใช้ระบบ</h1>
                <p>แบบฟอร์มสำหรับส่งขอร้องขอเข้าใช้ระบบ / ขอสิทธิ์เข้าใช้ระบบชั่วคราวของ OSS</p>
                <hr/>
                <form onSubmit={handleSubmit} className='mb-5'>
                    <div className='form-group row'>
                        <div className='col-sm-6 mb-3 mb-sm-0'>
                            <label htmlFor='uid'>รหัสพนักงาน</label>
                            <input
                                type='text'
                                className='form-control form-control-custom'
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
                                className='form-control form-control-custom'
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
                                className='form-control form-control-custom'
                                id='tel'
                                name='tel'
                                value={formData.tel}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className='col-sm-6'>
                            <label htmlFor='role'>ตำแหน่ง</label>
                            <select className='form-select form-control-custom' id="RoleCategory" name="RoleCategory" onChange={(e) => {
                                setFormData({ ...formData, role: e.target.value});
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
                            className='form-control form-control-custom'
                            id='reason'
                            name='reason'
                            value={formData.reason}
                            onChange={handleChange}
                            required
                        ></textarea>
                    </div>
                    <hr/>
                    <button type='submit' className='btn btn-success' disabled={loading}>
                        {loading ? <Spinner as='span' animation='border' size='sm' role='status' aria-hidden='true'/> : 'ส่งคำร้องขอ'}
                    </button>
                </form>
            </div>
            <SuccessModal show={showSuccessModal} handleClose={handleCloseSuccessModal} message={message}/>
            <ErrorModal show={showErrorModal} handleClose={handleCloseErrorModal} message={message}/>
        </div>
    )
}
