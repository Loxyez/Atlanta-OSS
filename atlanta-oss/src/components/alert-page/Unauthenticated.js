import React from 'react';
import CustomNavbar from '../navigation-bar/navbar';

const Unauthenticated = () => {
  return (
    <div>
      <CustomNavbar />
      <div className='container mt-5'>
        <h1>Unauthorized Access</h1>
        <p>You are not allowed to access this page. Please contact the admin or operator for assistance.</p>
        <p>
          Please login to access the website service <a href='/login'>Login to access the website</a>
        </p>
      </div>
    </div>
  );
};

export default Unauthenticated;
