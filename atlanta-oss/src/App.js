import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Home from './components/home/home';
import RequestForm from './components/request-form/request-form';

function App () {
  return (
    <Router>
      <Routes>
        <Route path="/" exact element={<Home/>} />
        <Route path='/request_form' element={<RequestForm/>}/>
      </Routes>
    </Router>
  )
}

export default App;
