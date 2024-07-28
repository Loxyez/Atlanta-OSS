import React from 'react';
import { Modal, Button } from 'react-bootstrap';

function SuccessModal({ show, handleClose }) {
    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>คำร้องขอได้บันทึกแล้ว</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                คำร้องขอเข้าใช้งานระบบของท่านได้บันทึกเข้าสู่ระบบแล้ว ทางระบบจะตรวจสอบในไม่ช้า
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={handleClose}>ปิด</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default SuccessModal;