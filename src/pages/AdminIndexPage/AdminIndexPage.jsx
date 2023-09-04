import React from 'react';
import { Routes, Route } from 'react-router-dom';
import GlobalConfigPage from '@pages/GlobalConfigPage';
import NewAreaPage from '@pages/NewAreaPage';
import PageContainer from '@components/PageContainer/PageContainer';
import AdminProfilePage from '@pages/AdminProfilePage';
import NewUserPage from '@pages/NewUserPage';
import AreaDetailsPage from '../AreaDetailsPage/AreaDetailsPage';
import NotFoundPage from '../NotFoundPage/NotFoundPage';

function AdminIndexPage() {
  return (
    <PageContainer>
      <Routes>
        <Route path="/" element={<AdminProfilePage />} />
        <Route path="/newUser" element={<NewUserPage />} />
        <Route path="/area/:idArea/*" element={<AreaDetailsPage adminPrivileges />} />
        <Route path="/area/nuevo" element={<NewAreaPage />} />
        <Route path="/configuracion" element={<GlobalConfigPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </PageContainer>
  );
}

export default AdminIndexPage;
