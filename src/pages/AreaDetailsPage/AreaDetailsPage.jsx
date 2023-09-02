import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { BiSolidImage as ImageIcon } from 'react-icons/bi';
import styles from './AreaDetailsPage.module.css';
import { serverHost } from '../../config';
import useFetch from '../../hooks/useFetch';
import LoadingView from '../../components/LoadingView/LoadingView';
import NotFoundPage from '../NotFoundPage/NotFoundPage';
import consts from '../../helpers/consts';
import UserTable from '../../components/UserTable/UserTable';
import Button from '../../components/Button/Button';

function AreaDetailsPage({ adminPrivileges }) {
  const {
    callFetch: fetchAreaData, result: area, loading, error,
  } = useFetch();

  const { idArea } = useParams();
  const token = useParams();

  const [iconError, setIconError] = useState(false);

  useEffect(() => {
    fetchAreaData({ uri: `${serverHost}/area/${idArea}`, headers: { authorization: token } });
  }, []);

  return (
    <>
      {loading && <LoadingView />}
      {area && (
      <div className={styles.areaDetailsPage}>

        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Eje de ASIGBO</h1>
          {adminPrivileges && (
          <div className={styles.buttonsContainer}>
            <Button text="Editar" />
            <Button text="Eliminar" red />
          </div>
          )}
        </header>

        <div className={styles.nameContainer}>
          {!iconError ? (
            <img
              className={styles.areaIcon}
              src={`${serverHost}/${consts.imageRoute.area}/${area.id}`}
              alt={area.name}
              onError={() => setIconError(true)}
            />
          ) : <ImageIcon className={styles.defaultIcon} />}
          <span>{area.name}</span>
        </div>

        <h3 className={styles.sectionTitle}>Encargados</h3>
        <UserTable users={area.responsible.sort((a, b) => a.promotion - b.promotion)} />
      </div>
      )}
      {error && <NotFoundPage />}
    </>
  );
}

export default AreaDetailsPage;

AreaDetailsPage.propTypes = {
  adminPrivileges: PropTypes.bool,
};

AreaDetailsPage.defaultProps = {
  adminPrivileges: false,
};
