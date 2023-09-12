/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import styles from './ActivityTableFilter.module.css';
import InputSearchDate from '../InputSearchDate';
import SearchInput from '../SearchInput/SearchInput';

function ActivityTableFilter() {
  const [initialDate, setInitialDate] = useState();
  const [finalDate, setFinalDate] = useState();

  return (
    <div className={styles.activityFilter}>
      <div className={styles.selectDate}>
        <span>Desde:</span>
        <InputSearchDate className={styles.dateInput} placeholder="Fecha de Incio" setDate={setInitialDate} />
      </div>
      <div className={styles.selectDate}>
        <span>Hasta:</span>
        <InputSearchDate className={styles.dateInput} placeholder="Fecha de Culminación" setDate={setFinalDate} disabledBefore={initialDate} />
      </div>
      <div className={styles.searchInput}>
        <SearchInput />
      </div>
    </div>
  );
}

ActivityTableFilter.propTypes = {};

export default ActivityTableFilter;
