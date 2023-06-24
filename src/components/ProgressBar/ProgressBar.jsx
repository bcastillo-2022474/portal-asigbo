// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import styles from './ProgressBar.module.css';

function ProgressBar({ progress }) {
  const [currentProgress, setProgress] = useState(0);
  const [fader, setFader] = useState(true);

  useEffect(() => {
    const delayer = setTimeout(() => {
      setProgress(progress);
    }, 200);
    return () => clearTimeout(delayer);
  }, [progress]);

  useEffect(() => {
    const delayer = setTimeout(() => {
      setFader(false);
    }, 200);
    return () => clearTimeout(delayer);
  }, []);

  return (
    <div className={styles.progressBar}>
      <div className={styles.progressBackground} style={{ '--progress': `${currentProgress}%` }}>
        <div className={styles.progressIndicator} />
      </div>
      <div className={`${styles.progressLabel} ${fader ? styles.hidden : styles.visible}`}>{`${progress}%`}</div>
    </div>
  );
}

ProgressBar.propTypes = {
  progress: PropTypes.number.isRequired,
};

export default ProgressBar;
