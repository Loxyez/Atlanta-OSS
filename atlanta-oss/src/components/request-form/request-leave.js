import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Card, Row, Col, Form, Button, Modal } from 'react-bootstrap';
import { jwtDecode } from 'jwt-decode';
import CustomNavbar from '../navigation-bar/navbar';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt } from 'react-icons/fa';
import './css/request-leave.css';
import config from '../../utils/config';
import SuccessModal from '../Modal/SuccessModal';
import ErrorModal from '../Modal/ErrorModel';

export default function LeaveRequest () {
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [selectedLeave, setSelectedLeave] = useState('');
    const [leavePeriod, setLeavePeriod] = useState('');
    const [leaveBalance, setLeaveBalance] = useState({});
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [reason, setReason] = useState('');
    const [user, setUser] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');

        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                const userData = {
                    name: decodedToken.user_name,
                    role: decodedToken.user_role,
                    user_id: decodedToken.user_id
                };
                setUser(userData);
            } catch (err) {
                console.error('Failed to decode token', err);
            }
        }

        const fetchLeaveTypes = async () => {
            try {
                const res = await axios.get(`${config.apiBaseUrl}/leave_requests/leave_types`);
                setLeaveTypes(res.data);
            } catch (error) {
                console.error('Error fetching the leave types',  error);
            }
        };

        const fetchUserLeaveBalance = async () => {
            try {
                const res = await axios.get(`${config.apiBaseUrl}/leave_requests/leave_balance/${jwtDecode(token).user_id}`)
                setLeaveBalance(res.data)
            } catch (error) {
                console.error('Error fetching the leave balances',  error);
            }
        }

        fetchUserLeaveBalance();
        fetchLeaveTypes();
    }, []);

    const handleModalClose = () => setShowModal(false);
    const handleModalShow = () => setShowModal(true);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const leaveRequest = {
            user_id: user.user_id,
            leave_type_id: selectedLeave,
            leave_period: leavePeriod,
            start_date: startDate,
            end_date: endDate,
            reason,
        };

        try {
            const res = await axios.post(`${config.apiBaseUrl}/leave_requests/submit_leave_request`, leaveRequest, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.status === 201) {
                setSuccess('ยื่นคำร้องขอวันลาเสร็จเรียบร้อย ระบบจะทำการตรวจสอบ 1-2 วัน');
                setSelectedLeave('');
                setLeavePeriod('full');
                setStartDate('');
                setEndDate('');
                setReason('');
                setShowSuccessModal(true);
            } else {
                setError('ไม่สามารถส่งคำร้องขอได้โปรดลองใหม่');
                setShowErrorModal(true);
            }
        } catch (error) {
            setError('An error occurred while submitting the leave request.');
            setShowErrorModal(true);
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
            <CustomNavbar user={user} />
            <Container className="mt-5">
                <Card className="p-4 shadow-sm">
                    <h2 className="mb-4">ระบบแจ้งลากิจ/ลาป่วย</h2>

                     {/* Information about Leave Entitlements */}
                     <div className="mb-4">
                        <Button variant="info" onClick={handleModalShow}>
                            สิทธิการลา (กดเพื่ออ่านข้อมูลเบื้องต้น)
                        </Button>
                    </div>

                    <Form onSubmit={handleSubmit}>
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm={3}>ชนิดการลา/รูปแบบ</Form.Label>
                            <Col sm={9}>
                                <Form.Control 
                                    as="select" 
                                    value={selectedLeave} 
                                    onChange={(e) => setSelectedLeave(e.target.value)} 
                                    required
                                >
                                    <option value="">เลือกชนิดการลา</option>
                                    {leaveTypes.map((leaveType) => {
                                        const balance = leaveBalance.find(b => b.leave_type_id === leaveType.leave_type_id);
                                        const daysLeft = balance ? balance.leave_days_left : 0;

                                        return (
                                            <option key={leaveType.leave_type_id} value={leaveType.leave_type_id}>
                                                {leaveType.leave_name} - เหลือ {daysLeft} วัน
                                            </option>
                                        );
                                    })}
                                </Form.Control>
                            </Col>
                        </Form.Group>

                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm={3}>เลือกรูปแบบการลา</Form.Label>
                            <Col sm={9}>
                                <Form.Control 
                                    as="select" 
                                    value={leavePeriod} 
                                    onChange={(e) => setLeavePeriod(e.target.value)} 
                                    required
                                >
                                    <option value="full">เต็มวัน</option>
                                    <option value="half-morning">ครึ่งวันเช้า</option>
                                    <option value="half-afternoon">ครึ่งวันบ่าย</option>
                                </Form.Control>
                            </Col>
                        </Form.Group>
                        
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm={3}>เลือกระยะเวลา</Form.Label>
                            <Col sm={9}>
                                <div className="d-flex align-items-center">
                                    <FaCalendarAlt className="me-2" />
                                    <DatePicker
                                        selectsRange={true}
                                        startDate={startDate}
                                        endDate={endDate}
                                        onChange={(dates) => {
                                            const [start, end] = dates;
                                            setStartDate(start);
                                            setEndDate(end);
                                        }}
                                        isClearable={true}
                                        className="form-control"
                                        required
                                    />
                                </div>
                            </Col>
                        </Form.Group>
                        
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm={3}>เหตุผล (ถ้ามี)</Form.Label>
                            <Col sm={9}>
                                <Form.Control 
                                    as="textarea" 
                                    rows={3} 
                                    placeholder="กรุณาใส่เหตุผลของคุณที่นี่" 
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)} 
                                />
                            </Col>
                        </Form.Group>

                        <div className="text-end">
                            <Button type="submit" variant="primary">ส่งคำขอร้องการลา</Button>
                        </div>
                    </Form>
                </Card>
            </Container>

            {/* Modal for Leave Entitlements */}
            <Modal show={showModal} onHide={handleModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>สิทธิการลา</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h5 className='text-primary'>สิทธิลากิจ</h5>
                    <p>
                        พนักงานมีสิทธิ์ลากิจได้ปีละ 15 วันทำการ โดยต้องแจ้งลาล่วงหน้าอย่างน้อย 3 วันก่อนวันที่จะลา
                    </p>
                    <h5 className='text-warning'>สิทธิลาป่วย</h5>
                    <p>
                        พนักงานมีสิทธิ์ลาป่วยได้ปีละ 30 วันทำการ โดยไม่จำเป็นต้องแจ้งลาล่วงหน้า
                    </p>
                    <h5 className='text-danger'>สิทธิลาฉุกเฉิน</h5>
                    <p>
                        พนักงานมีสิทธิ์ลาฉุกเฉินได้ 5 วันต่อปี โดยต้องแจ้งลาทันทีที่สามารถทำได้
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleModalClose}>
                        ปิด
                    </Button>
                </Modal.Footer>
            </Modal>

            <SuccessModal show={showSuccessModal} handleClose={handleCloseSuccessModal} message={success}/>
            <ErrorModal show={showErrorModal} handleClose={handleCloseErrorModal} message={error}/>
        </div>
    );
}