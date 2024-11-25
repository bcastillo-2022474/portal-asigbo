import React from 'react';
import PropTypes from 'prop-types';
import PopUp from '@components/PopUp';
import Button from '@components/Button';
import styles from './ConfirmationPopUp.module.css';

/**
 * PopUp que muestra un mensaje de confirmación y botones de acción.
 * @param close Función que oculta el popUp.
 * @param isOpen Boolean. Indica si el popUp se debe mostrar o no.
 * @param callback Func. Función que se ejecuta al presionar alguno de los botones de acción.
 * Devuelve true si se presiona confirmar y false si se presiona cancelar.
 * @param body node. Contenido a desplegarse como mensaje de confirmación.
 */
function ConfirmationPopUp({
  close, isOpen, callback, body,
}) {
  const handleCancelClick = () => {
    if (callback) callback(false);
    close();
  };
  const handleAcceptClick = () => {
    if (callback) callback(true);
    close();
  };

  return (
    isOpen && (
      <PopUp
        close={close}
        closeButton={false}
        closeWithBackground={false}
        maxWidth={500}
      >
        <div className={styles.confirmationPopUp}>
          <h2 className={styles.title}>Confirmación</h2>
          <p className={styles.body}>{body}</p>
          <div className={styles.buttonsContainer}>
            <Button text="Cancelar" emptyRed onClick={handleCancelClick} />
            <Button text="Confirmar" onClick={handleAcceptClick} />
          </div>
        </div>
      </PopUp>
    )
  );
}

export default ConfirmationPopUp;

ConfirmationPopUp.propTypes = {
  close: PropTypes.func.isRequired,
  callback: PropTypes.func,
  isOpen: PropTypes.bool,
  body: PropTypes.node,
};

ConfirmationPopUp.defaultProps = {
  callback: null,
  isOpen: false,
  body: '',
};
