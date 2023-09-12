import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AreasListPage from '@pages/AreasListPage';
import NewAreaPage from '@pages/NewAreaPage';
import PageContainer from '@components/PageContainer/PageContainer';
import AdminProfilePage from '@pages/AdminProfilePage';
import NewUserPage from '@pages/NewUserPage';
import AreaDetailsPage from '../AreaDetailsPage/AreaDetailsPage';
import NotFoundPage from '../NotFoundPage/NotFoundPage';
import AdminConfiguration from '../AdminConfiguration/AdminConfiguration';
import UsersListPage from '../UsersListPage/UsersListPage';

function AdminIndexPage() {
  return (
    <PageContainer>
      <Routes>
        <Route path="/" element={<AdminProfilePage />} />
        <Route path="/newUser" element={<NewUserPage />} />
        <Route path="/area/:idArea/editar" element={<NewAreaPage />} />
        <Route path="/area/:idArea/*" element={<AreaDetailsPage adminPrivileges />} />
        <Route path="/area/nuevo" element={<NewAreaPage />} />
        <Route path="/area" element={<AreasListPage />} />
        <Route path="/config/*" element={<AdminConfiguration />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/usuarios" element={<UsersListPage />} />
      </Routes>
    </PageContainer>
  );
}

export default AdminIndexPage;
