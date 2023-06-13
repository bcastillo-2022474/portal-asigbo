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
