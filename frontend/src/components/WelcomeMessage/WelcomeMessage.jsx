import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import logo from '@assets/logo/logo_blanco.png';
import { IoClose as CloseIcon } from 'react-icons/io5';
import ConfettiGenerator from 'confetti-js';
import styles from './WelcomeMessage.module.css';
import useSessionData from '../../hooks/useSessionData';
import consts from '../../helpers/consts';

function WelcomeMessage({ isOpen, close }) {
  const session = useSessionData();

  const canvasRef = useRef();

  useEffect(() => {
    if (!canvasRef.current) return;
    const confettiSettings = {
      target: canvasRef.current,
      max: '80',
      size: '1',
      animate: true,
      props: ['circle', 'square', 'triangle', 'line'],
      colors: [
        [165, 104, 246],
        [230, 61, 135],
        [0, 199, 228],
        [253, 214, 126],
      ],
      clock: '15',
      rotate: true,
      width: '1536',
      height: '707',
      start_from_edge: false,
      respawn: true,
    };
    const confetti = new ConfettiGenerator(confettiSettings);
    confetti.render();

    // eslint-disable-next-line consistent-return
    return () => confetti.clear();
  }, [canvasRef.current, isOpen]);

  return (
    isOpen && (
      <div className={styles.welcomeMessage}>
        <canvas ref={canvasRef} className={styles.confettiCanvas} />
        {session && (
          <div className={styles.container}>
            <CloseIcon
              className={styles.closeIcon}
              onClick={close}
              onKeyUp={close}
              tabIndex={0}
              role="button"
            />
            <img src={logo} alt="Logo asigbo" className={styles.logo} />
            <h1 className={styles.mainTitle}>
              {`${session?.sex === consts.sex.masculine ? '¡Bienvenido' : '¡Bienvenida'} ${
                session?.name
              }!`}
            </h1>
            <p className={styles.content}>
              {`¡Te damos una calurosa bienvenida al nuevo y mejorado portal de ASIGBO! Estamos
              encantados de que estés aquí, ${
                session?.sex === consts.sex.masculine ? 'listo' : 'lista'
              } para aprovechar al máximo las posibilidades que
              esta herramienta tiene para ofrecerte.`}
            </p>
          </div>
        )}
      </div>
    )
  );
}

export default WelcomeMessage;

WelcomeMessage.propTypes = {
  isOpen: PropTypes.bool,
  close: PropTypes.func,
};

WelcomeMessage.defaultProps = {
  isOpen: false,
  close: null,
};
