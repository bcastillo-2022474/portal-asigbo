import React from 'react';
import { Route, Routes } from 'react-router-dom';
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

function UserIndexPage() {
  const token = useToken();

  const user = token ? getTokenPayload(token) : null;

  return (
    <PageContainer>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/panel" element={<WorkPanelPage />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/actividad/:idActividad/*" element={<ActivityDetailsPage />} />
        <Route path="/perfil" element={<SimpleUserProfilePage idUser={user.id} />} />
        <Route path="/perfil/editar" element={<UpdateUserPage userId={user.id} />} />

        {
          user?.role.includes(consts.roles.asigboAreaResponsible)
          && (
          <>
            <Route path="/area" element={<AreasListPage />} />
            <Route path="/area/:idArea/*" element={<AreaDetailsPage />} />
          </>
          )
        }
      </Routes>
    </PageContainer>
  );
}

export default UserIndexPage;
