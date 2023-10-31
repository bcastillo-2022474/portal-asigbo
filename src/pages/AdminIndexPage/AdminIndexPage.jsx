import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AreasListPage from '@pages/AreasListPage';
import NewAreaPage from '@pages/NewAreaPage';
import NewActivityPage from '@pages/NewActivityPage';
import PageContainer from '@components/PageContainer/PageContainer';
import NewUserPage from '@pages/NewUserPage';
import ImportUsersPage from '@pages/ImportUsersPage';
import UpdateUserPage from '@pages/UpdateUserPage';
import ActivityAssignmentDetailsPage from '@pages/ActivityAssignmentDetailsPage';
import AreaDetailsPage from '../AreaDetailsPage/AreaDetailsPage';
import NotFoundPage from '../NotFoundPage/NotFoundPage';
import AdminConfiguration from '../AdminConfiguration/AdminConfiguration';
import UsersListPage from '../UsersListPage/UsersListPage';
import ActivityDetailsPage from '../ActivityDetailsPage';
import HomePage from '../HomePage/HomePage';
import WorkPanelPage from '../WorkPanelPage/WorkPanelPage';
import SimpleUserProfilePage from '../SimpleUserProfilePage/SimpleUserProfilePage';
import useToken from '../../hooks/useToken';
import getTokenPayload from '../../helpers/getTokenPayload';
import UpdateUserInRoutePage from '../UpdateUserInRoutePage/UpdateUserInRoutePage';
import UserProfileIndexPage from '../UserProfileIndexPage/UserProfileIndexPage';
import ResponsibleActivitiesPage from '../ResponsibleActivitiesPage';

function AdminIndexPage() {
  const token = useToken();
  const user = token ? getTokenPayload(token) : null;
  return (
    <PageContainer>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/usuario/nuevo" element={<NewUserPage />} />
        <Route path="/usuario/importar" element={<ImportUsersPage />} />
        <Route path="/area/:idArea/editar" element={<NewAreaPage />} />
        <Route path="/area/:idArea/newActivity" element={<NewActivityPage />} />
        <Route path="/area/:idArea/*" element={<AreaDetailsPage adminPrivileges />} />
        <Route path="/area/nuevo" element={<NewAreaPage />} />
        <Route path="/area" element={<AreasListPage />} />
        <Route path="/config/*" element={<AdminConfiguration />} />
        <Route path="/usuario/:userId/editar" element={<UpdateUserInRoutePage />} />
        <Route path="/usuario/:userId/*" element={<UserProfileIndexPage />} />
        <Route path="/usuario" element={<UsersListPage />} />
        <Route path="/actividad/:activityId/asignacion/:userId" element={<ActivityAssignmentDetailsPage />} />
        <Route path="/actividad/:idActividad/*" element={<ActivityDetailsPage />} />
        <Route path="/actividad/encargadas" element={<ResponsibleActivitiesPage />} />
        <Route path="/panel" element={<WorkPanelPage />} />
        <Route path="/perfil" element={<SimpleUserProfilePage idUser={user.id} />} />
        <Route path="/perfil/editar" element={<UpdateUserPage userId={user.id} />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </PageContainer>
  );
}

export default AdminIndexPage;
