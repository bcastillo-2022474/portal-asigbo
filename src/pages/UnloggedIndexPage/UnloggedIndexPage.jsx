import React from 'react';
import { Route, Routes } from 'react-router-dom';
import LoginPage from '../LoginPage/LoginPage';

function UnloggedIndexPage() {
  return (
    <Routes>
      <Route path="*" element={<LoginPage />} />
    </Routes>
  );
}

export default UnloggedIndexPage;
