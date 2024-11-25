import React from 'react';
import { useParams } from 'react-router-dom';
import getTokenPayload from '../../helpers/getTokenPayload';
import consts from '../../helpers/consts';
import SimpleUserProfilePage from '../SimpleUserProfilePage/SimpleUserProfilePage';
import useToken from '../../hooks/useToken';
import UserProfilePage from '../UserProfilePage/UserProfilePage';

/**
 * Componente que se encarga de decidir cuál página de perfil de usuario va a desplegar.
 * En el caso de admin se debe mostrar el perfil completo (si no es el propio usuario en sesión),
 * de lo contrario se debe mostrar el perfil básico.
 */
function UserProfileIndexPage() {
  const { userId } = useParams();
  const token = useToken();

  const sessionUser = token ? getTokenPayload(token) : null;

  return (
    <>
      {
        (() => {
          if (sessionUser.role.includes(consts.roles.admin) && userId !== sessionUser.id) {
            return <UserProfilePage idUser={userId} />;
          }
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
