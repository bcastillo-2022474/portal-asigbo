import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import InputPhoto from '@components/InputPhoto';
import InputText from '@components/InputText';
import InputSelect from '@components/InputSelect';
import InputNumber from '@components/InputNumber';
import Button from '@components/Button/Button';
import LoadingView from '@components/LoadingView';
import Spinner from '@components/Spinner/Spinner';
import SuccessNotificationPopUp from '@components/SuccessNotificationPopUp';
import ErrorNotificationPopUp from '@components/ErrorNotificationPopUp';
import useForm from '@hooks/useForm';
import useFetch from '@hooks/useFetch';
import { serverHost } from '@/config';
import NotFoundPage from '@pages/NotFoundPage';
import useToken from '@hooks/useToken';
import usePopUp from '@hooks/usePopUp';
import updateUserSchema from './updateUserSchema';
import styles from './UpdateUserPage.module.css';
import getTokenPayload from '../../helpers/getTokenPayload';
import consts from '../../helpers/consts';

/**
 * Página para editar el perfil de un usuario.
 * @returns
 */
function UpdateUserPage({ userId }) {
  const {
    callFetch: fetchUserData,
    result: user,
    error: userError,
    loading: userLoading,
  } = useFetch();

  const {
    callFetch: fetchUpdate,
    result: updateResult,
    error: updateError,
    loading: updateLoading,
  } = useFetch();

  const token = useToken();
  const userData = getTokenPayload(token);

  const isAdmin = userData.role.includes(consts.roles.admin);
  const isPromotionResponsible = userData.role.includes(consts.roles.promotionResponsible);

  const {
    form, error, setForm, setData, validateField, clearFieldError, validateForm,
  } = useForm(updateUserSchema);

  const [isSuccessOpen, openSuccess, closeSuccess] = usePopUp();
  const [isErrorOpen, openError, closeError] = usePopUp();

  const navigate = useNavigate();

  useEffect(() => {
    const uri = `${serverHost}/user/${userId}`;
    fetchUserData({ uri, headers: { authorization: token } });
  }, []);

  useEffect(() => {
    if (!user) return;
    // agregar los datos al hook form
    const {
      name, lastname, email, promotion, career, sex,
    } = user;

    setForm({
      name,
      lastname,
      email,
      promotion,
      career,
      sex,
    });
  }, [user]);

  useEffect(() => {
    if (updateResult) openSuccess();
  }, [updateResult]);

  useEffect(() => {
    if (updateError) openError();
  }, [updateError]);

  const handleImageChange = (image, hasDefaultImage) => {
    // hasDefaultImage indica si la imagen proporcionada como default funcionó.
    if (image === null && hasDefaultImage) setData('removeProfilePicture', true);
    else {
      setData('removeProfilePicture', false);

      if (image) setData('photo', image);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const err = await validateForm();
    if (err) return;

    const data = new FormData();
    Object.entries(form).forEach((val) => data.append(val[0], val[1]));

    // Eliminar parámetros según permisos
    if (!isAdmin) data.delete('promotion');
    if (!(form.password?.length > 0) || userId !== userData.id) {
      data.delete('password');
    }
    data.delete('repeatPassword');

    const uri = `${serverHost}/user/${userId}`;
    fetchUpdate({
      uri,
      method: 'PATCH',
      body: data,
      headers: { authorization: token },
      parse: false,
      removeContentType: true,
    });
  };

  const handleSuccessUpdate = () => {
    navigate(userData.id === userId ? '/perfil' : `/usuario/${userId}`);
  };

  // Valida que sea admin o encargado del año del usuario a editar
  const validatePagePermissionAccess = () => isAdmin || (isPromotionResponsible
    && user?.promotion === userData?.promotion);

  return (
    <>
      {user && validatePagePermissionAccess() && (
        <div className={styles.updateUserPage}>
          <h1 className={styles.pageTitle}>Editar perfil</h1>
          <form onSubmit={handleSubmit}>
            <div className={styles.formContainer}>
              <InputPhoto
                defaultImage={`${serverHost}/image/user/${userId}`}
                onChange={handleImageChange}
              />

              <h3 className={`${styles.sectionTitle} ${styles.completeRow}`}>
                Información personal
              </h3>

              <InputText
                title="Nombres"
                name="name"
                onChange={handleChange}
                value={form?.name}
                error={error?.name}
                onFocus={() => clearFieldError('name')}
                onBlur={() => validateField('name')}
              />

              <InputText
                title="Apellidos"
                name="lastname"
                onChange={handleChange}
                value={form?.lastname}
                error={error?.lastname}
                onFocus={() => clearFieldError('lastname')}
                onBlur={() => validateField('lastname')}
              />

              <InputText
                title="Correo electrónico"
                name="email"
                onChange={handleChange}
                value={form?.email}
                error={error?.email}
                onFocus={() => clearFieldError('email')}
                onBlur={() => validateField('email')}
              />

              <InputSelect
                placeholder=""
                className={styles.inputSex}
                title="Sexo"
                options={[
                  { value: 'F', title: 'F' },
                  { value: 'M', title: 'M' },
                ]}
                name="sex"
                onChange={handleChange}
                value={form?.sex}
                error={error?.sex}
                onFocus={() => clearFieldError('sex')}
                onBlur={() => validateField('sex')}
              />

              <h3 className={`${styles.sectionTitle} ${styles.completeRow}`}>
                Información académica
              </h3>

              <InputText
                title="Carrera"
                name="career"
                onChange={handleChange}
                value={form?.career}
                error={error?.career}
                onFocus={() => clearFieldError('career')}
                onBlur={() => validateField('career')}
              />

              {isAdmin && (
                <InputNumber
                  title="Promoción"
                  min={2000}
                  max={new Date().getFullYear() + 1}
                  name="promotion"
                  onChange={handleChange}
                  value={form?.promotion}
                  error={error?.promotion}
                  onFocus={() => clearFieldError('promotion')}
                  onBlur={() => validateField('promotion')}
                />
              )}

              {userId === userData.id && (
                <>
                  <h3 className={`${styles.sectionTitle} ${styles.completeRow}`}>
                    Información de acceso
                  </h3>

                  <InputText
                    title="Contraseña"
                    name="password"
                    type="password"
                    onChange={handleChange}
                    value={form?.password}
                    error={error?.repeatPassword && ' '}
                    onFocus={() => clearFieldError('repeatPassword')}
                    onBlur={() => {
                      if (form?.repeatPassword) validateField('repeatPassword');
                    }}
                  />

                  <InputText
                    title="Repetir contraseña"
                    name="repeatPassword"
                    type="password"
                    onChange={handleChange}
                    value={form?.repeatPassword}
                    error={error?.repeatPassword}
                    onFocus={() => clearFieldError('repeatPassword')}
                    onBlur={() => validateField('repeatPassword')}
                  />
                </>
              )}
            </div>

            <div className={`${styles.buttonContainer} ${styles.completeRow}`}>
              {updateLoading && <Spinner />}
              {!updateResult && !updateLoading && (
                <Button type="submit" text="Actualizar perfil de usuario" />
              )}
            </div>
          </form>

          <ErrorNotificationPopUp
            close={closeError}
            isOpen={isErrorOpen}
            text={updateError?.message ?? 'Ocurrió un error.'}
          />

          <SuccessNotificationPopUp
            close={closeSuccess}
            isOpen={isSuccessOpen}
            text="El usuario fue actualizado de exitosamente."
            callback={handleSuccessUpdate}
          />
        </div>
      )}

      {userLoading && <LoadingView />}
      {(userError || (user && !validatePagePermissionAccess())) && <NotFoundPage />}
    </>
  );
}

export default UpdateUserPage;

UpdateUserPage.propTypes = {
  userId: PropTypes.string.isRequired,
};

UpdateUserPage.defaultProps = {};
