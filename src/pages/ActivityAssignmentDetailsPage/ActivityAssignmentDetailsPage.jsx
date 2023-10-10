import React, { useEffect, useState } from 'react';
// import PropTypes from 'prop-types';
import { useParams, useNavigate } from 'react-router-dom';
import useToken from 'antd/es/theme/useToken';
import * as dayjs from 'dayjs';
import { AiFillCheckCircle as CheckIcon, AiFillCloseCircle as RemoveIcon } from 'react-icons/ai';
import { FaUserTimes as RemoveUserIcon } from 'react-icons/fa';
import styles from './ActivityAssignmentDetailsPage.module.css';
import UserPicture from '../../components/UserPicture/UserPicture';
import DataField from '../../components/DataField/DataField';
import useFetch from '../../hooks/useFetch';
import NotFoundPage from '../NotFoundPage/NotFoundPage';
import LoadingView from '../../components/LoadingView/LoadingView';
import { serverHost } from '../../config';
import UserNameLink from '../../components/UserNameLink/UserNameLink';
import Button from '../../components/Button/Button';
import InputNumber from '../../components/InputNumber/InputNumber';
import useForm from '../../hooks/useForm';
import aditionalServiceHoursSchema from './aditionalServiceHoursSchema';
import BackTitle from '../../components/BackTitle/BackTitle';
import OptionsButton from '../../components/OptionsButton/OptionsButton';
import usePopUp from '../../hooks/usePopUp';
import ConfirmationPopUp from '../../components/ConfirmationPopUp/ConfirmationPopUp';
import SuccessNotificationPopUp from '../../components/SuccessNotificationPopUp/SuccessNotificationPopUp';
import ErrorNotificationPopUp from '../../components/ErrorNotificationPopUp/ErrorNotificationPopUp';

const actions = {
  unassign: 'desasignar',
  complete: 'completar',
  uncomplete: 'no completar',
  updateAditionalServiceHours: 'actualizar horas adicionales',
};

const status = {
  completed: 'Completado',
  asigned: 'Asignado',
  unassigned: 'No asignado',
};
function ActivityAssignmentDetailsPage() {
  const {
    callFetch: fetchAssignmentData,
    result: assignmentData,
    loading: loadignAssignmentData,
    error: errorAssignmentData,
  } = useFetch();

  const {
    callFetch: fetchAssignmentAction,
    result: assignmentActionResult,
    loading: assignmentActionLoading,
    error: assignmentActionError,
  } = useFetch();

  const { activityId, userId } = useParams();
  const token = useToken();
  const navigate = useNavigate();

  const {
    form, error, setData, validateField, clearFieldError,
  } = useForm(aditionalServiceHoursSchema);

  const [currentAction, setCurrentAction] = useState();
  const [assignmentStatus, setAssignmentStatus] = useState(null);

  const [isConfirmationOpen, openConfirmation, closeConfirmation] = usePopUp();
  const [isSuccessOpen, openSuccess, closeSuccess] = usePopUp();
  const [isErrorOpen, openError, closeError] = usePopUp();

  useEffect(() => {
    if (!activityId || !userId) return;

    fetchAssignmentData({
      uri: `${serverHost}/activity/${activityId}/assignment/${userId}`,
      headers: { authorization: token },
    });
  }, [activityId, userId]);

  useEffect(() => {
    if (!assignmentData) return;
    setData('aditionalServiceHours', assignmentData.aditionalServiceHours);
    setAssignmentStatus(
      assignmentData.completed ? status.completed : status.asigned,
    );
  }, [assignmentData]);

  useEffect(() => {
    if (assignmentActionResult) openSuccess(); // Se culminó exitosamente una acción
  }, [assignmentActionResult]);

  useEffect(() => {
    if (assignmentActionError) openError(); // Ocurrió un error con una acción
  }, [assignmentActionError]);

  const completeClickController = () => {
    // Se presionó acción de completar asignación
    setCurrentAction(actions.complete);
    fetchAssignmentAction({
      uri: `${serverHost}/activity/${activityId}/assignment/${userId}`,
      method: 'PATCH',
      headers: { authorization: token },
      parse: false,
      body: JSON.stringify({ completed: true }),
    });
  };

  const unassignClickController = () => {
    // Se seleccionó la acción de desasignar usuario
    // Primero se debe pedir confirmación. El fetch de esta acción se realiza en el callback
    // del popUp de confirmación
    setCurrentAction(actions.unassign);
    openConfirmation();
  };
  const uncompleteClickController = () => {
    // Se seleccionó la acción de no completar asignación usuario
    // Primero se debe pedir confirmación. El fetch de esta acción se realiza en el callback
    // del popUp de confirmación
    setCurrentAction(actions.uncomplete);
    openConfirmation();
  };

  const updateServiceHoursClickController = async () => {
    const errors = await validateField('aditionalServiceHours');

    if (errors?.aditionalServiceHours) return;

    setCurrentAction(actions.updateAditionalServiceHours);
    fetchAssignmentAction({
      uri: `${serverHost}/activity/${activityId}/assignment/${userId}`,
      method: 'PATCH',
      headers: { authorization: token },
      parse: false,
      body: JSON.stringify({ aditionalServiceHours: form.aditionalServiceHours }),
    });
  };

  const handleConfirmationChange = (value) => {
    if (!value) return;

    const request = {
      headers: { authorization: token },
      parse: false,
    };

    // Ejecutar acción correspondiente
    if (currentAction === actions.unassign) {
      request.uri = `${serverHost}/activity/${activityId}/assignment/${userId}`;
      request.method = 'DELETE';
    } else if (currentAction === actions.uncomplete) {
      request.uri = `${serverHost}/activity/${activityId}/assignment/${userId}`;
      request.method = 'PATCH';
      request.body = JSON.stringify({ completed: false });
    } else return;

    fetchAssignmentAction(request);
  };

  const handleFinishAction = async () => {
    if (currentAction === actions.unassign) {
      // asignación eliminada, redireccionar
      navigate(`/actividad/${activityId}/participantes`);
    } else if (currentAction === actions.complete) {
      // actualizar estado
      setAssignmentStatus(status.completed);
    } else if (currentAction === actions.uncomplete) {
      // actualizar estado
      setAssignmentStatus(status.asigned);
    }
  };
  return (
    <>
      {assignmentData && (
        <div className={styles.activityAssignmentDetailsPage}>
          <BackTitle title="Detalles de asignación" breakPoint="900px" href={`/actividad/${activityId}/participantes`}>
            <OptionsButton
              options={(() => {
                if (assignmentStatus === status.completed) {
                  return [
                    {
                      icon: <RemoveIcon />,
                      text: 'No completar',
                      onClick: uncompleteClickController,
                    },
                  ];
                }
                if (assignmentStatus === status.asigned) {
                  return [
                    {
                      icon: <CheckIcon />,
                      text: 'Completar',
                      onClick: completeClickController,
                    },
                    {
                      icon: <RemoveUserIcon />,
                      text: 'Desasignar',
                      onClick: unassignClickController,
                    },
                  ];
                }
                return [];
              })()}
            />
          </BackTitle>

          <h3 className={styles.sectionTitle}>Datos del usuario</h3>

          <div className={styles.dataContainer}>
            <div className={styles.userContainer}>
              <UserPicture idUser={assignmentData.user.id} name={assignmentData.user.name} />

              <DataField label="Nombre">
                <UserNameLink
                  idUser={assignmentData.user.id}
                  name={`${assignmentData.user.name} ${assignmentData.user.lastname}`}
                />
              </DataField>
            </div>

            <DataField label="Promoción">{assignmentData.user.promotion}</DataField>
          </div>

          <h3 className={styles.sectionTitle}>Datos de la actividad</h3>

          <div className={styles.dataContainer}>
            <DataField label="Nombre de la actividad">{assignmentData.activity.name}</DataField>

            <DataField label="Eje de ASIGBO">{assignmentData.activity.asigboArea.name}</DataField>

            <DataField label="Fecha de realización">
              {dayjs(assignmentData.activity.date).format('DD/MM/YYYY')}
            </DataField>

            <DataField label="Horas de servicio">
              {`${assignmentData.activity.serviceHours} ${
                assignmentData.activity.serviceHours === 1 ? 'hora' : 'horas'
              }`}
            </DataField>
          </div>

          <p className={styles.instructions}>
            Para agregar horas de servicio adicionales para esta participación, edita la cantidad y
            presiona el botón de actualizar.
          </p>

          <div className={styles.dataContainer}>
            <InputNumber
              title="Horas de servicio adicionales"
              min={0}
              value={form?.aditionalServiceHours}
              error={error?.aditionalServiceHours}
              onBlur={() => validateField('aditionalServiceHours')}
              onFocus={() => clearFieldError('aditionalServiceHours')}
              onChange={(e) => setData('aditionalServiceHours', e.target.value)}
            />
          </div>

          <Button
            className={styles.updateButton}
            text="Actualizar horas adicionales"
            onClick={updateServiceHoursClickController}
          />

        </div>
      )}
      {errorAssignmentData && <NotFoundPage />}
      {(loadignAssignmentData || assignmentActionLoading) && <LoadingView />}

      <ConfirmationPopUp
        close={closeConfirmation}
        isOpen={isConfirmationOpen}
        callback={handleConfirmationChange}
        body={
          currentAction === actions.unassign
            ? '¿Estás seguro de desasignar a este usuario de la actividad?'
            : '¿Estás seguro de remover el estado de completado para la asignación de este usuario?'
        }
      />

      <SuccessNotificationPopUp
        isOpen={isSuccessOpen}
        close={closeSuccess}
        text={(() => {
          if (currentAction === actions.updateAditionalServiceHours) {
            return 'Se ha actualizado el número adicional de horas de servicio para esta asignación.';
          }
          if (currentAction === actions.unassign) {
            return 'El usuario ha sido desasignado de forma exitosa.';
          }
          if (currentAction === actions.complete) {
            return 'La asignación del usuario a esta actividad ha sido marcada como completada.';
          }
          if (currentAction === actions.uncomplete) {
            return 'La asignación del usuario a esta actividad ha sido marcada como no completada.';
          }
          return 'Operación exitosa.';
        })()}
        callback={handleFinishAction}
      />
      <ErrorNotificationPopUp
        isOpen={isErrorOpen}
        close={closeError}
        text={assignmentActionError?.message}
      />
    </>
  );
}

export default ActivityAssignmentDetailsPage;

ActivityAssignmentDetailsPage.propTypes = {};

ActivityAssignmentDetailsPage.defaultProps = {};
