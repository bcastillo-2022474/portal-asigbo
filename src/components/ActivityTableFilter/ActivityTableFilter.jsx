/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './ActivityTableFilter.module.css';
import InputSearchDate from '../InputSearchDate';
import SearchInput from '../SearchInput/SearchInput';

function ActivityTableFilter({ searchHandler, initialDateHandler, finalDateHandler }) {
  const [initialDate, setInitialDate] = useState();
  const [finalDate, setFinalDate] = useState();

  useEffect(() => {
    if (initialDateHandler) initialDateHandler(initialDate);
  }, [initialDate]);

  useEffect(() => {
    if (finalDateHandler) finalDateHandler(finalDate);
  }, [finalDate]);

  return (
    <div className={styles.activityFilter}>
      <div className={styles.selectDate}>
        <span>Desde:</span>
        <InputSearchDate className={styles.dateInput} placeholder="Fecha de Incio" setDate={setInitialDate} disabledAfter={finalDate} />
      </div>
      <div className={styles.selectDate}>
        <span>Hasta:</span>
        <InputSearchDate className={styles.dateInput} placeholder="Fecha de Culminación" setDate={setFinalDate} disabledBefore={initialDate} />
      </div>
      <div className={styles.searchInput}>
        <SearchInput handleSearch={searchHandler} />
      </div>
    </div>
  );
}

ActivityTableFilter.propTypes = {
  searchHandler: PropTypes.func,
  initialDateHandler: PropTypes.func,
  finalDateHandler: PropTypes.func,
};

ActivityTableFilter.defaultProps = {
  searchHandler: null,
  initialDateHandler: null,
  finalDateHandler: null,
};

export default ActivityTableFilter;
