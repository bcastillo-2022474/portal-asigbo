import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import InputText from '@components/InputText';
import InputNumber from '@components/InputNumber/InputNumber';
import InputDate from '@components/InputDate/InputDate';
import CheckBox from '@components/CheckBox/CheckBox';
import ImagePicker from '@components/ImagePicker/ImagePicker';
import useForm from '@hooks/useForm';
import UserSelectTable from '@components/UserSelectTable';
import Button from '@components/Button';
import useFetch from '@hooks/useFetch';
import Spinner from '@components/Spinner/Spinner';
import { serverHost } from '@/config';
import useToken from '@hooks/useToken';
import usePopUp from '@hooks/usePopUp';
import SuccessNotificationPopUp from '@components/SuccessNotificationPopUp';
import ErrorNotificationPopUp from '@components/ErrorNotificationPopUp';
import LoadingView from '@components/LoadingView';
import NotFoundPage from '@pages/NotFoundPage';
import BackTitle from '@components/BackTitle';
import styles from './NewActivityPage.module.css';
import createAsigboActivitySchema from './createAsigboActivitySchema';

function NewActivityPage() {
  // Si el idArea no es null, el formulario es para editar
  const { idArea, idActividad } = useParams();

  const {
    form, error, setData, validateField, clearFieldError, validateForm,
  } = useForm(createAsigboActivitySchema);

  const {
    callFetch, result, loading, error: fetchError,
  } = useFetch();

  const token = useToken();
  const [isCheckboxChecked, setCheckboxChecked] = useState(false);
  const [participantsChecked, setParticipantsChecked] = useState(false);
  const [delegateAsParticipant, setDelegateAsParticipant] = useState(false);
  const [isSuccessOpen, openSuccess, closeSuccess] = usePopUp();
  const [isErrorOpen, openError, closeError] = usePopUp();
  const [selectedImages, setSelectedImages] = useState([]);
  const [deletedDefaultImages, setDeletedDefaultImages] = useState([]);

  const navigate = useNavigate();

  const {
    callFetch: fetchAreaData,
    result: areaData,
    loading: loadingAreaData,
    error: errorAreaData,
  } = useFetch();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(name, value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = await validateForm();
    if (formErrors) return;

    // construir form data a enviar
    const data = new FormData();

    console.log(selectedImages);

    // guardar imagenes
    selectedImages.forEach((file) => data.append('files[]', file, file.name));

    data.append('deletedImages', JSON.stringify(deletedDefaultImages));

    const {
      // eslint-disable-next-line max-len
      activityName, completionDate, registrationStartDate, registrationEndDate, serviceHours, description, maxParticipants, paymentRequired, responsible,
    } = form;
    data.append('name', activityName);
    data.append('date', completionDate);
    data.append('idAsigboArea', idArea);
    data.append('activityName', activityName);
    data.append('serviceHours', serviceHours);
    data.append('description', description);
    data.append('registrationStartDate', registrationStartDate);
    data.append('registrationEndDate', registrationEndDate);
    data.append('participantsNumber', maxParticipants);
    data.append('paymentAmount', paymentRequired);
    responsible.forEach((val) => {
      data.append('responsible[]', val);
    });

    const uri = idActividad ? `${serverHost}/activity/${idActividad}` : `${serverHost}/activity`;
    const method = idActividad ? 'PATCH' : 'POST';

    console.log(uri);
    console.log(method);
    console.log(data);
    callFetch({
      uri,
      headers: { authorization: token },
      method,
      body: data,
      removeContentType: true,
    });
  };

  const redirectOnSuccess = () => {
    const uri = idArea ? `/area/${idArea}` : '/area';
    navigate(uri);
  };

  useEffect(() => {
    if (result) openSuccess();
  }, [result]);

  useEffect(() => {
    if (fetchError) openError();
  }, [fetchError]);

  useEffect(() => {
    if (!idArea) return;
    // Si es para editar, obtener datos de la actividad
    fetchAreaData({ uri: `${serverHost}/area/${idArea}`, authorization: { headers: token } });
  }, [idArea]);

  useEffect(() => {
    if (!areaData) return;
    setData('name', areaData.name);
  }, [areaData]);

  return (
    <>
      {(!idArea || areaData) && (
        <div className={styles.newAreaPage}>
          <BackTitle
            title={idArea ? 'Nueva Actividad' : 'Nuevo eje de ASIGBO'}
            href={idArea ? `/area/${idArea}` : '/area'}
            className={styles.pageTitle}
          />

          <form className={styles.formContainer} onSubmit={handleSubmit}>
            <h3 className={styles.formSectionTitle}>Información general</h3>
            <div className={styles.inputRow}>
              <InputText
                title="Nombre de la actividad"
                className={styles.inputText}
                name="activityName"
                error={error?.activityName}
                value={form?.activityName}
                onChange={handleChange}
                onBlur={() => validateField('activityName')}
                onFocus={() => clearFieldError('activityName')}
                onKeyDown={handleKeyDown}
              />
              <InputText
                title="Eje de Asigbo"
                className={styles.inputText}
                name="eje"
                value={form?.name}
                error={error?.name}
                onChange={handleChange}
                onBlur={() => validateField('name')}
                onFocus={() => clearFieldError('name')}
                onKeyDown={handleKeyDown}
                disabled
              />
            </div>
            <div className={styles.inputRow}>
              <InputDate
                title="Fecha de realización"
                className={styles.inputText}
                name="completionDate"
                value={form?.completionDate}
                error={error?.completionDate}
                onChange={handleChange}
                onBlur={() => validateField('completionDate')}
                onFocus={() => clearFieldError('completionDate')}
                onKeyDown={handleKeyDown}
              />
              <InputNumber
                title="Horas de servicio"
                className={styles.inputText}
                name="serviceHours"
                error={error?.serviceHours}
                value={form?.serviceHours}
                onChange={handleChange}
                onBlur={() => validateField('serviceHours')}
                onFocus={() => clearFieldError('serviceHours')}
                onKeyDown={handleKeyDown}
                min={0}
                max={2100}
              />
            </div>
            <InputText
              // style={{ padding: '35px 25px' }}
              title="Descripción"
              className={styles.inputDescription}
              name="description"
              value={form?.description}
              onChange={handleChange}
              onBlur={() => validateField('description')}
              onFocus={() => clearFieldError('description')}
              onKeyDown={handleKeyDown}
            />

            <h3 className={styles.formSectionTitle}>Participantes</h3>
            <InputNumber
              title="Número máximo de participantes"
              className={styles.inputText}
              name="maxParticipants"
              error={error?.maxParticipants}
              value={form?.maxParticipants}
              onChange={handleChange}
              onBlur={() => validateField('maxParticipants')}
              onFocus={() => clearFieldError('name')}
              onKeyDown={handleKeyDown}
              min={0}
              max={2100}
            />
            <CheckBox
              label="Permitir participación de todos los becados"
              checked={participantsChecked}
              onChange={() => setParticipantsChecked(!participantsChecked)}
            />

            <h3 className={styles.formSectionTitle}>Pago requerido</h3>
            <CheckBox
              label="La actividad necesita un pago por parte de los becados"
              checked={isCheckboxChecked}
              onChange={() => setCheckboxChecked(!isCheckboxChecked)}
            />
            {isCheckboxChecked && (
            <InputNumber
              title="Monto del pago"
              className={styles.inputText}
              name="paymentRequired"
              error={error?.paymentRequired}
              onChange={handleChange}
              value={form?.paymentRequired}
              onBlur={() => validateField('paymentRequired')}
              onFocus={() => clearFieldError('paymentRequired')}
              onKeyDown={handleKeyDown}
              min={0}
              max={2100}
            />
            )}

            <h3 className={styles.formSectionTitle}>Inscripción</h3>
            <div className={styles.inputRow}>
              <InputDate
                title="Disponible desde"
                className={styles.inputText}
                name="registrationStartDate"
                value={form?.registrationStartDate}
                error={error?.completionDate}
                onChange={handleChange}
                onBlur={() => validateField('registrationStartDate')}
                onFocus={() => clearFieldError('registrationStartDate')}
                onKeyDown={handleKeyDown}
              />
              <InputDate
                title="Disponible hasta"
                className={styles.inputText}
                name="registrationEndDate"
                value={form?.registrationEndDate}
                error={error?.completionDate}
                onChange={handleChange}
                onBlur={() => validateField('registrationEndDate')}
                onFocus={() => clearFieldError('registrationEndDate')}
                onKeyDown={handleKeyDown}
              />
            </div>

            <h3 className={styles.formSectionTitle}>Imagen representativa de la actividad</h3>
            <ImagePicker
              onChange={(images, deletedDefault) => {
                setSelectedImages(images);
                setDeletedDefaultImages(deletedDefault);
              }}
              maxFiles={5} // Por ejemplo, puedes modificar según tus necesidades.
              defaultImages={form?.defaultImages}
            />
            <h3 className={styles.formSectionTitle}>Encargados</h3>
            <CheckBox
              label="Inscribir a los encargados como participantes de la actividad"
              checked={delegateAsParticipant}
              onChange={() => setDelegateAsParticipant(!delegateAsParticipant)}
            />
            <UserSelectTable
              onChange={(value) => setData('responsible', value)}
              defaultSelectedUsers={areaData ? areaData.responsible : null}
            />
            {error?.responsible && <p className={styles.errorMessage}>{error.responsible}</p>}
            <div className={styles.sendContainer}>
              {!result && !loading && (
                <Button
                  text={idActividad ? 'Editar actividad' : 'Crear nueva actividad'}
                  className={styles.sendButton}
                  type="submit"
                />
              )}
              {loading && <Spinner />}
            </div>
          </form>

          <SuccessNotificationPopUp
            close={closeSuccess}
            isOpen={isSuccessOpen}
            callback={redirectOnSuccess}
            text={
              idActividad
                ? 'La actividad ha sido actualizada de forma exitosa.'
                : 'La nueva actividad ha sido creada de forma exitosa.'
            }
          />
          <ErrorNotificationPopUp
            close={closeError}
            isOpen={isErrorOpen}
            text={fetchError?.message}
          />
        </div>
      )}
      {idArea && loadingAreaData && <LoadingView />}
      {idArea && errorAreaData && <NotFoundPage />}
    </>
  );
}

export default NewActivityPage;
