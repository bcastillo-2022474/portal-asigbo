import React, { useEffect, useState } from 'react';
// import PropTypes from 'prop-types';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
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
import TextArea from '../../components/TextArea/TextArea';
import InputFile from '../../components/InputFile/InputFile';
import FilesTable from '../../components/FilesTable/FilesTable';
import randomString from '../../helpers/randomString';
import useToken from '../../hooks/useToken';
import consts from '../../helpers/consts';

const actions = {
  unassign: 'desasignar',
  complete: 'completar',
  uncomplete: 'no completar',
  updateAssignmentData: 'actualizar datos de asignación',
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
  const [assignmentFiles, setAssignmentFiles] = useState([]);
  const [filesToUpload, setFilesToUpload] = useState({});
  const [filesToRemove, setFilesToRemove] = useState([]);

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

    // Cargar datos de la asignación
    setData('aditionalServiceHours', assignmentData.aditionalServiceHours);
    setData('notes', assignmentData.notes);
    setAssignmentFiles(assignmentData.files ?? []);

    setAssignmentStatus(
      assignmentData.completed ? status.completed : status.asigned,
    );
  }, [assignmentData]);

  useEffect(() => {
    if (!assignmentActionResult) return;
    // Se culminó exitosamente una acción
    openSuccess();

    // Actualizar lista de archivos
    const { filesSaved } = assignmentActionResult;
    setFilesToUpload({}); // Limpiar archivos nuevos
    setFilesToRemove([]); // Limpiar archivos a eliminar
    if (Array.isArray(filesSaved)) {
      setAssignmentFiles((lastVal) => [...lastVal, ...filesSaved]);
    }
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

  const updateAssignmentDataClickController = async () => {
    const errors = await validateField('aditionalServiceHours');

    if (errors?.aditionalServiceHours) return;

    const data = new FormData();
    data.append('aditionalServiceHours', form.aditionalServiceHours);
    if (form.notes !== undefined && form.notes !== null) data.append('notes', form.notes);
    Object.values(filesToUpload).forEach((file) => data.append('files', file, file.name));
    filesToRemove.forEach((file) => data.append('filesToRemove[]', file));

    setCurrentAction(actions.updateAssignmentData);
    fetchAssignmentAction({
      uri: `${serverHost}/activity/${activityId}/assignment/${userId}`,
      method: 'PATCH',
      headers: { authorization: token },
      removeContentType: true,
      body: data,
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

  const handleInputFileChange = (files) => {
    const prevFilesSelectedNum = Object.keys(filesToUpload).length;
    files?.forEach((file, index) => {
      // Validar que no se llegue al máximo de 5 archivos
      if ((prevFilesSelectedNum + assignmentFiles.length + index) >= 5) {
        return;
      }
      const id = randomString(10);
      setFilesToUpload((lastVal) => ({ ...lastVal, [id]: file }));
    });
  };

  const removeNewFile = (id) => {
    setFilesToUpload((lastVal) => {
      const value = { ...lastVal };
      delete value[id];
      return value;
    });
  };

  const addFileToRemove = (id) => {
    setFilesToRemove((lastVal) => [...lastVal, id]);
    setAssignmentFiles((lastVal) => lastVal.filter((file) => file !== id));
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
              <UserPicture
                idUser={assignmentData.user.id}
                name={assignmentData.user.name}
                hasImage={assignmentData.user.hasImage ?? false}
              />

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
            Las horas
            adicionales se sumarán a las horas de servicio de la actividad únicamente para el
            usuario en cuestión.
            <br />
            <br />
            Las notas y archivos adjuntos no son campos obligatorios.
          </p>

          <div className={styles.formContainer}>
            <InputNumber
              className={styles.aditionalServiceHours}
              title="Horas de servicio adicionales"
              min={0}
              max={999}
              value={form?.aditionalServiceHours?.toString()}
              error={error?.aditionalServiceHours}
              onBlur={() => validateField('aditionalServiceHours')}
              onFocus={() => clearFieldError('aditionalServiceHours')}
              onChange={(e) => setData('aditionalServiceHours', e.target.value)}
            />

            <TextArea
              title="Notas de la asignación"
              className={styles.notesTextarea}
              onChange={(e) => setData('notes', e.target.value)}
              value={form?.notes}
            />

            <InputFile
              className={styles.inputFile}
              onChange={handleInputFileChange}
              disabled={
                (Object.keys(filesToUpload).length + assignmentFiles.length) >= 5
              }
            />
            <FilesTable
              className={styles.filesTable}
              files={[
                ...assignmentFiles.map((file) => ({
                  id: file,
                  name: file,
                  link: `${serverHost}/${consts.imageRoute.assignment}/${file}`,
                  onDelete: addFileToRemove,
                })),
                ...Object.entries(filesToUpload).map(([id, file]) => ({
                  id,
                  name: file.name,
                  type: file.type,
                  link: URL.createObjectURL(file),
                  onDelete: removeNewFile,
                })),
              ]}
            />

            <Button
              className={styles.updateButton}
              text="Aplicar cambios"
              onClick={updateAssignmentDataClickController}
            />
          </div>

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
          if (currentAction === actions.updateAssignmentData) {
            return 'Se han aplicado los cambios a la información adicional de esta asignación.';
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
