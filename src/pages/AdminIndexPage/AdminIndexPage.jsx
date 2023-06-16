import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminProfilePage from '../AdminProfilePage/AdminProfilePage';
import NewUserPage from '../NewUserPage/NewUserPage';

function AdminIndexPage() {
  return (
    <Routes>
      <Route path="/" element={<AdminProfilePage />} />
      <Route path="/newUser" element={<NewUserPage />} />
    </Routes>
  );
}

export default AdminIndexPage;
