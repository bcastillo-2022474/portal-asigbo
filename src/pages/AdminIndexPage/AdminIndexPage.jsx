import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminProfilePage from '../AdminProfilePage';
import NewUserPage from '../NewUserPage';
import PageContainer from '../../components/PageContainer/PageContainer';

function AdminIndexPage() {
  return (
    <PageContainer>
      <Routes>
        <Route path="/" element={<AdminProfilePage />} />
        <Route path="/newUser" element={<NewUserPage />} />
      </Routes>
    </PageContainer>
  );
}

export default AdminIndexPage;
