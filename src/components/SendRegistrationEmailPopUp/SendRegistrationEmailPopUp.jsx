import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import PopUp from '@components/PopUp';
import Button from '@components/Button';
import styles from './SendRegistrationEmailPopUp.module.css';
import InputSelect from '../InputSelect/InputSelect';
import useFetch from '../../hooks/useFetch';
import consts from '../../helpers/consts';
import { serverHost } from '../../config';
import usePopUp from '../../hooks/usePopUp';
import ErrorNotificationPopUp from '../ErrorNotificationPopUp/ErrorNotificationPopUp';
import SuccessNotificationPopUp from '../SuccessNotificationPopUp/SuccessNotificationPopUp';
import Spinner from '../Spinner/Spinner';
import useToken from '../../hooks/useToken';

/**
 * PopUp que muestra un mensaje de confirmación y botones de acción.
 * @param close Función que oculta el popUp.
 */
function SendRegistrationEmailPopUp({
  close,
}) {
  // eslint-disable-next-line no-unused-vars
  const [promotionSelected, setPromotionSelected] = useState();

  const token = useToken();

  const [isSuccessOpen, openSuccess, closeSuccess] = usePopUp();
  const [isErrorOpen, openError, closeError] = usePopUp();

  const {
    callFetch: getPromotionsFetch,
    result: promotions,
    loading: loadingPromotions,
    error: errorPromotions,
  } = useFetch();

  const {
    callFetch: sendEmailsFetch,
    result: sendEmailsResult,
    loading: sendEmailsLoading,
    error: sendEmailsError,
  } = useFetch();

  useEffect(() => {
    // obtener promociones
    getPromotionsFetch({ uri: `${serverHost}/promotion`, headers: { authorization: token } });
  }, []);

  useEffect(() => {
    if (sendEmailsResult) openSuccess();
  }, [sendEmailsResult]);

  useEffect(() => {
    if (sendEmailsError) openError();
  }, [sendEmailsError]);

  const handleSubmit = () => {
    const body = {
      promotion: (promotionSelected !== null && promotionSelected.length > 0)
        ? promotionSelected : undefined,
    };

    sendEmailsFetch({
      uri: `${serverHost}/user/renewManyRegisterTokens`,
      method: 'POST',
      body: JSON.stringify(body),
      parse: false,
      headers: { authorization: token },
    });
  };
  return (

    <>
      <PopUp
        close={close}
        closeButton={false}
        closeWithBackground={false}
        maxWidth={700}
      >
        <div className={styles.SendRegistrationEmailPopUp}>
          <h2 className={styles.title}>Enviar email de registro</h2>
          <p className={styles.body}>
            Selecciona el grupo de becados a los que deseas
            enviar el email de registro. Toma en cuenta que este correo solo se enviará a aquellos
            usuarios que no hayan ingresado por primera vez al portal.
          </p>
          <InputSelect
            className={styles.promotionSelectInput}
            onChange={(e) => setPromotionSelected(e.target.value)}
            placeholder="Todos los becados"
            value={promotionSelected}
            options={
            promotions
              ? [
                ...promotions.notStudents.map(
                  (val) => ({ value: val, title: consts.promotionsGroups[val] }),
                ),
                {
                  value: promotions.students.id,
                  title: consts.promotionsGroups[promotions.students.id],
                },
                ...promotions.students.years.map((year) => ({ value: `${year}`, title: `${year}` })),
              ]
              : null
          }
            disabled={errorPromotions || loadingPromotions}
          />

          {
              !sendEmailsLoading && !loadingPromotions && !sendEmailsResult && (
                <div className={styles.buttonsContainer}>
                  <Button text="Cancelar" emptyRed onClick={close} />
                  <Button text="Enviar" onClick={handleSubmit} />
                </div>
              )
            }

          {(sendEmailsLoading || loadingPromotions) && (
            <Spinner />
          )}
        </div>
      </PopUp>

      <SuccessNotificationPopUp
        close={closeSuccess}
        isOpen={isSuccessOpen}
        text="Los emails de registro se han enviado correctamente."
        callback={close}
      />

      <ErrorNotificationPopUp
        close={closeError}
        isOpen={isErrorOpen}
        text={sendEmailsError?.message ?? 'Ocurrió un error al enviar emails de registro.'}
      />
    </>
  );
}

export default SendRegistrationEmailPopUp;

SendRegistrationEmailPopUp.propTypes = {
  close: PropTypes.func.isRequired,
};

SendRegistrationEmailPopUp.defaultProps = {
};
