import React from 'react';
import { Modal, Button } from 'react-bootstrap';

function SuccessModal({ show, handleClose, message }) {
    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>สำเร็จ</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {message}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={handleClose}>ปิด</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default SuccessModal;