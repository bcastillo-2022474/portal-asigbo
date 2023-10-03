/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import PopUp from '@components/PopUp';
import InputText from '@components/InputText';
import styles from './UserDataPopUp.module.css';
import useForm from '../../hooks/useForm';
import createUserSchema from '../../pages/NewUserPage/createUserSchema';
import InputSelect from '../InputSelect/InputSelect';
import Button from '../Button/Button';
import InputNumber from '../InputNumber/InputNumber';

function UserDataPopUp({
  close, isOpen, onSubmit, info, codes,
}) {
  const [disabledForm, setDisabledForm] = useState(true);
  const [errorMessage, setErrorMessage] = useState(undefined);

  const {
    form, error, setData, validateField, clearFieldError, validateForm,
  } = useForm(createUserSchema);

  useEffect(() => {
    setData('code', info.code);
    setData('name', info.name);
    setData('lastname', info.lastname);
    setData('email', info.email);
    setData('career', info.career);
    setData('promotion', info.promotion);
    setData('sex', info.sex);
  }, []);

  const cleanAndClose = () => {
    setDisabledForm(true);
    close();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formErrors = await validateForm();
    if (formErrors) return;
    if (form.code !== info.code && codes.includes(form.code)) {
      setErrorMessage('Este código ya está siendo utilizado por otro elemento de la lista.');
      return;
    }
    setErrorMessage(undefined);
    onSubmit(info, { id: info.id, ...form });
    setDisabledForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    // console.log(name, value);
    setData(name, value);
  };

  return (
    isOpen && (
      <PopUp closeWithBackground={false} close={cleanAndClose} maxWidth={700}>
        <h1 className={styles.title}>Editar usuario</h1>
        <form className={styles.form} onSubmit={handleSubmit}>
          <InputNumber
            name="code"
            value={form?.code}
            error={error?.code}
            onChange={handleFormChange}
            onFocus={() => clearFieldError('code')}
            onBlur={() => validateField('code')}
            title="Código"
            disabled={disabledForm}
            min={0}
            max={100000}
            className={styles.smallInput}
          />
          <InputText
            title="Nombres"
            name="name"
            value={form?.name}
            error={error?.name}
            onChange={handleFormChange}
            onFocus={() => clearFieldError('name')}
            onBlur={() => validateField('name')}
            disabled={disabledForm}
            className={styles.nextRow}
          />
          <InputText
            title="Apellidos"
            name="lastname"
            value={form?.lastname}
            error={error?.lastname}
            onChange={handleFormChange}
            onFocus={() => clearFieldError('lastname')}
            onBlur={() => validateField('lastname')}
            disabled={disabledForm}
          />
          <InputText
            title="Correo electrónico"
            name="email"
            value={form?.email}
            error={error?.email}
            onChange={handleFormChange}
            onFocus={() => clearFieldError('email')}
            onBlur={() => validateField('email')}
            disabled={disabledForm}
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
            disabled={disabledForm}
          />
          <InputText
            title="Carrera"
            name="career"
            value={form?.career}
            error={error?.career}
            onChange={handleFormChange}
            onFocus={() => clearFieldError('career')}
            onBlur={() => validateField('career')}
            disabled={disabledForm}
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
            disabled={disabledForm}
          />
          <p
            style={{ display: errorMessage ? 'block' : 'none' }}
            className={`${styles.errorMessage} ${styles.bigRow}`}
          >
            {errorMessage}
          </p>
          <div className={`${styles.actionsContainer} ${styles.bigRow}`}>
            <Button className={`${styles.button} ${!disabledForm ? styles.disabledButton : undefined}`} text="Editar" type="button" onClick={() => setDisabledForm(false)} />
            <Button className={`${styles.button} ${disabledForm ? styles.disabledButton : undefined}`} text="Guardar" type="submit" />
          </div>
        </form>
      </PopUp>
    )
  );
}

export default UserDataPopUp;

UserDataPopUp.propTypes = {
  close: PropTypes.func.isRequired,
  isOpen: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  codes: PropTypes.arrayOf(PropTypes.string).isRequired,
  info: PropTypes.objectOf(PropTypes.string).isRequired,
};

UserDataPopUp.defaultProps = {
  isOpen: false,
};
