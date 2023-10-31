import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link, Routes, Route } from 'react-router-dom';
import styles from './UserProfilePage.module.css';
import useFetch from '../../hooks/useFetch';
import useToken from '../../hooks/useToken';
import { serverHost } from '../../config';
import LoadingView from '../../components/LoadingView';
import NotFoundPage from '../NotFoundPage';
import AdminButton from '../../components/AdminButton/AdminButton';
import ProfileHeader from '../../components/ProfileHeader/ProfileHeader';
import ProfileUserData from '../../components/ProfileUserData/ProfileUserData';
import TabMenu from '../../components/TabMenu/TabMenu';

import UserServiceHoursSummaryPage from '../UserServiceHoursSummaryPage/UserServiceHoursSummaryPage';

/**
 *
 * @param {String} idUser: id del usuario a mostrar.
 * @returns
 */
function UserProfilePage({ idUser }) {
  const {
    callFetch: fetchUserData, result: user, loading, error,
  } = useFetch();

  const token = useToken();

  useEffect(() => {
    fetchUserData({ uri: `${serverHost}/user/${idUser}`, headers: { authorization: token } });
  }, []);

  return (
    <>
      {user && (
      <div className={styles.simpleUserProfilePage}>

        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Perfil del becado</h1>
          <Link to="editar">
            <AdminButton />
          </Link>
        </header>

        <ProfileHeader
          idUser={user.id}
          name={user.name}
          lastname={user.lastname}
          hasImage={user.hasImage}
          promotion={user.promotion}
        />

        <TabMenu
          options={[{ text: 'Datos de usuario', href: '' },
            { text: 'Horas de servicio', href: 'horas' }]}
          className={styles.tabMenu}
        />

        <Routes>

          <Route
            path="/"
            element={(
              <ProfileUserData
                email={user.email}
                campus={user.campus}
                career={user.career}
                sex={user.sex}
                university={user.university}
              />
          )}
          />

          <Route path="/horas" element={<UserServiceHoursSummaryPage userId={idUser} />} />
        </Routes>

      </div>
      )}
      {loading && <LoadingView />}
      {error && <NotFoundPage />}
    </>
  );
}

export default UserProfilePage;

UserProfilePage.propTypes = {
  idUser: PropTypes.string.isRequired,
};

UserProfilePage.defaultProps = {
};
