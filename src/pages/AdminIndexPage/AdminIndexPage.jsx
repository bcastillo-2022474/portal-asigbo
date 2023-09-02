import React from 'react';
import { Routes, Route } from 'react-router-dom';
import GlobalConfigPage from '@pages/GlobalConfigPage';
import NewAreaPage from '@pages/NewAreaPage';
import PageContainer from '@components/PageContainer/PageContainer';
import AdminProfilePage from '@pages/AdminProfilePage';
import NewUserPage from '@pages/NewUserPage';

function AdminIndexPage() {
  return (
    <PageContainer>
      <Routes>
        <Route path="/" element={<AdminProfilePage />} />
        <Route path="/newUser" element={<NewUserPage />} />
        <Route path="/area/nuevo" element={<NewAreaPage />} />
        <Route path="/configuracion" element={<GlobalConfigPage />} />
      </Routes>
    </PageContainer>
  );
}

export default AdminIndexPage;
