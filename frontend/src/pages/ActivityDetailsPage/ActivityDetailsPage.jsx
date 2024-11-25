/* eslint-disable no-nested-ternary */
import React, { useEffect, useState } from 'react';
import {
  useParams, Route, Routes, useNavigate,
} from 'react-router-dom';
import {
  AiFillDelete as DeleteIcon,
  AiFillLock as DisableIcon,
  AiFillUnlock as EnableIcon,
  AiTwotoneEdit as EditIcon,
} from 'react-icons/ai';
import styles from './ActivityDetailsPage.module.css';
import { serverHost } from '../../config';
import useActivityByID from '../../hooks/useActivityByID';
import OptionsButton from '../../components/OptionsButton';
import TabMenu from '../../components/TabMenu';
import ActivityDetails from '../../components/ActivityDetails';
import LoadingView from '../../components/LoadingView';
import NotFound from '../NotFoundPage';
import ActivityResponsibles from '../../components/ActivityResponsibles';
import ActivityParticipantsPage from '../ActivityParticipantsPage/ActivityParticipantsPage';
import ConfirmationPopUp from '../../components/ConfirmationPopUp/ConfirmationPopUp';
import usePopUp from '../../hooks/usePopUp';
import ErrorNotificationPopUp from '../../components/ErrorNotificationPopUp/ErrorNotificationPopUp';
import SuccessNotificationPopUp from '../../components/SuccessNotificationPopUp/SuccessNotificationPopUp';
import useSessionData from '../../hooks/useSessionData';
import consts from '../../helpers/consts';
import AssignToActivityButton from '../../components/AssignToActivityButton/AssignToActivityButton';
import useCount from '../../hooks/useCount';

function ActivityDetailsPage() {
  const navigate = useNavigate();
  const { idActividad: activityID } = useParams();

  const [activity, setActivity] = useState(null);
  const [action, setAction] = useState('');
  const [isActivityOwner, setIsActivityOwner] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isAction, setIsAction] = useState(false);
  const [fetchImage, setFetchImage] = useState(false);
  const [isDisabled, setDisabled] = useState(false);

  const [isSuccessOpen, openSuccess, closeSuccess] = usePopUp();
  const [isConfirmatonOpen, openConfirmaton, closeConfirmaton] = usePopUp();
  const [isErrorOpen, openError, closeError] = usePopUp();

  const sessionUser = useSessionData();

  const { count: updateActivityTrigger, next: fireUpdateActivityTrigger } = useCount();

  const {
    info: activityData,
    error: activityError,
    loading: loadingActivity,
    getActivityByID,
  } = useActivityByID(activityID);

  const {
    info: enDisActivity,
    error: enDisError,
    loading: loadingEnDis,
    disableActivityByID,
  } = useActivityByID(activityID);

  const {
    info: deletedActivity,
    error: deleteError,
    deleteActivityByID,
    loading: loadingDelete,
  } = useActivityByID(activityID);

  useEffect(() => {
    getActivityByID(); // Obtener datos de id
  }, [updateActivityTrigger]);

  useEffect(() => {
    // Al obtener datos de actividad
    if (activityData) setActivity(activityData);
  }, [activityData]);

  useEffect(() => {
    if (isAction) {
      if (action === 'DISABLE' && enDisActivity) {
        openSuccess();
        setIsAction(!isAction);
        setDisabled(!isDisabled);
      } else if (action === 'DELETE' && deletedActivity) {
        setIsAction(!isAction);
        openSuccess();
      }
    }
  }, [enDisActivity, isAction, action, deletedActivity]);

  useEffect(() => {
    if (enDisError || deleteError) {
      openError();
      setAction('');
      setIsAction(false);
    }
  }, [enDisError, deleteError]);

  useEffect(() => {
    if (isActivityOwner) return;
    const isAdmin = sessionUser?.role?.includes(consts.roles.admin);
    const isAreaResposible = activity?.asigboArea?.isResponsible;
    setIsActivityOwner(isAdmin || isAreaResposible);
  }, [sessionUser, activity]);

  useEffect(() => {
    if (activity) {
      setFetchImage(activity.hasBanner);
      setDisabled(activity.blocked);
    }
  }, [activity]);

  const handleDeleteActivity = () => {
    setAction('DELETE');
    openConfirmaton();
  };

  const handleDisableActivity = () => {
    setAction('DISABLE');
    openConfirmaton();
  };

  const handleEditActivity = () => {
    navigate('editar');
  };

  const handleAction = async (value) => {
    if (value) {
      if (action === 'DELETE') {
        setIsAction(true);
        deleteActivityByID();
      } else {
        setIsAction(true);
        disableActivityByID(isDisabled);
      }
    }
  };

  const getSuccessNotificationText = () => {
    if (action === 'DISABLE') return `La actividad ha sido ${isDisabled ? 'deshabilitada' : 'habilitada'} de forma exitosa`;
    return 'La actividad ha sido eliminada de forma exitosa';
  };

  const successCallback = () => {
    if (action === 'DELETE') navigate(`/area/${activity.asigboArea.id}`);
  };

  return (
    <>
      {activityError && <NotFound />}
      {(loadingActivity) && <LoadingView />}

      {activity && (
      <div className={styles.main}>
        {loadingEnDis || loadingDelete ? <LoadingView /> : undefined}
        <div className={styles.activityHeader}>

          <h1>{activity ? activity.name : 'Actividad'}</h1>

          <div className={styles.headerButtonsContainer}>
            {activity?.registrationAvailableForUser && !activity?.userAssignment
              && (
              <AssignToActivityButton
                idActivity={activity?.id}
                unassignButton={activity?.userAssignment !== undefined
                  && activity?.userAssignment !== null}
                successCallback={fireUpdateActivityTrigger}
              />
              )}

            {isActivityOwner && (
            <OptionsButton
              className={styles.optionsButton}
              label="Acciones"
              options={[
                {
                  icon: <DeleteIcon />,
                  text: 'Eliminar',
                  onClick: handleDeleteActivity,
                },
                {
                  icon: isDisabled ? <EnableIcon /> : <DisableIcon />,
                  text: isDisabled ? 'Habilitar' : 'Deshabilitar',
                  onClick: handleDisableActivity,
                },
                {
                  icon: <EditIcon />,
                  text: 'Editar',
                  onClick: handleEditActivity,
                },
              ]}
            />
            )}
          </div>
        </div>
        {!imageError && fetchImage ? (
          <img
            src={`${serverHost}/image/activity/${activity ? activity.id : null}`}
            alt="placeholder"
            className={styles.banner}
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          ''
        )}
        <TabMenu
          className={styles.tabMenu}
          options={[
            { text: 'Datos de actividad', href: '' },
            { text: 'Encargados', href: 'encargados' },
            { text: 'Participantes', href: 'participantes' },
          ]}
        />
        <Routes>
          <Route path="/" element={<ActivityDetails data={activity} />} />
          <Route
            path="/encargados"
            element={<ActivityResponsibles activityData={activity} />}
          />
          <Route
            path="/participantes"
            element={<ActivityParticipantsPage activityData={activity} />}
          />
        </Routes>

        <ConfirmationPopUp
          close={closeConfirmaton}
          isOpen={isConfirmatonOpen}
          callback={handleAction}
          body={
          action === 'DELETE' ? (
            <>
              ¿Estás seguro/a de
              <b> eliminar </b>
              esta actividad?
              <br />
              <br />
              <i>
                Esta es una acción permanente, por lo que no podrá ser
                revertida.
              </i>
            </>
          ) : (
            <>
              ¿Estás seguro/a de
              <b>{isDisabled ? ' habilitar ' : ' deshabilitar '}</b>
              esta actividad?
            </>
          )
        }
        />

        <SuccessNotificationPopUp
          close={closeSuccess}
          isOpen={isSuccessOpen}
          text={getSuccessNotificationText()}
          callback={successCallback}
        />

        <ErrorNotificationPopUp
          close={closeError}
          isOpen={isErrorOpen}
          text={enDisError ? enDisError.message : (deleteError ? deleteError.message : '')}
        />
      </div>
      )}
    </>
  );
}

ActivityDetailsPage.propTypes = {};

export default ActivityDetailsPage;
