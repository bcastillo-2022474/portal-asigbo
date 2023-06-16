import React, { useState } from 'react';
import NavMenuButton from '@components/PageContainer/NavMenuButton/NavMenuButton';
import InputText from '@components/InputText';
import ExcelIcon from '@assets/icons/ExcelIcon';
import styles from './NewUserPage.module.css';

function NewUserPage() {
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const handleIconClick = () => {
    // Abrir popup
  };

  const handleFormChange = (e) => {
    const field = e.target.name;
    const { value } = e.target;
    setForm((lastValue) => ({ ...lastValue, [field]: value }));
  };

  const clearError = (e) => {
    setErrors((lastVal) => ({ ...lastVal, [e.target.name]: null }));
  };

  const validateFirstNames = () => {
    if (form?.name?.trim().length > 0) return true;
    setErrors((lastVal) => ({ ...lastVal, name: 'Los nombres del becado son requeridos' }));
    return false;
  };

  const validateLastNames = () => {
    if (form?.lastName?.trim().length > 0) return true;
    setErrors((lastVal) => ({ ...lastVal, lastName: 'Los nombres del becado son requeridos' }));
    return false;
  };

  const validateEmail = () => {
    if (form?.email?.trim().length > 0) return true;
    setErrors((lastVal) => ({ ...lastVal, email: 'El email del becado es requerido' }));
    return false;
  };

  return (
    <div className={styles.newUserPage}>
      <div className={styles.headerContainer}>
        <h1 className={styles.pageTitle}>Crear usuario</h1>
        <div className={styles.iconWrapper}>
          <NavMenuButton
            icon={<ExcelIcon height="80%" width="80%" />}
            label={handleIconClick}
          />
        </div>
      </div>
      <div className={styles.form}>
        <InputText
          title="Nombres del becado"
          name="name"
          value={form?.name}
          error={errors?.name}
          onChange={handleFormChange}
          onFocus={clearError}
          onBlur={validateFirstNames}
        />
        <InputText
          title="Apellidos del becado"
          name="lastName"
          value={form?.lastName}
          error={errors?.lastName}
          onChange={handleFormChange}
          onFocus={clearError}
          onBlur={validateLastNames}
        />
        <InputText
          title="Correo electrónico del becado"
          name="email"
          value={form?.email}
          error={errors?.email}
          onChange={handleFormChange}
          onFocus={clearError}
          onBlur={validateEmail}
        />
      </div>
    </div>
  );
}

export default NewUserPage;
