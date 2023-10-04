import React, { useEffect, useState } from 'react';
import styles from './UpdatePromotion.module.css';
import InputNumber from '../InputNumber/InputNumber';
import SuccessNotificationPopUp from '../SuccessNotificationPopUp/SuccessNotificationPopUp';
import ErrorNotificationPopUp from '../ErrorNotificationPopUp/ErrorNotificationPopUp';
import ConfirmationPopUp from '../ConfirmationPopUp/ConfirmationPopUp';
import useForm from '../../hooks/useForm';
import useFetch from '../../hooks/useFetch';
import { serverHost } from '../../config';
import usePopUp from '../../hooks/usePopUp';
import useToken from '../../hooks/useToken';
import updatePromotionSchema from './updatePromotionSchema';
import Button from '../Button/Button';
import Spinner from '../Spinner/Spinner';

function UpdatePromotion() {
  const token = useToken();

  const [isSuccessOpen, openSuccess, closeSuccess] = usePopUp();
  const [isErrorOpen, openError, closeError] = usePopUp();
  const [isConfirmationOpen, openConfirmation, closeConfirmation] = usePopUp();
  const [action, setAction] = useState('');

  const {
    form, error, setData, validateField, clearFieldError, validateForm,
  } = useForm(updatePromotionSchema);

  const {
    callFetch: getCurrentPromotions,
    result: resultPromotions,
    loading: loadingPromotions,
  } = useFetch();

  const {
    callFetch: updatePromotion,
    result: resultUpdate,
    error: errorUpdate,
    loading: loadingUpdate,
  } = useFetch();

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setData(name, value);
  };

  const handleUpdate = async () => {
    const formErrors = await validateForm();

    if (formErrors) return;

    updatePromotion({
      uri: `${serverHost}/promotion/currentStudents`,
      method: 'POST',
      headers: { authorization: token },
      body: JSON.stringify(form),
    });
  };

  const handleAdvance = async () => {
    const body = {
      firstYearPromotion: +form.firstYearPromotion + 1,
      lastYearPromotion: +form.lastYearPromotion + 1,
    };
    updatePromotion({
      uri: `${serverHost}/promotion/currentStudents`,
      method: 'POST',
      headers: { authorization: token },
      body: JSON.stringify(body),
    });
  };

  const handleAction = (currentAction) => {
    setAction(currentAction);
  };

  const handleConfirmation = async (value) => {
    setAction('');
    if (!value) return;
    if (action === 'advance') {
      handleAdvance();
    }
    if (action === 'update') {
      handleUpdate();
    }
  };

  useEffect(() => {
    getCurrentPromotions({
      uri: `${serverHost}/promotion/`,
      headers: { authorization: token },
    });
  }, []);

  useEffect(() => {
    if (!resultPromotions) return;
    const currentYears = resultPromotions.students.years;
    currentYears.sort((a, b) => a - b);
    setData('firstYearPromotion', +currentYears[currentYears.length - 1]);
    setData('lastYearPromotion', +currentYears[0]);
  }, [resultPromotions]);

  /* Pendiente: Get de promociones actuales y manejar 'avanzar promoción' */

  useEffect(() => {
    if (!action) return;
    openConfirmation();
  }, [action]);

  useEffect(() => {
    if (!resultUpdate) return;
    getCurrentPromotions({
      uri: `${serverHost}/promotion/`,
      headers: { authorization: token },
    });
    openSuccess();
  }, [resultUpdate]);

  useEffect(() => {
    if (!errorUpdate) return;
    getCurrentPromotions({
      uri: `${serverHost}/promotion/`,
      headers: { authorization: token },
    });
    openError();
  }, [errorUpdate]);

  return (
    <div className={styles.updatePromotionContainer}>
      <p className={styles.info}>Especificar la promoción en primer y útlimo año de estudios</p>
      {(loadingPromotions || loadingUpdate) && (
        <div className={styles.spinnerContainer}>
          <Spinner />
        </div>
      )}
      {!loadingPromotions && !loadingUpdate && (
        <form className={styles.form}>
          <InputNumber
            name="firstYearPromotion"
            value={form?.firstYearPromotion}
            error={error?.firstYearPromotion}
            onChange={handleFormChange}
            onFocus={() => clearFieldError('firstYearPromotion')}
            onBlur={() => validateField('firstYearPromotion')}
            title="Promoción en primer año"
            min={2000}
            max={2100}
          />

          <InputNumber
            name="lastYearPromotion"
            value={form?.lastYearPromotion}
            error={error?.lastYearPromotion}
            onChange={handleFormChange}
            onFocus={() => clearFieldError('lastYearPromotion')}
            onBlur={() => validateField('lastYearPromotion')}
            title="Promoción en último año"
            min={2000}
            max={2100}
          />
          <div className={styles.buttonsContainer}>
            <Button text="Avanzar promoción" onClick={() => handleAction('advance')} emptyBlue />
            <Button text="Actualizar" onClick={() => handleAction('update')} />
          </div>
        </form>
      )}
      <ConfirmationPopUp
        close={closeConfirmation}
        isOpen={isConfirmationOpen}
        callback={handleConfirmation}
        body={(
          <>
            ¿Estás seguro/a de que quieres actualizar las promociones actuales?
            Esta acción modificará inmediatamente el grupo de usuarios al que
            pertenecen ciertas promociones
          </>
)}
      />
      <SuccessNotificationPopUp
        close={closeSuccess}
        isOpen={isSuccessOpen}
        text="Los años de promoción fueron actualizados exitosamente"
      />

      <ErrorNotificationPopUp
        close={closeError}
        isOpen={isErrorOpen}
        text={errorUpdate?.message}
      />
    </div>
  );
}

export default UpdatePromotion;
