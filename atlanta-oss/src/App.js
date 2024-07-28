import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import Home from './components/home/home';
import RequestForm from './components/request-form/request-form';
import LoginOperator from './components/login/login_operator';
import CreateAccount from './components/generate-user-account/genAccount';
import Unauthenticated from './components/alert-page/Unauthenticated';
import PageNotFound from './components/alert-page/PageNotFound';

import ProtectedRoute from './components/protectedRoute/protectedRoute';

ReactDOM.render(<App/>, document.getElementById('root'));

function App () {
  return (
    <Router>
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
    </Router>
  )
}

export default App;
