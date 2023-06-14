import React, { useState } from 'react';
import InputText from '@components/InputText/InputText';
import waves from '@assets/wave-haikei.svg';
import logo from '@assets/asigboazul.png';
import { button, blue } from '@styles/buttons.module.css';
import styles from './LoginPage.module.css';

const LoginPage = () => {
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});

  const handleFormChange = (e) => {
    const field = e.target.name;
    const { value } = e.target;
    setForm((lastValue) => ({ ...lastValue, [field]: value }));
  };

  const clearError = (e) => {
    setErrors((lastVal) => ({ ...lastVal, [e.target.name]: null }));
  };

  const validateEmail = () => {
    if (form?.username?.trim().length > 0) return true;
    setErrors((lastVal) => ({ ...lastVal, username: 'El email es obligatorio.' }));
    return false;
  };

  const validatePassword = () => {
    if (form?.password?.trim().length > 0) return true;
    setErrors((lastVal) => ({ ...lastVal, password: 'La contraseña es obligatoria.' }));
    return false;
  };

  return (
    <div className={styles.loginPageContainer}>
      <div className={styles.formContainer}>
        <div className={styles.logoContainer} />
        <div className={styles.wavesWrapperMobile}>
          <svg className={styles.wavesMobile} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#26397B" fillOpacity="1" d="M0,128L48,117.3C96,107,192,85,288,85.3C384,85,480,107,576,128C672,149,768,171,864,160C960,149,1056,107,1152,101.3C1248,96,1344,128,1392,144L1440,160L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z" /></svg>
        </div>
        <div className={styles.form}>
          <img alt="ASIGBO logo" className={styles.logoAsigbo} src={logo} />
          <h1>Iniciar sesión</h1>
          <span
            className={styles.forgotPassword}
          >
            Inicia sesión con las credenciales proveídas por tu coordinador
          </span>
          <InputText
            title="Correo electrónico"
            name="username"
            onChange={handleFormChange}
            value={form?.username}
            error={errors?.username}
            onBlur={validateEmail}
            onFocus={clearError}
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
          />
          <div className={styles.buttonWrapper}>
            <button className={`${button} ${blue}`} type="submit">Iniciar sesión</button>
          </div>
          <span className={styles.forgotPassword}>¿Olvidaste tu contraseña?</span>
        </div>
      </div>
      <div className={styles.wavesWrapper}>
        <img alt="waves" className={waves} src={waves} />
      </div>
      <div className={styles.backgroundWrapper}>
        <div className={styles.backgroundFilter} />
      </div>
    </div>
  );
};

export default LoginPage;
