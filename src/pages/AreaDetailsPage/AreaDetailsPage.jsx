import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  NavLink, Route, Routes, useParams,
} from 'react-router-dom';
import { BiSolidImage as ImageIcon } from 'react-icons/bi';
import { serverHost } from '@/config';
import useFetch from '@hooks/useFetch';
import LoadingView from '@components/LoadingView';
import NotFoundPage from '@pages/NotFoundPage';
import consts from '@helpers/consts';
import UserTable from '@components/UserTable';
import Button from '@components/Button';
import TabMenu from '@components/TabMenu';
import BackTitle from '@components/BackTitle';
import styles from './AreaDetailsPage.module.css';

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
          <BackTitle title="Eje de ASIGBO" href="/area" className={styles.pageHeader}>
            {adminPrivileges && (
              <div className={styles.buttonsContainer}>
                <NavLink to="editar"><Button text="Editar" /></NavLink>
                <Button text="Eliminar" red />
              </div>
            )}
          </BackTitle>

          <div className={styles.nameContainer}>
            {!iconError ? (
              <img
                className={styles.areaIcon}
                src={`${serverHost}/${consts.imageRoute.area}/${area.id}`}
                alt={area.name}
                onError={() => setIconError(true)}
              />
            ) : (
              <ImageIcon className={styles.defaultIcon} />
            )}
            <span>{area.name}</span>
          </div>

          <TabMenu
            className={styles.tabMenu}
            options={[
              { text: 'Encargados', href: '' },
              { text: 'Actividades', href: 'actividades' },
            ]}
          />
          <Routes>
            <Route
              path="/"
              element={(
                <>
                  <h3 className={styles.sectionTitle}>Encargados</h3>
                  <UserTable users={area.responsible.sort((a, b) => a.promotion - b.promotion)} />
                </>
              )}
            />
            <Route path="/actividades" element={<span>hola</span>} />
          </Routes>
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
