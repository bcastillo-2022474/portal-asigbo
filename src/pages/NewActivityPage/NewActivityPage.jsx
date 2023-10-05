import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import InputText from '@components/InputText';
import InputNumber from '@components/InputNumber/InputNumber';
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
import updateAsigboActivitySchema from './updateAsigboAreaSchema';

function NewActivityPage() {
  // Si el idArea no es null, el formulario es para editar
  const { idArea } = useParams();

  // al editar, el icono siempre debe de existir
  const [ignoreIcon] = useState(idArea !== undefined);

  const {
    form, error, setData, validateField, clearFieldError, validateForm,
  } = useForm(
    ignoreIcon ? updateAsigboActivitySchema : createAsigboActivitySchema,
  );

  const {
    callFetch, result, loading, error: fetchError,
  } = useFetch();

  const token = useToken();

  const [isSuccessOpen, openSuccess, closeSuccess] = usePopUp();
  const [isErrorOpen, openError, closeError] = usePopUp();

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
    const { name, icon, responsible } = form;
    data.append('name', name);
    if (icon) data.append('icon', icon);
    responsible.forEach((val) => {
      data.append('responsible[]', val);
    });

    const uri = idArea ? `${serverHost}/area/${idArea}` : `${serverHost}/area`;
    const method = idArea ? 'PATCH' : 'POST';

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
    // Si es para editar, obtener datos del area
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
                name="name"
                error={error?.name}
                onChange={handleChange}
                onBlur={() => validateField('name')}
                onFocus={() => clearFieldError('name')}
                onKeyDown={handleKeyDown}
              />
              <InputText
                title="Eje de Asigbo"
                className={styles.inputText}
                name="name"
                value={form?.name}
                error={error?.name}
                onChange={handleChange}
                onBlur={() => validateField('name')}
                onFocus={() => clearFieldError('name')}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div className={styles.inputRow}>
              <InputText
                title="Fecha de realización"
                className={styles.inputText}
                name="name"
                error={error?.name}
                onChange={handleChange}
                onBlur={() => validateField('name')}
                onFocus={() => clearFieldError('name')}
                onKeyDown={handleKeyDown}
              />
              <InputNumber
                title="Horas de servicio"
                className={styles.inputText}
                name="name"
                error={error?.name}
                onChange={handleChange}
                onBlur={() => validateField('name')}
                onFocus={() => clearFieldError('name')}
                onKeyDown={handleKeyDown}
              />
            </div>
            <InputText
              title="Descripción"
              className={styles.inputText}
              name="name"
              error={error?.name}
              onChange={handleChange}
              onBlur={() => validateField('name')}
              onFocus={() => clearFieldError('name')}
              onKeyDown={handleKeyDown}
            />

            <h3 className={styles.formSectionTitle}>Participantes</h3>
            <InputNumber
              title="Número máximo de participantes"
              className={styles.inputText}
              name="name"
              error={error?.name}
              onChange={handleChange}
              onBlur={() => validateField('name')}
              onFocus={() => clearFieldError('name')}
              onKeyDown={handleKeyDown}
            />

            <h3 className={styles.formSectionTitle}>Pago requerido</h3>
            <InputNumber
              title="Monto del pago"
              className={styles.inputText}
              name="name"
              error={error?.name}
              onChange={handleChange}
              onBlur={() => validateField('name')}
              onFocus={() => clearFieldError('name')}
              onKeyDown={handleKeyDown}
            />

            <h3 className={styles.formSectionTitle}>Inscripción</h3>
            <InputText
              title="Monto del pago"
              className={styles.inputText}
              name="name"
              error={error?.name}
              onChange={handleChange}
              onBlur={() => validateField('name')}
              onFocus={() => clearFieldError('name')}
              onKeyDown={handleKeyDown}
            />

            <h3 className={styles.formSectionTitle}>Encargados</h3>
            <UserSelectTable
              onChange={(value) => setData('responsible', value)}
              defaultSelectedUsers={areaData ? areaData.responsible : null}
            />
            {error?.responsible && <p className={styles.errorMessage}>{error.responsible}</p>}
            <div className={styles.sendContainer}>
              {!result && !loading && (
                <Button
                  text={idArea ? 'Editar área' : 'Crear nueva área'}
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
              idArea
                ? 'El eje de ASIGBO ha sido actualizado de forma exitosa.'
                : 'El nuevo eje de Asigbo ha sido creado de forma exitosa.'
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
