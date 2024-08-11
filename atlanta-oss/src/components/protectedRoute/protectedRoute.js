import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('token') || sessionStorage.getItem('token');

    return isAuthenticated ? children : <Navigate to="/unauthorized" />;
};

export default ProtectedRoute;
