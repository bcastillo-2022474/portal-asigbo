import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import styles from './ProgressBar.module.css';

/**
 * @module ProgressBar: Barra de progreso que se rellena en función de su porcentaje, posee
 * un label en sus alrededores.
 *
 * @param {number} progress: Progreso que se desea mostrar en porcentaje, es decir, recibirá
 * un número entre 0 y 100, admite puntos flotantes.
 * @param {string} className: Clase(s) a añadir al componente padre de la barra de progreso.
 *
 * @export ProgressBar
 */

function ProgressBar({ progress, className }) {
  // Progreso y Fader de animación
  const [currentProgress, setProgress] = useState(0);
  const [fader, setFader] = useState(true);

  const checkType = (number) => {
    if (Number.isNaN(number)) {
      setProgress(0);
      return false;
    } if (typeof number === 'string') {
      setProgress(0);
      return false;
    }
    return true;
  };

  // Espera para colocar animación al modificar el porcentaje
  useEffect(() => {
    checkType(progress);
    const delayer = setTimeout(() => {
      if (checkType(progress)) {
        setProgress(progress);
      }
    }, 200);
    return () => clearTimeout(delayer);
  }, [progress]);

  // Espera para colocar animación al cargar el componente
  useEffect(() => {
    checkType(progress);
    const delayer = setTimeout(() => {
      setFader(false);
    }, 200);
    return () => clearTimeout(delayer);
  }, []);

  return (
    <div className={`${styles.progressBar} ${className}`}>
      <div className={styles.progressBackground} style={{ '--progress': `${currentProgress}%` }}>
        <div className={styles.progressIndicator} />
      </div>
      <div className={`${styles.progressLabel} ${fader ? styles.hidden : styles.visible}`}>{`${currentProgress}%`}</div>
    </div>
  );
}

ProgressBar.propTypes = {
  progress: PropTypes.number.isRequired,
  className: PropTypes.string,
};

ProgressBar.defaultProps = {
  className: '',
};

export default ProgressBar;
