import React from 'react';
import { Route, Routes } from 'react-router-dom';
import LoginPage from '../LoginPage/LoginPage';
import FinishRegistrationPage from '../FinishRegistrationPage/FinishRegistrationPage';
import RecoverPasswordPage from '../RecoverPasswordPage/RecoverPasswordPage';
import UpdatePasswordPage from '../UpdatePasswordPage';

function UnloggedIndexPage() {
  return (
    <Routes>
      <Route path="*" element={<LoginPage />} />
      <Route path="/registro" element={<FinishRegistrationPage />} />
      <Route path="/recuperacion" element={<RecoverPasswordPage />} />
      <Route path="/actualizarContrasena" element={<UpdatePasswordPage />} />
    </Routes>
  );
}

export default UnloggedIndexPage;
