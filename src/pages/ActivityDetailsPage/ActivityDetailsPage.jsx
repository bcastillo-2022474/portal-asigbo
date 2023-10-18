/* eslint-disable no-nested-ternary */
import React, { useEffect, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import PropTypes from 'prop-types';
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
import useLoggedInfo from '../../hooks/useLoggedInfo';
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

function ActivityDetailsPage() {
  const navigate = useNavigate();
  const { idActividad: activityID } = useParams();
  const [action, setAction] = useState('');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isResponsible, setIsResponsible] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isAction, setIsAction] = useState(false);
  const [fetchImage, setFetchImage] = useState(false);
  const [isSuccessOpen, openSuccess, closeSuccess] = usePopUp();
  const [isConfirmatonOpen, openConfirmaton, closeConfirmaton] = usePopUp();
  const [isErrorOpen, openError, closeError] = usePopUp();
  const [isDisabled, setDisabled] = useState(false);

  const {
    info: user,
    error: userError,
    loading: loadingUser,
  } = useLoggedInfo();

  const {
    info: activity,
    error: activityError,
    loading: loadingActivity,
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
    if (isAction) {
      if (action === 'DISABLE' && enDisActivity) {
        openSuccess();
        setIsAction(!isAction);
        setDisabled(!isDisabled);
      } else if (action === 'DELETE' && deletedActivity) {
        setIsAction(!isAction);
        navigate('/');
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
    if (user) {
      if (user.role) {
        let roles = [];
        roles = user.role;
        const foundActivityRespons = roles.find((value) => String(value).includes('activityResponsible'));
        const foundAreaRespons = roles.find((value) => String(value).includes('asigboAreaResponsible'));
        if (foundActivityRespons || foundAreaRespons) {
          setIsResponsible(true);
        } else {
          setIsResponsible(false);
        }
      }
    }
  }, [user, activity]);

  useEffect(() => {
    if (userError || activityError) {
      setNotFound(true);
    }
  }, [userError, activityError]);

  useEffect(() => {
    if (activity) {
      setFetchImage(activity.hasBanner);
      setDisabled(activity.blocked);
    }
  }, [activity]);

  useEffect(() => {
    if ((loadingUser || !user) && !userError) {
      setLoading(true);
    } else if ((loadingActivity || !activity) && !activityError) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [loadingUser, loadingActivity]);

  const handleDeleteActivity = () => {
    setAction('DELETE');
    openConfirmaton();
  };

  const handleDisableActivity = () => {
    setAction('DISABLE');
    openConfirmaton();
  };

  const handleEditActivity = () => {
    // eslint-disable-next-line no-console
    console.log('Edición');
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

  return notFound ? (
    <NotFound />
  ) : loading ? (
    <LoadingView />
  ) : (
    <div className={styles.main}>
      {loadingEnDis || loadingDelete ? <LoadingView /> : undefined}
      <div className={styles.activityHeader}>
        <h1>{activity ? activity.name : 'Actividad'}</h1>
        {isResponsible ? (
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
        ) : (
          ''
        )}
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
          element={<ActivityResponsibles idActivity={activityID} />}
        />
        <Route
          path="/participantes"
          element={<ActivityParticipantsPage idActivity={activityID} />}
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

      <SuccessNotificationPopUp close={closeSuccess} isOpen={isSuccessOpen} text={`La actividad ha sido ${isDisabled ? 'deshabilitada' : 'habilitada'} de forma exitosa`} />

      <ErrorNotificationPopUp
        close={closeError}
        isOpen={isErrorOpen}
        text={enDisError ? enDisError.message : (deleteError ? deleteError.message : '')}
      />
    </div>
  );
}

ActivityDetailsPage.propTypes = {};

export default ActivityDetailsPage;
