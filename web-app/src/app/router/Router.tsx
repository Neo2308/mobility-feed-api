import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SignIn from '../screens/SignIn';
import SignUp from '../screens/SingUp';
import Account from '../screens/Account';
import ContactInformation from '../screens/ContactInformation';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path='/' element={<SignIn />} />
      <Route path='sign-in' element={<SignIn />} />
      <Route path='sign-up' element={<SignUp />} />
      <Route element={<ProtectedRoute />}>
        <Route path='account' element={<Account />} />
      </Route>
      <Route path='contact-info' element={<ContactInformation />} />
    </Routes>
  );
};

export default AppRouter;
