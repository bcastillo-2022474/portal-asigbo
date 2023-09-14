import React, { useEffect, useState } from 'react';
import NavMenuButton from '@components/PageContainer/NavMenuButton/NavMenuButton';
import InputText from '@components/InputText';
import ExcelIcon from '@assets/icons/ExcelIcon';
import { useNavigate } from 'react-router-dom';
import Spinner from '../../components/Spinner/Spinner';
import Button from '../../components/Button/Button';
import InputSelect from '../../components/InputSelect/InputSelect';
import InputNumber from '../../components/InputNumber/InputNumber';
import styles from './NewUserPage.module.css';
import useForm from '../../hooks/useForm';
import useFetch from '../../hooks/useFetch';
import usePopUp from '../../hooks/usePopUp';
import useToken from '../../hooks/useToken';
import { serverHost } from '../../config';
import createUserSchema from './createUserSchema';
import SuccessNotificationPopUp from '../../components/SuccessNotificationPopUp/SuccessNotificationPopUp';
import ErrorNotificationPopUp from '../../components/ErrorNotificationPopUp/ErrorNotificationPopUp';
import ImportCSVPopUp from '../../components/ImportCSVPopUp/ImportCSVPopUp';

function NewUserPage() {
  const token = useToken();
  const navigate = useNavigate();
  const [openImport, setOpenImport] = useState(false);

  const {
    form, error, setData, validateField, clearFieldError, validateForm,
  } = useForm(createUserSchema);

  const {
    callFetch: postUser,
    result: resultPostUser,
    error: errorPostUser,
    loading: loadingPostUser,
  } = useFetch();

  const [isSuccessOpen, openSuccess, closeSuccess] = usePopUp();
  const [isErrorOpen, openError, closeError] = usePopUp();

  const redirectOnSuccess = () => navigate('/');

  const handleSubmitUser = async (e) => {
    e.preventDefault();

    setData('code', Math.floor(Math.random() * (15001 - 0) + 0));

    const formErrors = await validateForm();
    if (formErrors) return;

    postUser({
      uri: `${serverHost}/user/`,
      method: 'POST',
      headers: { authorization: token },
      body: JSON.stringify(form),
    });
  };

  const handleIconClick = () => {
    // Abrir popup para subir excel
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    // console.log(name, value);
    setData(name, value);
  };

  useEffect(() => {
    if (errorPostUser) openError();
  }, [errorPostUser]);

  useEffect(() => {
    if (resultPostUser) openSuccess();
  }, [resultPostUser]);

  return (
    <div className={styles.newUserPage}>
      <div className={styles.headerContainer}>
        <h1 className={styles.pageTitle}>Crear usuario</h1>
        <div className={styles.iconWrapper}>
          <NavMenuButton
            icon={<ExcelIcon height="80%" width="80%" />}
            clickCallback={handleIconClick}
          />
        </div>
      </div>
      <form className={styles.form} onSubmit={handleSubmitUser}>
        <InputText
          title="Nombres del becado"
          name="name"
          value={form?.name}
          error={error?.name}
          onChange={handleFormChange}
          onFocus={() => clearFieldError('name')}
          onBlur={() => validateField('name')}
        />
        <InputText
          title="Apellidos del becado"
          name="lastname"
          value={form?.lastname}
          error={error?.lastname}
          onChange={handleFormChange}
          onFocus={() => clearFieldError('lastname')}
          onBlur={() => validateField('lastname')}
        />
        <InputText
          title="Correo electrónico del becado"
          name="email"
          value={form?.email}
          error={error?.email}
          onChange={handleFormChange}
          onFocus={() => clearFieldError('email')}
          onBlur={() => validateField('email')}
        />
        <InputText
          title="Carrera"
          name="career"
          value={form?.career}
          error={error?.career}
          onChange={handleFormChange}
          onFocus={() => clearFieldError('career')}
          onBlur={() => validateField('career')}
        />
        <InputNumber
          name="promotion"
          value={form?.promotion}
          error={error?.promotion}
          onChange={handleFormChange}
          onFocus={() => clearFieldError('promotion')}
          onBlur={() => validateField('promotion')}
          title="Promoción"
          min={2000}
          max={2100}
        />
        <InputSelect
          options={[{ value: 'M', title: 'Masculino' }, { value: 'F', title: 'Femenino' }]}
          name="sex"
          error={error?.sex}
          onChange={handleFormChange}
          onFocus={() => clearFieldError('sex')}
          onBlur={() => validateField('sex')}
          placeholder="Sexo"
          title="Sexo"
          value={form?.sex}
        />
        <div className={styles.actionsContainer}>
          {!resultPostUser && !loadingPostUser && (
            <>
              <Button text="Registrar becado" className={styles.sendButton} type="submit" />
              <Button
                text="Importar usuarios desde archivo"
                className={`${styles.sendButton} ${styles.importButton}`}
                type="button"
                onClick={() => setOpenImport(true)}
              />
            </>
          )}
          {loadingPostUser && <Spinner />}
        </div>
      </form>

      <SuccessNotificationPopUp
        close={closeSuccess}
        isOpen={isSuccessOpen}
        callback={redirectOnSuccess}
        text="El usuario del becado ha sido creado de forma exitosa."
      />

      <ErrorNotificationPopUp
        close={closeError}
        isOpen={isErrorOpen}
        text={errorPostUser?.message}
      />

      <ImportCSVPopUp
        isOpen={openImport}
        close={() => setOpenImport(false)}
      />

    </div>
  );
}

export default NewUserPage;
