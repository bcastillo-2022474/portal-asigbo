import React, { useEffect } from 'react';
// import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import styles from './NewAreaPage.module.css';
import InputText from '../../components/InputText/InputText';
import useForm from '../../hooks/useForm';
import IconPicker from '../../components/IconPicker/IconPicker';
import UserSelectTable from '../../components/UserSelectTable/UserSelectTable';
import Button from '../../components/Button/Button';
import createAsigboAreaSchema from './createAsigboAreaSchema';
import useFetch from '../../hooks/useFetch';
import Spinner from '../../components/Spinner/Spinner';
import { serverHost } from '../../config';
import useToken from '../../hooks/useToken';
import usePopUp from '../../hooks/usePopUp';
import SuccessNotificationPopUp from '../../components/SuccessNotificationPopUp/SuccessNotificationPopUp';
import ErrorNotificationPopUp from '../../components/ErrorNotificationPopUp/ErrorNotificationPopUp';

function NewAreaPage() {
  const {
    form, error, setData, validateField, clearFieldError, validateForm,
  } = useForm(createAsigboAreaSchema);

  const {
    callFetch, result, loading, error: fetchError,
  } = useFetch();

  const token = useToken();

  const [isSuccessOpen, openSuccess, closeSuccess] = usePopUp();
  const [isErrorOpen, openError, closeError] = usePopUp();

  const navigate = useNavigate();

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
    data.append('icon', icon);
    responsible.forEach((val) => {
      data.append('responsible[]', val);
    });

    callFetch({
      uri: `${serverHost}/area`,
      headers: { authorization: token },
      method: 'POST',
      body: data,
      removeContentType: true,
    });
  };

  const redirectOnSuccess = () => navigate('/area');

  useEffect(() => {
    if (result) openSuccess();
  }, [result]);

  useEffect(() => {
    if (fetchError) openError();
  }, [fetchError]);

  return (
    <div className={styles.newAreaPage}>
      <h1 className={styles.pageTitle}>Nuevo eje de Asigbo</h1>
      <form className={styles.formContainer} onSubmit={handleSubmit}>
        <h3 className={styles.formSectionTitle}>Información general</h3>
        <InputText
          title="Nombre del eje"
          className={styles.inputText}
          name="name"
          value={form?.name}
          error={error?.name}
          onChange={handleChange}
          onBlur={() => validateField('name')}
          onFocus={() => clearFieldError('name')}
          onKeyDown={handleKeyDown}
        />

        <h3 className={styles.formSectionTitle}>ícono del eje</h3>
        <p className={styles.formInstructions}>Se recomienda utilizar un formato svg.</p>
        <IconPicker onChange={(value) => setData('icon', value)} />
        {error?.icon && <p className={styles.errorMessage}>{error.icon}</p>}

        <h3 className={styles.formSectionTitle}>Encargados</h3>
        <UserSelectTable onChange={(value) => setData('responsible', value)} />
        {error?.responsible && <p className={styles.errorMessage}>{error.responsible}</p>}
        <div className={styles.sendContainer}>
          {!result && !loading && (
            <Button text="Crear nueva área" className={styles.sendButton} type="submit" />
          )}
          {loading && <Spinner />}
        </div>
      </form>

      <SuccessNotificationPopUp
        close={closeSuccess}
        isOpen={isSuccessOpen}
        callback={redirectOnSuccess}
        text="El nuevo eje de Asigbo ha sido creado de forma exitosa."
      />
      <ErrorNotificationPopUp close={closeError} isOpen={isErrorOpen} text={fetchError?.message} />
    </div>
  );
}

export default NewAreaPage;

NewAreaPage.propTypes = {};

NewAreaPage.defaultProps = {};
