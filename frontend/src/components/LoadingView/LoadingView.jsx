import React from 'react';
import styles from './LoadingView.module.css';

function LoadingView() {
  return (
    <div className={styles.loadingView}>
      <div className={styles.spinner1}>
        <div className={styles.spinner2}>
          <div className={styles.spinner3} />
        </div>
      </div>
    </div>
  );
}

export default LoadingView;
