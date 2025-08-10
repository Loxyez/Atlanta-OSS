import {jwtDecode} from 'jwt-decode';
import React from 'react';
import {Navigate} from 'react-router-dom';

const ProtectedRoute = ({children, allowedRoles}) => {
  const isAuthenticated = localStorage.getItem('token') || sessionStorage.getItem('token');

  if (!isAuthenticated) {
    return <Navigate to='/unauthorized' />;
  }

  try {
    const decodedToken = jwtDecode(isAuthenticated);
    const userRole = decodedToken.user_role;

    // Check if the user's role is allowed to access this route
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to='/unauthorized' />;
    }

    // If everything is okay, render the children components
    return children;
  } catch (error) {
    // If the token is invalid or cannot be decoded
    return <Navigate to='/unauthorized' />;
  }
};

export default ProtectedRoute;
