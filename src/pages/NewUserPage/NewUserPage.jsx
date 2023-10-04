/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import React, { useEffect, useState } from 'react';
import NavMenuButton from '@components/PageContainer/NavMenuButton/NavMenuButton';
import InputText from '@components/InputText';
import { useNavigate } from 'react-router-dom';
import CSVICon from '../../assets/icons/CSVIcon';
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

  const [isHoveringInfo, setIsHoveringInfo] = useState(false);

  const redirectOnSuccess = () => navigate('/');

  const handleSubmitUser = async (e) => {
    e.preventDefault();

    const formErrors = await validateForm();
    if (formErrors) return;

    postUser({
      uri: `${serverHost}/user/`,
      method: 'POST',
      headers: { authorization: token },
      body: JSON.stringify(form),
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    // console.log(name, value);
    setData(name, value);
    setData('code', Math.floor(Math.random() * (15001 - 0) + 0));
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
        <div
          className={styles.iconWrapper}
          onMouseOver={() => setIsHoveringInfo(true)}
          onMouseOut={() => setIsHoveringInfo(false)}
          onClick={() => setOpenImport(true)}
        >
          <NavMenuButton
            className={styles.navMenuButton}
            icon={<CSVICon fill="#16337F" width="75%" height="75%" />}
          />
        </div>
      </div>
      <div className={`${styles.csvInfoWrapper} ${isHoveringInfo ? styles.showing : styles.hidden}`}>
        <div className={styles.arrowUp} />
        <div className={styles.csvInfo}>
          ¿Creando múltiples usuarios?
          Presiona aquí para subir un archivo CSV con los datos de todos
          los becados que necesitan un nuevo usuario
        </div>
      </div>
      <form className={styles.form} onSubmit={handleSubmitUser}>
        <h3 className={styles.sectionTitle}>Información personal</h3>
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
          title="Correo electrónico"
          name="email"
          value={form?.email}
          error={error?.email}
          onChange={handleFormChange}
          onFocus={() => clearFieldError('email')}
          onBlur={() => validateField('email')}
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
        <h3 className={styles.sectionTitle}>Información académica</h3>
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

        {!resultPostUser && !loadingPostUser && (
          <div className={styles.actionsContainer}>
            <Button text="Registrar becado" type="submit" />
            <div className={styles.csvButtonWrapper} onClick={() => setOpenImport(true)}>
              <div className={styles.csvIconWrapper}>
                <CSVICon fill="#16337F" className={styles.csvIconSmall} />
              </div>
              <button type="button" className={styles.csvButton}>Importar usuarios desde archivo</button>
            </div>
          </div>
        )}
        {loadingPostUser && <Spinner />}

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
