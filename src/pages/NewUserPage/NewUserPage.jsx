import React, { useEffect, useState } from 'react';
import NavMenuButton from '@components/PageContainer/NavMenuButton/NavMenuButton';
import InputText from '@components/InputText';
import ExcelIcon from '@assets/icons/ExcelIcon';
import { useNavigate } from 'react-router-dom';
import Spinner from '../../components/Spinner/Spinner';
import Button from '../../components/Button/Button';
import InputSearchSelect from '../../components/InputSearchSelect/InputSearchSelect';
import LoadingView from '../../components/LoadingView/LoadingView';
import styles from './NewUserPage.module.css';
import useForm from '../../hooks/useForm';
import useFetch from '../../hooks/useFetch';
import usePopUp from '../../hooks/usePopUp';
import useToken from '../../hooks/useToken';
import { serverHost } from '../../config';
import createUserSchema from './createUserSchema';
import SuccessNotificationPopUp from '../../components/SuccessNotificationPopUp/SuccessNotificationPopUp';
import ErrorNotificationPopUp from '../../components/ErrorNotificationPopUp/ErrorNotificationPopUp';

function NewUserPage() {
  const token = useToken();
  const navigate = useNavigate();

  const {
    form, error, setData, validateField, clearFieldError, validateForm,
  } = useForm(createUserSchema);

  const [promotions, setPromotions] = useState([]);

  const {
    callFetch: fetchPromotions,
    result: resultPromotions,
    error: errorPromotions,
    loading: loadingPromotions,
  } = useFetch();

  const {
    callFetch: postUser,
    result: resultPostUser,
    error: errorPostUser,
    loading: loadingPostUser,
  } = useFetch();

  const [isSuccessOpen, openSuccess, closeSuccess] = usePopUp();
  const [isErrorOpen, openError, closeError] = usePopUp();

  const getPromotions = () => {
    fetchPromotions({
      uri: `${serverHost}/promotion/`,
      headers: { authorization: token },
    });
  };

  const redirectOnSuccess = () => navigate('/');

  const handleSubmitUser = async (e) => {
    e.preventDefault();

    const formErrors = await validateForm();
    if (formErrors) return;

    postUser({
      uri: `${serverHost}/user/`,
      method: 'POST',
      headers: { authorization: token },
      body: form,
    });
  };

  const handleIconClick = () => {
    // Abrir popup para subir excel
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    setData(name, value);
  };

  useEffect(() => {
    if (!resultPromotions) return;
    const promotionsArray = [];
    resultPromotions.students.years.forEach((promotion) => {
      promotionsArray.push({ value: `${promotion}`, title: `${promotion}` });
    });
    setPromotions(promotionsArray);
  }, [resultPromotions]);

  useEffect(() => {
    console.log(errorPromotions);
  }, [errorPromotions]);

  useEffect(() => {
    getPromotions();
  }, []);

  useEffect(() => {
    if (errorPostUser) openError();
  }, [errorPostUser]);

  useEffect(() => {
    if (resultPostUser) openSuccess();
  }, [resultPostUser]);

  return (
    <div className={styles.newUserPage}>
      {loadingPromotions && <LoadingView />}
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
          name="lastName"
          value={form?.lastName}
          error={error?.lastName}
          onChange={handleFormChange}
          onFocus={() => clearFieldError('lastName')}
          onBlur={() => validateField('lastName')}
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
        <InputSearchSelect
          options={promotions}
          name="promotion"
          value={form?.promotion}
          error={error?.promotion}
          onChange={handleFormChange}
          onFocus={() => clearFieldError('promotion')}
          onBlur={() => validateField('promotion')}
          placeholder="Promoción"
        />
        <InputSearchSelect
          options={[{ value: 'M', title: 'Masculino' }, { value: 'F', title: 'Femenino' }]}
          name="sex"
          value={form?.sex}
          error={error?.sex}
          onChange={handleFormChange}
          onFocus={() => clearFieldError('sex')}
          onBlur={() => validateField('sex')}
          placeholder="Sexo"
        />
        <div className={styles.sendContainer}>
          {!resultPostUser && !loadingPostUser && (
            <Button text="Registrar becado" className={styles.sendButton} type="submit" />
          )}
          {loadingPostUser && <Spinner />}
        </div>
      </form>

      <SuccessNotificationPopUp
        close={closeSuccess}
        isOpen={isSuccessOpen}
        callback={redirectOnSuccess}
        text="El nuevo eje de Asigbo ha sido creado de forma exitosa."
      />

      <ErrorNotificationPopUp
        close={closeError}
        isOpen={isErrorOpen}
        text={errorPostUser?.message}
      />

    </div>
  );
}

export default NewUserPage;
