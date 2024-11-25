import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AvailableActivitiesPage from '@pages/AvailableActivitiesPage';
import PageContainer from '../../components/PageContainer/PageContainer';
import HomePage from '../HomePage/HomePage';
import NotFoundPage from '../NotFoundPage';
import WorkPanelPage from '../WorkPanelPage/WorkPanelPage';
import useToken from '../../hooks/useToken';
import getTokenPayload from '../../helpers/getTokenPayload';
import consts from '../../helpers/consts';
import AreasListPage from '../AreasListPage/AreasListPage';
import AreaDetailsPage from '../AreaDetailsPage/AreaDetailsPage';
import ActivityDetailsPage from '../ActivityDetailsPage';
import SimpleUserProfilePage from '../SimpleUserProfilePage/SimpleUserProfilePage';
import UpdateUserPage from '../UpdateUserPage/UpdateUserPage';
import UserProfileIndexPage from '../UserProfileIndexPage/UserProfileIndexPage';
import ResponsibleActivitiesPage from '../ResponsibleActivitiesPage';
import NewActivityPage from '../NewActivityPage/NewActivityPage';
import ActivityAssignmentDetailsPage from '../ActivityAssignmentDetailsPage/ActivityAssignmentDetailsPage';

function UserIndexPage() {
  const token = useToken();

  const user = token ? getTokenPayload(token) : null;
  const isAreaResponsible = user?.role.includes(consts.roles.asigboAreaResponsible);
  const isActivityResponsible = user?.role.includes(consts.roles.activityResponsible);

  return (
    <PageContainer>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/panel" element={<WorkPanelPage />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/actividad/:idActividad/*" element={<ActivityDetailsPage />} />
        <Route path="/perfil" element={<SimpleUserProfilePage idUser={user.id} />} />
        <Route path="/perfil/editar" element={<UpdateUserPage userId={user.id} />} />
        <Route path="/usuario/:userId" element={<UserProfileIndexPage />} />
        <Route path="actividad/encargadas" element={<ResponsibleActivitiesPage />} />
        <Route path="/actividad/disponible/*" element={<AvailableActivitiesPage />} />

        {
          isAreaResponsible
          && (
          <>
            <Route path="/area" element={<AreasListPage />} />
            <Route path="/area/:idArea/*" element={<AreaDetailsPage />} />
            <Route path="/actividad/:idActividad/editar" element={<NewActivityPage />} />
          </>
          )
        }

        {(isAreaResponsible || isActivityResponsible)
        && (
          <Route path="/actividad/:activityId/asignacion/:userId" element={<ActivityAssignmentDetailsPage />} />
        )}

      </Routes>
    </PageContainer>
  );
}

export default UserIndexPage;
