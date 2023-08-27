import React from 'react';
import PropTypes from 'prop-types';
import PopUp from '@components/PopUp';
import styles from './SuccessNotificationPopUp.module.css';

function SuccessNotificationPopUp({
  close, isOpen, title, text, callback,
}) {
  return (
    isOpen && (
    <PopUp close={close} maxWidth={370} callback={callback}>
      <div className={styles.notification}>
        <div className={styles.iconContainer}>
          <svg className={styles.checkmark} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle className={styles.checkmark__circle} cx="26" cy="26" r="25" fill="none" />
            <path className={styles.checkmark__check} fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
          </svg>
        </div>
        {title ? <h2>{title}</h2> : null}
        {text ? <p>{text}</p> : null}
      </div>
    </PopUp>
    )
  );
}

export default SuccessNotificationPopUp;

SuccessNotificationPopUp.propTypes = {
  close: PropTypes.func.isRequired,
  callback: PropTypes.func,
  title: PropTypes.string,
  text: PropTypes.string,
  isOpen: PropTypes.bool,
};

SuccessNotificationPopUp.defaultProps = {
  callback: null,
  text: 'Operación realizada exitosamente',
  title: 'La operación se realizó correctamente.',
  isOpen: false,
};
