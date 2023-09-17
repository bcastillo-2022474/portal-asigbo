import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AreasListPage from '@pages/AreasListPage';
import NewAreaPage from '@pages/NewAreaPage';
import PageContainer from '@components/PageContainer/PageContainer';
import AdminProfilePage from '@pages/AdminProfilePage';
import NewUserPage from '@pages/NewUserPage';
import ImportUsersPage from '@pages/ImportUsersPage';
import UpdateUserPage from '@pages/UpdateUserPage';
import AreaDetailsPage from '../AreaDetailsPage/AreaDetailsPage';
import NotFoundPage from '../NotFoundPage/NotFoundPage';
import AdminConfiguration from '../AdminConfiguration/AdminConfiguration';
import UserProfilePage from '../UserProfilePage/UserProfilePage';
import UsersListPage from '../UsersListPage/UsersListPage';
import ActivityDetailsPage from '../ActivityDetailsPage';

function AdminIndexPage() {
  return (
    <PageContainer>
      <Routes>
        <Route path="/" element={<AdminProfilePage />} />
        <Route path="/newUser" element={<NewUserPage />} />
        <Route path="/importUsers" element={<ImportUsersPage />} />
        <Route path="/area/:idArea/editar" element={<NewAreaPage />} />
        <Route path="/area/:idArea/*" element={<AreaDetailsPage adminPrivileges />} />
        <Route path="/area/nuevo" element={<NewAreaPage />} />
        <Route path="/area" element={<AreasListPage />} />
        <Route path="/config/*" element={<AdminConfiguration />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/usuario/:userId" element={<UserProfilePage />} />
        <Route path="/usuario/:userId/editar" element={<UpdateUserPage />} />
        <Route path="/usuarios" element={<UsersListPage />} />
        <Route path="/actividad/:idActividad/*" element={<ActivityDetailsPage />} />
      </Routes>
    </PageContainer>
  );
}

export default AdminIndexPage;
