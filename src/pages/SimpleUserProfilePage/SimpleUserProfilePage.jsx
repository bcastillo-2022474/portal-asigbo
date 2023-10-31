import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styles from './SimpleUserProfilePage.module.css';
import useFetch from '../../hooks/useFetch';
import useToken from '../../hooks/useToken';
import { serverHost } from '../../config';
import LoadingView from '../../components/LoadingView';
import NotFoundPage from '../NotFoundPage';
import AdminButton from '../../components/AdminButton/AdminButton';
import getTokenPayload from '../../helpers/getTokenPayload';
import ProfileHeader from '../../components/ProfileHeader/ProfileHeader';
import ProfileUserData from '../../components/ProfileUserData/ProfileUserData';

/**
 *
 * @param {String} idUser: id del usuario a mostrar.
 * @returns
 */
function SimpleUserProfilePage({ idUser }) {
  const {
    callFetch: fetchUserData, result: user, loading, error,
  } = useFetch();

  const token = useToken();
  const sessionUser = token ? getTokenPayload(token) : null;

  useEffect(() => {
    fetchUserData({ uri: `${serverHost}/user/${idUser}`, headers: { authorization: token } });
  }, []);

  return (
    <>
      {user && (
      <div className={styles.simpleUserProfilePage}>

        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Perfil del becado</h1>
          {
            // Validar privilegio de usuario para editar su propio perfil
           sessionUser?.id === user?.id && (
           <Link to="editar">
             <AdminButton />
           </Link>
           )
          }
        </header>

        <ProfileHeader
          idUser={user.id}
          name={user.name}
          lastname={user.lastname}
          hasImage={user.hasImage}
          promotion={user.promotion}
        />

        <ProfileUserData
          email={user.email}
          campus={user.campus}
          career={user.career}
          sex={user.sex}
          university={user.university}
        />
      </div>
      )}
      {loading && <LoadingView />}
      {error && <NotFoundPage />}
    </>
  );
}

export default SimpleUserProfilePage;

SimpleUserProfilePage.propTypes = {
  idUser: PropTypes.string.isRequired,
};

SimpleUserProfilePage.defaultProps = {
};
