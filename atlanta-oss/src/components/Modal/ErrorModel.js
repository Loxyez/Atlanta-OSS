import React from 'react';
import { Modal, Button } from 'react-bootstrap';

export default function ErrorModal({show, handleClose, message}) {
    return(
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>ข้อผิดพลาด</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {message}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="danger" onClick={handleClose}>ปิด</Button>
            </Modal.Footer>
        </Modal>
    );
}