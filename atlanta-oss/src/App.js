import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import Home from './components/home/home';
import RequestForm from './components/request-form/request-form';

ReactDOM.render(<App/>, document.getElementById('root'));

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
