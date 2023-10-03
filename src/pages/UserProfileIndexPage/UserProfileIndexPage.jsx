import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useUserInfo from '../../hooks/useUserInfo';
import LoadingView from '../../components/LoadingView';
import NotFoundPage from '../NotFoundPage';
import getTokenPayload from '../../helpers/getTokenPayload';
import consts from '../../helpers/consts';
import SimpleUserProfilePage from '../SimpleUserProfilePage/SimpleUserProfilePage';
import UserProfilePage from '../UserProfilePage/UserProfilePage';
import useToken from '../../hooks/useToken';

/**
 * Componente que se encarga de decidir cuál página de perfil de usuario va a desplegar.
 * En el caso de admin o encargado del año del usuario, se debe mostrar el perfil completo,
 * de lo contrario se debe mostrar el perfil básico.
 */
function UserProfileIndexPage() {
  const { userId } = useParams();
  const token = useToken();

  const sessionUser = token ? getTokenPayload(token) : null;

  const {
    getUserInfo, info: user, error, loading,
  } = useUserInfo(userId);

  useEffect(() => {
    // eslint-disable-next-line no-debugger
    if (!userId || !sessionUser) return;

    // Si es admin, evitar el obtener datos de usuario de api
    if (sessionUser.role.includes(consts.roles.admin)) return;
    // Si es encargado de año, obtener datos de usuario para verificar si coinciden promociones
    if (sessionUser.role.includes(consts.roles.promotionResponsible)) { getUserInfo(); }
  }, [userId, token]);

  return (
    <>
      {(loading) && <LoadingView />}
      {error && <NotFoundPage />}
      {
        (() => {
          if (sessionUser.role.includes(consts.roles.admin)) {
            return <UserProfilePage userId={userId} />;
          }
          if (!sessionUser.role.includes(consts.roles.promotionResponsible)) {
            return <SimpleUserProfilePage idUser={userId} />;
          }
          if (!user) return null;
          if (user.promotion === sessionUser.promotion) return <UserProfilePage userId={userId} />;
          return <SimpleUserProfilePage idUser={userId} />;
        })()
      }

    </>
  );
}

export default UserProfileIndexPage;

UserProfileIndexPage.propTypes = {

};

UserProfileIndexPage.defaultProps = {

};
