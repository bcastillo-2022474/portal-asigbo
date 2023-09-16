/* eslint-disable no-nested-ternary */
/* eslint-disable no-unused-vars */
import React from 'react';
import PropTypes from 'prop-types';
import styles from './ActivityDetails.module.css';
import DataField from '../DataField';

function ActivityDetails({ className, data }) {
  return (
    <div className={`${styles.main} ${className}`}>
      <h2 className={styles.dataHeader}>Datos de la actividad</h2>
      <div className={styles.data}>
        <DataField label="Nombre de actividad" className={styles.dataField}>
          {data ? data.name : ''}
        </DataField>
        <DataField label="Eje de ASIGBO" className={styles.dataField}>
          {data ? data.asigboArea.name : ''}
        </DataField>
        <DataField label="Fecha de realización" className={styles.dataField}>
          {data ? data.date.slice(0, 10) : ''}
        </DataField>
        <DataField label="Horas de servicio" className={styles.dataField}>
          {data ? (data.serviceHours > 1 ? `${data.serviceHours} horas` : `${data.serviceHours} hora`) : ''}
        </DataField>
        <DataField label="Descripción" className={styles.desc}>
          Descripción
        </DataField>
        <DataField label="Pago requerido" className={styles.dataField}>
          N/A
        </DataField>
      </div>
      <h3 className={styles.disponibility}>Disponibilidad</h3>
      <div className={styles.disponData}>
        <DataField label="Espacios disponibles" className={styles.disponField}>
          {data ? data.availableSpaces : '0'}
        </DataField>
        <DataField label="Disponibilidad de inscripción" className={styles.disponField}>
          De
          <span className={styles.date}>{data ? data.registrationStartDate.slice(0, 10) : '00/00/0000'}</span>
          hasta
          <span className={styles.date}>{data ? data.registrationEndDate.slice(0, 10) : '00/00/0000'}</span>
        </DataField>
      </div>
    </div>
  );
}

ActivityDetails.propTypes = {
  className: PropTypes.string,
  data: PropTypes.instanceOf(Object),
};

ActivityDetails.defaultProps = {
  className: '',
  data: null,
};

export default ActivityDetails;
