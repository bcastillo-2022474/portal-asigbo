import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './ActivityTableFilter.module.css';
import InputSearchDate from '../InputSearchDate';
import SearchInput from '../SearchInput/SearchInput';

/*----------------------------------------------------------------------------------------------*/

/**
 * @module ActivityTableFilter: Componente destinado a manejar los **valores** sobre los cuales
 * se filtrará un objeto de actividades, incluye rango de fechas y búsqueda por texto.
 *
 * @param {function} searchHandler: Función a la que se le pasará el parámetro de búsqueda como
 * parámetro de la misma.
 * @param {function} initialDateHandler: Función a la que se le pasará la cota inferior de fecha,
 * es decir **DESDE** qué fecha se filtrará.
 * @param {function} finalDateHandler: Función a la que se la pasará la cota superior de fecha,
 * es decir **HASTA** qué fecha se filtrará.
 *
 * @requires <SearchInput/>,<InputSearchDate/>
 */

/*----------------------------------------------------------------------------------------------*/

function ActivityTableFilter({
  searchHandler, initialDateHandler, finalDateHandler, className,
}) {
  const [initialDate, setInitialDate] = useState();
  const [finalDate, setFinalDate] = useState();

  useEffect(() => {
    if (initialDateHandler) initialDateHandler(initialDate);
  }, [initialDate]);

  useEffect(() => {
    if (finalDateHandler) finalDateHandler(finalDate);
  }, [finalDate]);

  return (
    <div className={`${styles.activityFilter} ${className || ''}`}>
      <div className={styles.selectDate}>
        <span>Desde:</span>
        <InputSearchDate className={styles.dateInput} placeholder="Fecha de inicio" setDate={setInitialDate} disabledAfter={finalDate} />
      </div>
      <div className={styles.selectDate}>
        <span>Hasta:</span>
        <InputSearchDate className={styles.dateInput} placeholder="Fecha de culminación" setDate={setFinalDate} disabledBefore={initialDate} />
      </div>
      <div className={styles.searchInput}>
        <SearchInput handleSearch={searchHandler} />
      </div>
    </div>
  );
}

/*----------------------------------------------------------------------------------------------*/

ActivityTableFilter.propTypes = {
  searchHandler: PropTypes.func,
  initialDateHandler: PropTypes.func,
  finalDateHandler: PropTypes.func,
  className: PropTypes.string,
};

ActivityTableFilter.defaultProps = {
  searchHandler: null,
  initialDateHandler: null,
  finalDateHandler: null,
  className: null,
};

/*----------------------------------------------------------------------------------------------*/

export default ActivityTableFilter;
