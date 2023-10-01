import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AreasListPage from '@pages/AreasListPage';
import NewAreaPage from '@pages/NewAreaPage';
import PageContainer from '@components/PageContainer/PageContainer';
import NewUserPage from '@pages/NewUserPage';
import ImportUsersPage from '@pages/ImportUsersPage';
import UpdateUserPage from '@pages/UpdateUserPage';
import ActivityAssignmentDetailsPage from '@pages/ActivityAssignmentDetailsPage';
import AreaDetailsPage from '../AreaDetailsPage/AreaDetailsPage';
import NotFoundPage from '../NotFoundPage/NotFoundPage';
import AdminConfiguration from '../AdminConfiguration/AdminConfiguration';
import UserProfilePage from '../UserProfilePage/UserProfilePage';
import UsersListPage from '../UsersListPage/UsersListPage';
import ActivityDetailsPage from '../ActivityDetailsPage';
import HomePage from '../HomePage/HomePage';
import WorkPanelPage from '../WorkPanelPage/WorkPanelPage';

function AdminIndexPage() {
  return (
    <PageContainer>
      <Routes>
        <Route path="/" element={<HomePage />} />
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
        <Route path="/usuario" element={<UsersListPage />} />
        <Route path="/actividad/:activityId/asignacion/:userId" element={<ActivityAssignmentDetailsPage />} />
        <Route path="/actividad/:idActividad/*" element={<ActivityDetailsPage />} />
        <Route path="/panel" element={<WorkPanelPage />} />
      </Routes>
    </PageContainer>
  );
}

export default AdminIndexPage;
