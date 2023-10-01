import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styles from './SimpleUserProfilePage.module.css';
import ProfilePicture from '../../components/ProfilePicture/ProfilePicture';
import useFetch from '../../hooks/useFetch';
import useToken from '../../hooks/useToken';
import { serverHost } from '../../config';
import LoadingView from '../../components/LoadingView';
import NotFoundPage from '../NotFoundPage';
import DataField from '../../components/DataField/DataField';
import AdminButton from '../../components/AdminButton/AdminButton';

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

  useEffect(() => {
    fetchUserData({ uri: `${serverHost}/user/${idUser}`, headers: { authorization: token } });
  }, []);

  return (
    <>
      {user && (
      <div className={styles.simpleUserProfilePage}>

        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Perfil del becado</h1>
          <Link to="/">
            <AdminButton />
          </Link>
        </header>

        <div className={styles.profileHeader}>

          <ProfilePicture uri={`${serverHost}/image/user/${user.id}`} />

          <div className={styles.headerDataContainer}>
            <span className={styles.userName}>{`${user.name} ${user.lastname}`}</span>
            <span className={styles.userPromotion}>{`Promoción ${user.promotion}`}</span>
          </div>
        </div>

        <div className={styles.mainDataContainer}>
          <DataField className={styles.dataField} label="Código del becado">{user.code}</DataField>
          {user.email && <DataField className={styles.dataField} label="Email">{user.email}</DataField>}
          <DataField className={styles.dataField} label="Carrera">{user.career}</DataField>
          <DataField className={styles.dataField} label="Sexo">{user.sex}</DataField>
        </div>
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
