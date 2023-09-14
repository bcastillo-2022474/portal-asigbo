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
import ActivityTable from '@components/ActivityTable';
import TabMenu from '@components/TabMenu';
import BackTitle from '@components/BackTitle';
import {
  AiTwotoneEdit as EditIcon,
  AiFillDelete as DeleteIcon,
  AiFillLock as BlockIcon,
  AiFillUnlock as UnblockIcon,
} from 'react-icons/ai';
import OptionsButton from '@components/OptionsButton';
import SuccessNotificationPopUp from '@components/SuccessNotificationPopUp';
import ErrorNotificationPopUp from '@components/ErrorNotificationPopUp';
import ConfirmationPopUp from '@components/ConfirmationPopUp';
import usePopUp from '@hooks/usePopUp';
import useActivitiesByArea from '../../hooks/useActivitiesByArea';
import styles from './AreaDetailsPage.module.css';
import useToogle from '../../hooks/useToogle';

function AreaDetailsPage({ adminPrivileges }) {
  const {
    callFetch: fetchAreaData, result: area, loading, error,
  } = useFetch();
  const [content, setContent] = useState([[]]);
  const [loadingInfo, setLoadingInfo] = useState(true);

  // Fetch utilizado para eliminar, habilitar o deshabilitar eje
  const {
    callFetch: fetchAlterArea,
    result: alterAreaResult,
    loading: alterAreaLoading,
    error: alterAreaError,
  } = useFetch();
  const { idArea } = useParams();
  const token = useParams();
  const {
    info: activitiesByArea,
    loading: loadingActivities,
    error: errorActivities,
  } = useActivitiesByArea(idArea);

  useEffect(() => {
    if ((loadingActivities || !activitiesByArea) && !errorActivities) {
      setLoadingInfo(true);
    } else {
      setLoadingInfo(false);
    }
  }, [loadingActivities]);

  const navigate = useNavigate();

  const [iconError, setIconError] = useState(false);
  // true: acción de eliminar, false: acción de habilitar o deshabilitar
  const [isDeleting, setIsDeleting] = useState(false);
  // true: el área posee un estado habilitado, false: inhabilitado
  const [isAreaEnabled, toogleAreaEnabled, setIsAreaEnabled] = useToogle();

  const [isSuccessOpen, openSuccess, closeSuccess] = usePopUp();
  const [isErrorOpen, openError, closeError] = usePopUp();
  const [isConfirmatonOpen, openConfirmaton, closeConfirmaton] = usePopUp();

  useEffect(() => {
    fetchAreaData({ uri: `${serverHost}/area/${idArea}`, headers: { authorization: token } });
  }, []);

  useEffect(() => {
    // establecer si el área está bloqueada al inicio
    if (area) setIsAreaEnabled(!area.blocked);
  }, [area]);

  useEffect(() => {
    if (alterAreaResult) openSuccess();

    if (!isDeleting) toogleAreaEnabled(); // La acción modificó estado de habilitado
  }, [alterAreaResult]);

  useEffect(() => {
    if (alterAreaError) openError();
  }, [alterAreaError]);

  // Efecto que maneja las actividades comunes y completadas.
  useEffect(() => {
    let newArr = [];
    const completed = [];
    if (activitiesByArea) {
      activitiesByArea.forEach((value) => {
        if (value.completed) {
          completed.push(value);
        }
      });

      newArr = activitiesByArea.map((value) => {
        const temp = value;

        if (value && value.date) {
          const [dateOnly] = value.registrationEndDate.split('T');
          temp.registrationEndDate = dateOnly;
        }
        return temp;
      });
    }
    setContent(newArr);
  }, [activitiesByArea]);
  const handleEditOptionClick = () => navigate('editar');

  const handleDeleteOptionClick = () => {
    openConfirmaton(); // abre ventana de confirmación
    setIsDeleting(true); // especifica que la acción es de eliminar
  };

  const handleEnableOptionClick = () => {
    // abrir ventana de confirmación y especificar que no se va a eliminar
    // La variable isAreaEnabled especifica la acción a realizar:
    // true: está habilitada y por lo tanto se va a deshabilitar con esta acción y viceversa
    openConfirmaton();
    setIsDeleting(false);
  };

  const redirectOnDeleteSuccess = () => navigate('/area');

  const handleConfirmation = (value) => {
    // recibe el valor de la confirmación y ejecuta acción correspondiente
    if (!value) return;

    const uri = isDeleting
      ? `${serverHost}/area/${idArea}`
      : `${serverHost}/area/${idArea}/${isAreaEnabled ? 'disable' : 'enable'}`;

    const method = isDeleting ? 'DELETE' : 'PATCH';

    fetchAlterArea({
      uri,
      method,
      headers: { authorization: token },
      parse: false,
    });
  };

  return (
    <>
      {(loading || alterAreaLoading) && <LoadingView />}
      {area && (
        <div className={styles.areaDetailsPage}>
          <BackTitle title="Eje de ASIGBO" href="/area" className={styles.pageHeader}>
            {adminPrivileges && (
              <div className={styles.buttonsContainer}>
                <OptionsButton
                  options={[
                    { icon: <EditIcon />, text: 'Editar', onClick: handleEditOptionClick },
                    {
                      icon: isAreaEnabled ? <BlockIcon /> : <UnblockIcon />,
                      text: isAreaEnabled ? 'Deshabilitar' : 'Habilitar',
                      onClick: handleEnableOptionClick,
                    },
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
            <Route
              path="/actividades"
              element={(
                <>
                  <h3 className={styles.sectionTitle}>Listado de Actividades</h3>
                  <ActivityTable data={content} loading={loadingInfo} listingType="byArea" />
                </>
              )}
            />
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
              este eje de ASIGBO? Esta es una acción permanente que no podrá ser revertida.
            </>
          ) : (
            <>
              ¿Estás seguro/a de
              <b>{isAreaEnabled ? ' deshabilitar ' : ' habilitar '}</b>
              este eje de ASIGBO? Esta acción sí puede ser revertida, sin embargo, puede resultar en
              comportamientos inesperados para los usuarios.
            </>
          )
        }
      />

      <SuccessNotificationPopUp
        close={closeSuccess}
        isOpen={isSuccessOpen}
        callback={isDeleting ? redirectOnDeleteSuccess : null}
        text={
          isDeleting
            ? 'El eje de ASIGBO ha sido eliminado de forma exitosa.'
            : `El eje de ASIGBO ha sido ${
              isAreaEnabled ? 'habilitado' : 'deshabilitado'
            } de forma exitosa.`
        }
      />

      <ErrorNotificationPopUp
        close={closeError}
        isOpen={isErrorOpen}
        text={alterAreaError?.message}
      />
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
