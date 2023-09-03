import React from 'react';
import { Route, Routes } from 'react-router-dom';
import LoginPage from '../LoginPage/LoginPage';
import FinishRegistrationPage from '../FinishRegistrationPage/FinishRegistrationPage';

function UnloggedIndexPage() {
  return (
    <Routes>
      <Route path="*" element={<LoginPage />} />
      <Route path="/registro" element={<FinishRegistrationPage />} />
    </Routes>
  );
}

export default UnloggedIndexPage;
