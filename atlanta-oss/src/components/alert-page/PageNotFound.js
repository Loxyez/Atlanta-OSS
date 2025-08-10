import React from 'react';
import CustomNavbar from '../navigation-bar/navbar';

const PageNotFound = () => {
  return (
    <div>
      <CustomNavbar />
      <div className='container mt-5'>
        <h1>Page Not Found</h1>
        <p>The page you are looking for does not exist.</p>
        <p>
          <a href='/'>Go back to the home page</a>
        </p>
      </div>
    </div>
  );
};

export default PageNotFound;
