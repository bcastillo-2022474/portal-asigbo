import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Route, Routes, useNavigate, useParams,
} from 'react-router-dom';
import { BiSolidImage as ImageIcon } from 'react-icons/bi';
import { serverHost } from '@/config';
import useFetch from '@hooks/useFetch';
import LoadingView from '@components/LoadingView';
import NotFoundPage from '@pages/NotFoundPage';
import consts from '@helpers/consts';
import UserTable from '@components/UserTable';
import TabMenu from '@components/TabMenu';
import BackTitle from '@components/BackTitle';
import { AiTwotoneEdit as EditIcon, AiFillDelete as DeleteIcon } from 'react-icons/ai';
import OptionsButton from '@components/OptionsButton';
import SuccessNotificationPopUp from '@components/SuccessNotificationPopUp';
import ErrorNotificationPopUp from '@components/ErrorNotificationPopUp';
import ConfirmationPopUp from '@components/ConfirmationPopUp';
import usePopUp from '@hooks/usePopUp';
import styles from './AreaDetailsPage.module.css';

function AreaDetailsPage({ adminPrivileges }) {
  const {
    callFetch: fetchAreaData, result: area, loading, error,
  } = useFetch();

  const {
    callFetch: fetchDeleteArea,
    result: deleteResult,
    loading: deleteLoading,
    error: deleteError,
  } = useFetch();

  const { idArea } = useParams();
  const token = useParams();

  const navigate = useNavigate();

  const [iconError, setIconError] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isSuccessOpen, openSuccess, closeSuccess] = usePopUp();
  const [isErrorOpen, openError, closeError] = usePopUp();
  const [isConfirmatonOpen, openConfirmaton, closeConfirmaton] = usePopUp();

  useEffect(() => {
    fetchAreaData({ uri: `${serverHost}/area/${idArea}`, headers: { authorization: token } });
  }, []);

  useEffect(() => {
    if (deleteResult) openSuccess();
  }, [deleteResult]);

  useEffect(() => {
    if (deleteError) openError();
  }, [deleteError]);

  const handleEditOptionClick = () => navigate('editar');

  const handleDeleteOptionClick = () => {
    openConfirmaton(); // abre ventana de confirmación
    setIsDeleting(true); // especifica que la acción es de eliminar
  };

  const redirectOnDeleteSuccess = () => navigate('/area');

  const handleConfirmation = (value) => {
    // recibe el valor de la confirmación y ejecuta acción correspondiente
    if (!value) return;

    const uri = isDeleting ? `${serverHost}/area/${idArea}` : '';

    setIsDeleting(true);
    fetchDeleteArea({
      uri,
      method: 'DELETE',
      headers: { authorization: token },
      parse: false,
    });
  };

  return (
    <>
      {(loading || deleteLoading) && <LoadingView />}
      {area && (
        <div className={styles.areaDetailsPage}>
          <BackTitle title="Eje de ASIGBO" href="/area" className={styles.pageHeader}>
            {adminPrivileges && (
              <div className={styles.buttonsContainer}>
                <OptionsButton
                  options={[
                    { icon: <EditIcon />, text: 'Editar', onClick: handleEditOptionClick },
                    { icon: <DeleteIcon />, text: 'Eliminar', onClick: handleDeleteOptionClick },
                  ]}
                />
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

      <ConfirmationPopUp
        close={closeConfirmaton}
        isOpen={isConfirmatonOpen}
        callback={handleConfirmation}
        body={
          isDeleting ? (
            <>
              ¿Estás seguro/a de
              <b> eliminar </b>
              este eje de ASIGBO? Esta es una acción permanente que
              no podrá ser revertida.
            </>
          ) : (
            <>
              ¿Estás seguro/a de
              <b> deshabilitar </b>
              este eje de ASIGBO? Esta acción sí puede ser
              revertida, sin embargo, puede resultar en comportamientos inesperados para los
              usuarios.
            </>
          )
        }
      />

      <SuccessNotificationPopUp
        close={closeSuccess}
        isOpen={isSuccessOpen}
        callback={redirectOnDeleteSuccess}
        text={
          isDeleting
            ? 'El eje de ASIGBO ha sido eliminado de forma exitosa.'
            : 'El eje de ASIGBO ha sido inhabilitado de forma exitosa.'
        }
      />

      <ErrorNotificationPopUp close={closeError} isOpen={isErrorOpen} text={deleteError?.message} />
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
