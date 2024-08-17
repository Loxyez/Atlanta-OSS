import React, { useEffect, useState } from 'react';
import { Analytics } from "@vercel/analytics/react";
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
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
import Login from './components/login/login';
import ForgotPassword from './components/login/forget_password';
import LandingPage from './components/Landing/landing-page';
import ProtectedRoute from './components/protectedRoute/protectedRoute';
import LeaveRequest from './components/request-form/request-leave';
import LeaveManagement from './components/staff-management/leave-management';
import CraeteStaff from './components/staff-management/create-staff-detail';
import PublicRoute from './publicroute/PublicRoute';

function SessionExpirationModal({show, handleExtendSession, handleClose }){
  return (
    <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
              <Modal.Title>เซสชั่นกำลังจะหมดอายุ</Modal.Title>
          </Modal.Header>
          <Modal.Body>เซสชั่นกำลังจะหมดอายุในอีก 5 นาทีคุณต้องการต่อ เซสชั่น หรือไม่?</Modal.Body>
          <Modal.Footer>
              <Button variant="primary" onClick={handleExtendSession}>
                  ฉันยังอยู่/ยังใช้งานอยู่
              </Button>
          </Modal.Footer>
      </Modal>
  )
}

function App () {

  const [showModal, setShowModal] = useState(false);
  const [isTokenExpired, setIsTokenExpired] = useState(false);
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
        if (location.pathname !== '/' 
          && location.pathname !== '/login_operator_account' 
          && location.pathname !== '/request_form' 
          && location.pathname !== '/login'
          && location.pathname !== '/forget_password'
        ) {
          setShowModal(true);
        }
      }, expirationTime - 300000); // Show modal 5 minute before expiration

      return () => clearTimeout(timer);
    }
  }, [location]);

  const extendSession = async () => {
    try {
        const res = await axios.post(`${config.apiBaseUrl}/auth/extend_session`, {}, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        localStorage.setItem('token', res.data.token);
        setShowModal(false);
        window.location.reload();
    } catch (err) {
        console.error('Error extending session:', err);
        navigate('/unauthorized');
        setIsTokenExpired(true);
    }
  }

  useEffect(() => {
    if (isTokenExpired) {
      localStorage.removeItem('token');
      setShowModal(false);
      navigate('/');
    }
  }, [isTokenExpired, navigate]);

  return (
    <div>
      <Analytics/>
      <Routes>
        {/* Normal Path */}
        <Route path="/" exact element={<Home/>} />
        <Route path='/request_form' element={<RequestForm/>}/>
        <Route path='/create_user_account' element={
          <ProtectedRoute allowedRoles={['operator']}> 
            <CreateAccount/> 
          </ProtectedRoute>}
        />
        <Route path='/request_leave' element={
          <ProtectedRoute allowedRoles={['Manager', 'Clerk', 'Engineer', 'Trainee', 'Developer', 'operator']}>
            <LeaveRequest/>
          </ProtectedRoute>
        }/>
        <Route path='/manage_leave' element={
          <ProtectedRoute allowedRoles={['Manager', 'operator', 'Developer']}>
            <LeaveManagement />
          </ProtectedRoute>
        }/>
        <Route path='/create_staff' element={
          <ProtectedRoute allowedRoles={['Manager', 'operator', 'Developer']}>
            <CraeteStaff />
          </ProtectedRoute>
        }/>

        {/* Unauthentication */}
        <Route path="/unauthorized" element={<Unauthenticated />} />
        {/* Page Not Found */}
        <Route path="*" element={<PageNotFound />} />
        {/* Operation Login Path */}
        <Route path='/login_operator_account' element={<LoginOperator/>}/>
        <Route path='/login' element={
          <PublicRoute>
            <Login />
          </PublicRoute>} 
        />
        <Route path='/forget_password' element={<ForgotPassword/>}/>
        <Route path='/landing' element={
          <ProtectedRoute allowedRoles={['Manager', 'Clerk', 'Engineer', 'Trainee', 'Developer', 'operator']}>
            <LandingPage/>
          </ProtectedRoute>}
        />
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
