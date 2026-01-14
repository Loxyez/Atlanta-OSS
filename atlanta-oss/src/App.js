import React, { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
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
import CreateStaff from './components/staff-management/create-staff-detail';
import StaffManagementDetail from './components/staff-management/staff-management';
import PublicRoute from './publicroute/PublicRoute';
import CreateItem from './item-management/create_item';
import CreateCategory from './item-management/create_category';
import ManageStock from './item-management/manage_stock';
import ViewStock from './item-management/view_stock';
import EditUserAccount from './components/edit-user-account/Edit_Account';
import CreateTask from './components/work-management/create-task';
import TaskManagement from './components/work-management/task-management';
import TaskStatus from './components/work-management/task-status';
import Calendar from './components/Calendar/calendar';

// Centralized role-based access control
const RoleAccess = {
  CREATE_USER: ['operator'],
  LEAVE_REQUEST: ['Manager', 'Clerk', 'Engineer', 'Trainee', 'Developer', 'operator'],
  LEAVE_MANAGEMENT: ['Manager', 'operator', 'Developer'],
  STAFF_MANAGEMENT: ['Manager', 'operator', 'Developer'],
  ITEM_MANAGEMENT: ['Manager', 'operator', 'Developer'],
  STOCK_VIEW: ['Manager', 'Clerk', 'Engineer', 'Trainee', 'Developer', 'operator'],
  USER_EDIT: ['Manager', 'Clerk', 'Engineer', 'Trainee', 'Developer', 'operator'],
  TASK_MANAGEMENT: ['Manager', 'Clerk', 'Engineer', 'Trainee', 'Developer', 'operator'],
  CALENDAR: ['Manager', 'Clerk', 'Engineer', 'Trainee', 'Developer', 'operator'],
};

function SessionExpirationModal({ show, handleExtendSession, handleClose }) {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Session Expiring</Modal.Title>
      </Modal.Header>
      <Modal.Body>Your session will expire in 5 minutes. Would you like to extend it?</Modal.Body>
      <Modal.Footer>
        <Button variant='primary' onClick={handleExtendSession}>
          Stay Logged In
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

function App() {
  const [showModal, setShowModal] = useState(false);
  const [isTokenExpired, setIsTokenExpired] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Invalid token format", e);
      return null;
    }
  };

  const handleClose = () => setShowModal(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = parseJwt(token);
      const expirationTime = decodedToken.exp * 1000 - Date.now();

      const timer = setTimeout(() => {
        if (
          !['/', '/login_operator_account', '/request_form', '/login', '/forget_password'].includes(location.pathname)
        ) {
          setShowModal(true);
        }
      }, expirationTime - 300000); // Show modal 5 minutes before expiration

      return () => clearTimeout(timer);
    }
  }, [location]);

  const extendSession = async () => {
    try {
      const res = await axios.post(
        `${config.apiBaseUrl}/auth/extend_session`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      localStorage.setItem('token', res.data.token);
      setShowModal(false);
      window.location.reload();
    } catch (err) {
      console.error('Error extending session:', err);
      navigate('/unauthorized');
      setIsTokenExpired(true);
    }
  };

  useEffect(() => {
    if (isTokenExpired) {
      localStorage.removeItem('token');
      setShowModal(false);
      navigate('/');
    }
  }, [isTokenExpired, navigate]);

  return (
    <div>
      <Analytics />
      <Routes>
        {/* Public Routes */}
        <Route path='/' exact element={<Home />} />
        <Route path='/request_form' element={<RequestForm />} />
        <Route path='/unauthorized' element={<Unauthenticated />} />
        <Route path='*' element={<PageNotFound />} />

        {/* Authentication Routes */}
        <Route path='/login_operator_account' element={<LoginOperator />} />
        <Route
          path='/login'
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route path='/forget_password' element={<ForgotPassword />} />

        {/* Protected Routes */}
        <Route
          path='/create_user_account'
          element={
            <ProtectedRoute allowedRoles={RoleAccess.CREATE_USER}>
              <CreateAccount />
            </ProtectedRoute>
          }
        />
        <Route
          path='/request_leave'
          element={
            <ProtectedRoute allowedRoles={RoleAccess.LEAVE_REQUEST}>
              <LeaveRequest />
            </ProtectedRoute>
          }
        />
        <Route
          path='/manage_leave'
          element={
            <ProtectedRoute allowedRoles={RoleAccess.LEAVE_MANAGEMENT}>
              <LeaveManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path='/create_staff'
          element={
            <ProtectedRoute allowedRoles={RoleAccess.STAFF_MANAGEMENT}>
              <CreateStaff />
            </ProtectedRoute>
          }
        />
        <Route
          path='/staff_list'
          element={
            <ProtectedRoute allowedRoles={RoleAccess.STAFF_MANAGEMENT}>
              <StaffManagementDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path='/create_item'
          element={
            <ProtectedRoute allowedRoles={RoleAccess.ITEM_MANAGEMENT}>
              <CreateItem />
            </ProtectedRoute>
          }
        />
        <Route
          path='/create_category'
          element={
            <ProtectedRoute allowedRoles={RoleAccess.ITEM_MANAGEMENT}>
              <CreateCategory />
            </ProtectedRoute>
          }
        />
        <Route
          path='/stock_management'
          element={
            <ProtectedRoute allowedRoles={RoleAccess.ITEM_MANAGEMENT}>
              <ManageStock />
            </ProtectedRoute>
          }
        />
        <Route
          path='/view_stock'
          element={
            <ProtectedRoute allowedRoles={RoleAccess.STOCK_VIEW}>
              <ViewStock />
            </ProtectedRoute>
          }
        />
        <Route
          path='/edit_account'
          element={
            <ProtectedRoute allowedRoles={RoleAccess.USER_EDIT}>
              <EditUserAccount />
            </ProtectedRoute>
          }
        />
        <Route
          path='/create_task'
          element={
            <ProtectedRoute allowedRoles={RoleAccess.TASK_MANAGEMENT}>
              <CreateTask />
            </ProtectedRoute>
          }
        />
        <Route
          path='/task_management'
          element={
            <ProtectedRoute allowedRoles={RoleAccess.TASK_MANAGEMENT}>
              <TaskManagement />
            </ProtectedRoute>
          }
        />
        {/* <Route path="/task_status" element={<ProtectedRoute allowedRoles={RoleAccess.TASK_MANAGEMENT}><TaskStatus /></ProtectedRoute>} /> */}
        <Route
          path='/task_status'
          element={
            <ProtectedRoute allowedRoles={RoleAccess.TASK_MANAGEMENT}>
              <TaskStatus />
            </ProtectedRoute>
          }
        />
        <Route
          path='/calendar'
          element={
            <ProtectedRoute allowedRoles={RoleAccess.CALENDAR}>
              <Calendar />
            </ProtectedRoute>
          }
        />

        {/* Landing Page */}
        <Route
          path='/landing'
          element={
            <ProtectedRoute allowedRoles={RoleAccess.TASK_MANAGEMENT}>
              <LandingPage />
            </ProtectedRoute>
          }
        />
      </Routes>

      <SessionExpirationModal show={showModal} handleExtendSession={extendSession} handleClose={handleClose} />
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
