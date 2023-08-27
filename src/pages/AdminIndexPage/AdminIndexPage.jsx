import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminProfilePage from '../AdminProfilePage';
import NewUserPage from '../NewUserPage';
import PageContainer from '../../components/PageContainer/PageContainer';
import NewAreaPage from '../NewAreaPage/NewAreaPage';

function AdminIndexPage() {
  return (
    <PageContainer>
      <Routes>
        <Route path="/" element={<AdminProfilePage />} />
        <Route path="/newUser" element={<NewUserPage />} />
        <Route path="/area/nuevo" element={<NewAreaPage />} />
      </Routes>
    </PageContainer>
  );
}

export default AdminIndexPage;
