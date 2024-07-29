import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import config from './utils/config';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

import Home from './components/home/home';
import RequestForm from './components/request-form/request-form';
import LoginOperator from './components/login/login_operator';
import CreateAccount from './components/generate-user-account/genAccount';
import Unauthenticated from './components/alert-page/Unauthenticated';
import PageNotFound from './components/alert-page/PageNotFound';

import ProtectedRoute from './components/protectedRoute/protectedRoute';

function SessionExpirationModal({show, handleExtendSession, handleClose }){
  return (
    <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
              <Modal.Title>Session Expiring Soon</Modal.Title>
          </Modal.Header>
          <Modal.Body>Your session is about to expire. Would you like to extend your session?</Modal.Body>
          <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                  ปิด
              </Button>
              <Button variant="primary" onClick={handleExtendSession}>
                  ฉันยังอยู่/ยังใช้งานอยู่
              </Button>
          </Modal.Footer>
      </Modal>
  )
}

function App () {

  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const handleClose = () => setShowModal(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if(token) {
      const decodedToken = parseJwt(token);
      const expirationTime = decodedToken.exp * 1000 - Date.now();

      const timer = setTimeout(() => {
        if (location.pathname !== '/' && location.pathname !== '/login_operator_account') {
          setShowModal(true);
        }
      }, expirationTime - 60000); // Show modal 1 minute before expiration

      return () => clearTimeout(timer);
    }
  }, [location]);

  const extendSession = async () => {
    try {
        const res = await axios.post(`${config.apiBaseUrl}/extend_session`, {}, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        localStorage.setItem('token', res.data.token);
        setShowModal(false);
        window.location.reload(); // Reload to reset the timer
    } catch (err) {
        console.error('Error extending session:', err);
        navigate('/unauthorized');
    }
  }

  return (
    <div>
      <Routes>
        {/* Normal Path */}
        <Route path="/" exact element={<Home/>} />
        <Route path='/request_form' element={<RequestForm/>}/>
        <Route path='/create_user_account' element={
          <ProtectedRoute> 
            <CreateAccount/> 
          </ProtectedRoute>}
        />

        {/* Unauthentication */}
        <Route path="/unauthorized" element={<Unauthenticated />} />
        {/* Page Not Found */}
        <Route path="*" element={<PageNotFound />} />
        {/* Operation Path */}
        <Route path='/login_operator_account' element={<LoginOperator/>}/>
      </Routes>
      <SessionExpirationModal
        show={showModal}
        handleExtendSession={extendSession}
        handleClose={handleClose}
      />
    </div>
  );
}

function AppWrapper() {
  return (
      <Router>
          <App />
      </Router>
  );
}

ReactDOM.render(<AppWrapper />, document.getElementById('root'));

export default AppWrapper;
