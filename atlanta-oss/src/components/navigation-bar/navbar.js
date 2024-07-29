import React from "react";
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';

export default function CustomNavbar() {
    return (
        <Navbar bg="primary" expand="lg">
            <Container>
                <Navbar.Brand href="/" className="text-white">Atlanta-OSS</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                    <Nav className="ml-auto">
                        <NavDropdown title={<span className="text-white">แบบคำร้องขอ</span>} id="basic-nav-dropdown">
                            <NavDropdown.Item href="/request_form"> ส่งคำร้องขอบัญชีเข้าใช้ระบบ</NavDropdown.Item>
                            <NavDropdown.Item href="#" disabled> ส่งคำร้องขอ ลากิจ/ลาอื่นๆ</NavDropdown.Item>
                        </NavDropdown>
                        <Navbar title="test"></Navbar>
                    </Nav>
                    <Nav>
                        <Nav.Link href="/login" className="text-white">เข้าสู่ระบบ</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}