import React, { useEffect, useState } from "react";
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import SuccessModal from "../Modal/SuccessModal";

export default function CustomNavbar({ user }) {
    const navigate = useNavigate();
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [message, setMessage] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, []);

    // Handle logout
    const handleLogout = () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        console.log("Logout")
        setMessage('ท่านได้ออกจากระบบเรียบร้อยแล้ว');
        setShowSuccessModal(true);
    }

    const handleCloseModal = () => {
        setShowSuccessModal(false);
        navigate('/'); // Navigate to homepage after modal closes
    };

    // Helper function to generate navigation items based on role
    const getNavItems = () => {
        console.log(user)
        switch (user?.role) {
            case 'Manager':
            case 'operator':
            case 'Developer':
                return (
                    <>
                        <NavDropdown title={<span className="text-white">จัดการระบบงาน</span>} id="task-management-dropdown">
                            <NavDropdown.Item href="/task_list">รายชื่องาน</NavDropdown.Item>
                        </NavDropdown>
                        <NavDropdown title={<span className="text-white">จัดการสต๊อกสินค้า</span>} id="stock-dropdown">
                            <NavDropdown.Item href="/stock_lsit">จัดการสต๊อก</NavDropdown.Item>
                        </NavDropdown>
                        <NavDropdown title={<span className="text-white">แบบคำร้องขอ</span>} id="basic-nav-dropdown">
                            <NavDropdown.Item href="/request_form"> ส่งคำร้องขอบัญชีเข้าใช้ระบบ</NavDropdown.Item>
                            <NavDropdown.Item href="/request_leave" disabled={!isLoggedIn}> ส่งคำร้องขอ ลากิจ/ลาอื่นๆ</NavDropdown.Item>
                        </NavDropdown>
                    </>
                );
            case 'Clerk':
                return (
                    <>
                        <NavDropdown title="จัดการระบบงาน" id="task-management-dropdown">
                            <NavDropdown.Item href="/task_list">รายชื่องาน</NavDropdown.Item>
                        </NavDropdown>
                        <NavDropdown title="จัดการสต๊อกสินค้า" id="stock-dropdown">
                            <NavDropdown.Item href="/stock_lsit">จัดการสต๊อก</NavDropdown.Item>
                        </NavDropdown>
                        <NavDropdown title={<span className="text-white">แบบคำร้องขอ</span>} id="basic-nav-dropdown">
                            <NavDropdown.Item href="/request_form"> ส่งคำร้องขอบัญชีเข้าใช้ระบบ</NavDropdown.Item>
                            <NavDropdown.Item href="/request_leave" disabled={!isLoggedIn}> ส่งคำร้องขอ ลากิจ/ลาอื่นๆ</NavDropdown.Item>
                        </NavDropdown>
                    </>
                );
            default:
        }
    }

    return (
        <>
            <Navbar bg="primary" expand="lg">
                <Container>
                    <Navbar.Brand href="/" className="text-white">Atlanta-OSS</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                        <Nav className="ml-auto">
                            <>
                                {user ? (
                                    <>
                                        {getNavItems()}
                                        <NavDropdown title={<span className="text-white"><i className="fas fa-user"></i> {user.name}</span>} id="user-dropdown">
                                            <NavDropdown.Item href="/account">แก้ไขข้อมูล</NavDropdown.Item>
                                            <NavDropdown.Item onClick={handleLogout}>ออกจากระบบ</NavDropdown.Item>
                                        </NavDropdown>
                                    </>
                                ):(
                                    <>
                                        <NavDropdown title={<span className="text-white">แบบคำร้องขอ</span>} id="basic-nav-dropdown">
                                            <NavDropdown.Item href="/request_form"> ส่งคำร้องขอบัญชีเข้าใช้ระบบ</NavDropdown.Item>
                                            <NavDropdown.Item href="#" disabled> ส่งคำร้องขอ ลากิจ/ลาอื่นๆ</NavDropdown.Item>
                                        </NavDropdown>
                                        <Nav.Link href="/login" className="text-white">เข้าสู่ระบบ</Nav.Link>
                                    </>
                                )}
                            </>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <SuccessModal show={showSuccessModal} handleClose={handleCloseModal} message={message}/>
        </>
    );
}