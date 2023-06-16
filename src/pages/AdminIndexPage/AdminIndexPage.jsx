import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminProfilePage from '../AdminProfilePage/AdminProfilePage';

function AdminIndexPage() {
  return (
    <Routes>
      <Route path="/" element={<AdminProfilePage />} />
    </Routes>
  );
}

export default AdminIndexPage;
