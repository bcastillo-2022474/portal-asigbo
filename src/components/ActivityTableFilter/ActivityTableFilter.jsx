/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import styles from './ActivityTableFilter.module.css';
import InputSearchDate from '../InputSearchDate';

function ActivityTableFilter() {
  const [initialDate, setInitialDate] = useState();
  const [finalDate, setFinalDate] = useState();

  return (
    <div className={styles.activityFilter}>
      Hola
      <InputSearchDate className={styles.dateInput} placeholder="Fecha de Incio" setDate={setInitialDate} />
      <InputSearchDate className={styles.dateInput} placeholder="Fecha de Culminación" setDate={setFinalDate} disabledBefore={initialDate} />
    </div>
  );
}

ActivityTableFilter.propTypes = {};

export default ActivityTableFilter;
