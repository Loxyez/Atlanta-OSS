import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const PublicRoute = ({ children }) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    if (token) {
        try {
            jwtDecode(token);
            // If token is valid, redirect to the landing page or desired authenticated route
            return <Navigate to="/landing" />;
        } catch (error) {
            // If token is invalid, allow access to the public route
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            return children;
        }
    } else {
        // No token present, allow access to the public route
        return children;
    }
};

export default PublicRoute;
