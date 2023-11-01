import React, { useEffect, useState } from 'react';
import asigboLogo from '@assets//logo/logo_azul.png';
import { useSearchParams, useNavigate } from 'react-router-dom';
import UnloggedPageContainer from '../UnloggedPageContainer/UnloggedPageContainer';
// import PropTypes from 'prop-types';
import styles from './FinishRegistrationPage.module.css';
import InputPhoto from '../../components/InputPhoto/InputPhoto';
import InputText from '../../components/InputText/InputText';
import Button from '../../components/Button/Button';
import useForm from '../../hooks/useForm';
import registrationSchema from './registrationSchema';
import useFetch from '../../hooks/useFetch';
import { serverHost } from '../../config';
import LoadingView from '../../components/LoadingView/LoadingView';
import getTokenPayload from '../../helpers/getTokenPayload';
import Spinner from '../../components/Spinner/Spinner';
import useLogin from '../../hooks/useLogin';
import usePopUp from '../../hooks/usePopUp';
import ErrorNotificationPopUp from '../../components/ErrorNotificationPopUp/ErrorNotificationPopUp';
import SuccessNotificationPopUp from '../../components/SuccessNotificationPopUp';
import consts from '../../helpers/consts';

function FinishRegistrationPage() {
  const {
    form, error, setData, validateField, clearFieldError, validateForm,
  } = useForm(registrationSchema);

  const {
    callFetch, loading, error: fetchError, result,
  } = useFetch();
  const {
    callFetch: fetchValidateAccess,
    loading: validateAccessLoading,
    error: validateAccessError,
    result: validateAccessSuccess,
  } = useFetch();
  const [searchParams] = useSearchParams();
  const [userData, setUserData] = useState(null);
  const [access, setAccess] = useState();

  const { login, success: loginSuccess, error: loginError } = useLogin();

  const [isErrorOpen, openError, closeError] = usePopUp();
  const [isSuccessOpen, openSuccess, closeSuccess] = usePopUp();

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(name, value);
  };
  const handleValidateField = (e) => validateField(e.target.name);
  const handleClearFieldError = (e) => clearFieldError(e.target.name);

  const onPhotoChange = (value) => {
    setData('photo', value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = await validateForm();
    if (errors) return;

    const data = new FormData();

    data.append('password', form.password);
    data.append('photo', form.photo);

    callFetch({
      uri: `${serverHost}/user/finishRegistration`,
      method: 'POST',
      body: data,
      headers: { authorization: access },
      removeContentType: true,
      parse: false,
      autoRefreshAccessToken: false,
    });
  };

  const navigateToHome = () => navigate('/');

  const forceLogin = () => {
    login({
      user: userData.email,
      password: form.password,
    });

    // Añadir bandera para mostrar el mensaje de bienvenida
    sessionStorage.setItem(consts.firstAccessKey, '');
  };

  useEffect(() => {
    if (!validateAccessError) return;
    // El token no es valido
    openError();
  }, [validateAccessError]);

  useEffect(() => {
    if (form && form?.password === form.repeatPassword) clearFieldError('repeatPassword');
  }, [form]);

  useEffect(() => {
    if (searchParams.size === 0) {
      openError();
      return;
    }

    const accessParam = searchParams.get('access');

    if (!accessParam) return;
    // realizar petición para validar el token de acceso
    const uri = `${serverHost}/user/validateRegisterToken`;
    fetchValidateAccess({
      uri,
      headers: { authorization: accessParam },
      parse: false,
      autoRefreshAccessToken: false,
    });
    // guardar token y datos del token
    setAccess(accessParam);
    setUserData(getTokenPayload(accessParam));
  }, [searchParams]);

  useEffect(() => {
    if (!result) return;
    // Envio de formulario exitoso
    openSuccess();
  }, [result]);

  useEffect(() => {
    if (!loginSuccess && !loginError) return;
    // si se completó o falló el login, redirigir a /
    navigateToHome();
  }, [loginSuccess, loginError]);

  return (
    <UnloggedPageContainer>
      {!validateAccessLoading && validateAccessSuccess && (
        <div className={styles.finishRegistrationPage}>
          <img className={styles.logo} src={asigboLogo} alt="Logo de Asigbo" />

          <h1 className={styles.title}>
            ¡Bienvenido
            {' '}
            {userData?.name}
            !
          </h1>
          <p className={styles.instructions}>
            Ayudanos a completar tu perfíl para poder acceder a tu cuenta del portal de Asigbo.
          </p>

          <form onSubmit={handleSubmit}>
            <InputPhoto onChange={onPhotoChange} className={styles.inputPhoto} />
            <InputText
              title="Ingresar contraseña."
              onChange={handleChange}
              name="password"
              value={form?.password}
              error={error?.password}
              onFocus={handleClearFieldError}
              onBlur={handleValidateField}
              type="password"
            />
            <InputText
              title="Repetir contraseña."
              onChange={handleChange}
              name="repeatPassword"
              value={form?.repeatPassword}
              error={error?.repeatPassword}
              onFocus={handleClearFieldError}
              onBlur={handleValidateField}
              type="password"
            />
            {fetchError && !loading && <p className={styles.globalError}>{fetchError.message}</p>}
            {!loading && !result && (
              <Button type="submit" text="Continuar" className={styles.buttonItem} />
            )}

            {loading && <Spinner className={styles.buttonItem} />}
          </form>
        </div>
      )}
      {validateAccessLoading && <LoadingView />}

      <ErrorNotificationPopUp
        close={closeError}
        text="No estás autorizado para realizar esta acción."
        callback={navigateToHome}
        isOpen={isErrorOpen}
      />

      <SuccessNotificationPopUp
        close={closeSuccess}
        text="Haz completado tu perfil exitosamente."
        callback={forceLogin}
        isOpen={isSuccessOpen}
      />
    </UnloggedPageContainer>
  );
}

export default FinishRegistrationPage;

FinishRegistrationPage.propTypes = {};

FinishRegistrationPage.defaultProps = {};
