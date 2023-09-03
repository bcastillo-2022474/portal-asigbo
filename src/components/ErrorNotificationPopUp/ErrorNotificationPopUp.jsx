import React from 'react';
import PropTypes from 'prop-types';
import PopUp from '@components/PopUp';
import styles from './ErrorNotificationPopUp.module.css';

function ErrorNotificationPopUp({
  close, title, text, callback,
}) {
  return (
    <PopUp close={close} maxWidth={370} callback={callback}>
      <div className={styles.notification}>
        <div className={styles.iconContainer}>
          <svg className={styles.crossmark} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle className={styles.crossmark__circle} cx="26" cy="26" r="25" fill="none" />
            <path className={`${styles.cross__path} ${styles.cross__path__right}`} fill="none" d="M16,16 l20,20" />
            <path className={`${styles.cross__path} ${styles.cross__path__left}`} fill="none" d="M16,36 l20,-20" />
          </svg>
        </div>
        {title ? <h2>{title}</h2> : null}
        {text ? <p>{text}</p> : null}
      </div>
    </PopUp>
  );
}

export default ErrorNotificationPopUp;

ErrorNotificationPopUp.propTypes = {
  close: PropTypes.func.isRequired,
  callback: PropTypes.func,
  title: PropTypes.string,
  text: PropTypes.string,
};

ErrorNotificationPopUp.defaultProps = {
  callback: null,
  text: 'Ocurrió un error.',
  title: 'Ocurrió un error',
};
