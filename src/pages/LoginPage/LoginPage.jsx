import React, { useState } from 'react';
import InputText from '@components/InputText/InputText';
import Spinner from '@components/Spinner/Spinner';
import waves from '@assets/wave-haikei.svg';
import logo from '@assets/asigboazul.png';
import { button, blue } from '@styles/buttons.module.css';
import useLogin from '@hooks/useLogin';
import BottomWave from '../../components/BottomWave/BottomWave';
import styles from './LoginPage.module.css';

/* Componente de la página de login.
Maneja errores de inputs (usuario y contraseña) y utiliza el hook de useLogin para llamar a la API
y obtener un access token y un refresh token */
function LoginPage() {
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const {
    login, error, loading,
  } = useLogin();

  const handleFormChange = (e) => {
    const field = e.target.name;
    const { value } = e.target;
    setForm((lastValue) => ({ ...lastValue, [field]: value }));
  };

  const clearErrors = () => {
    setErrors({});
  };

  const clearError = (e) => {
    setErrors((lastVal) => ({ ...lastVal, [e.target.name]: null }));
  };

  const validateEmail = () => {
    if (form?.user?.trim().length > 0) return true;
    setErrors((lastVal) => ({ ...lastVal, user: 'El email es obligatorio.' }));
    return false;
  };

  const validatePassword = () => {
    if (form?.password?.trim().length > 0) return true;
    setErrors((lastVal) => ({ ...lastVal, password: 'La contraseña es obligatoria.' }));
    return false;
  };

  const handleSubmit = () => {
    clearErrors();
    if (!(validateEmail() && validatePassword())) return;
    login(form);
  };

  return (
    <div className={styles.loginPageContainer}>
      <div className={styles.formContainer}>
        <img alt="ASIGBO logo" className={styles.logoAsigboMobile} src={logo} />
        <div className={styles.form}>
          <img alt="ASIGBO logo" className={styles.logoAsigbo} src={logo} />
          <h1>Iniciar sesión</h1>
          <span
            className={styles.infoSpan}
          >
            Inicia sesión con las credenciales proveídas por tu coordinador
          </span>
          <InputText
            title="Correo electrónico"
            name="user"
            onChange={handleFormChange}
            value={form?.user}
            error={errors?.user}
            onBlur={validateEmail}
            onFocus={clearError}
            style={{ maxWidth: '560px' }}
          />
          <InputText
            title="Contraseña"
            name="password"
            type="password"
            onChange={handleFormChange}
            value={form?.password}
            error={errors?.password}
            onBlur={validatePassword}
            onFocus={clearError}
            style={{ maxWidth: '560px' }}
          />
          {error && <div className={styles.errorMessage}>{error?.message ?? 'Ocurrió un error.'}</div>}
          <div className={styles.buttonWrapper}>
            {!loading && (<button className={`${button} ${blue}`} type="submit" onClick={handleSubmit}>Iniciar sesión</button>)}
            {loading && <Spinner />}
          </div>
          <span className={styles.forgotPassword}>¿Olvidaste tu contraseña?</span>
        </div>
      </div>
      <BottomWave className={styles.bottomWave} />
      <div className={styles.wavesWrapper}>
        <img alt="waves" className={styles.waves} src={waves} />
      </div>
      <div className={styles.backgroundWrapper}>
        <div className={styles.backgroundFilter} />
      </div>
    </div>
  );
}

export default LoginPage;
