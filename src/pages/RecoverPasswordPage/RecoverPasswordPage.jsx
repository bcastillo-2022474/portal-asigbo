import React, { useEffect } from 'react';
import asigboLogo from '@assets//logo/logo_azul.png';
import { useNavigate } from 'react-router-dom';
import UnloggedPageContainer from '../UnloggedPageContainer/UnloggedPageContainer';
// import PropTypes from 'prop-types';
import styles from './RecoverPasswordPage.module.css';
import InputText from '../../components/InputText/InputText';
import Button from '../../components/Button/Button';
import useForm from '../../hooks/useForm';
import recoverSchema from './recoverSchema';
import useFetch from '../../hooks/useFetch';
import { serverHost } from '../../config';
import Spinner from '../../components/Spinner/Spinner';
import usePopUp from '../../hooks/usePopUp';
import SuccessNotificationPopUp from '../../components/SuccessNotificationPopUp';

function RecoverPasswordPage() {
  const {
    form, error, setData, validateField, clearFieldError, validateForm,
  } = useForm(recoverSchema);

  const {
    callFetch, loading, error: fetchError, result,
  } = useFetch();
  const [isSuccessOpen, openSuccess, closeSuccess] = usePopUp();

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(name, value);
  };

  const handleValidateField = (e) => validateField(e.target.name);
  const handleClearFieldError = (e) => clearFieldError(e.target.name);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = await validateForm();
    if (errors) return;

    callFetch({
      uri: `${serverHost}/user/recoverPassword`,
      method: 'POST',
      body: JSON.stringify(form),
      parse: true,
      autoRefreshAccessToken: false,
    });
  };

  const navigateToHome = () => navigate('/');

  useEffect(() => {
    if (result) openSuccess();
  }, [result]);

  return (
    <UnloggedPageContainer>
      <div className={styles.recoverPasswordPage}>
        <img className={styles.logo} src={asigboLogo} alt="Logo de Asigbo" />

        <h1 className={styles.title}>
          ¿Olvidaste tu contraseña?
        </h1>
        <p className={styles.instructions}>
          No te preocupes, tan solo ingresa el email vinculado a tu usuario y recibirás las
          instrucciones para recuperar el acceso a tu cuenta.
        </p>

        <form onSubmit={handleSubmit}>
          <InputText
            title="Email"
            onChange={handleChange}
            name="email"
            value={form?.email}
            error={error?.email}
            onFocus={handleClearFieldError}
            onBlur={handleValidateField}
          />
          {fetchError && !loading && <p className={styles.globalError}>{fetchError.message}</p>}
          {!loading && !result && (
            <Button type="submit" text="Continuar" className={styles.buttonItem} />
          )}

          {loading && <Spinner className={styles.buttonItem} />}
        </form>
      </div>

      <SuccessNotificationPopUp
        close={closeSuccess}
        text={result?.result}
        callback={navigateToHome}
        isOpen={isSuccessOpen}
      />
    </UnloggedPageContainer>
  );
}

export default RecoverPasswordPage;

RecoverPasswordPage.propTypes = {};

RecoverPasswordPage.defaultProps = {};
