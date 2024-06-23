/* eslint-disable no-nested-ternary */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import styles from './ActivityDetails.module.css';
import DataField from '../DataField';
import CheckIcon from '../../assets/icons/CheckIcon';
import EnrolledIcon from '../../assets/icons/EnrolledIcon';
import consts from '../../helpers/consts';
import randomString from '../../helpers/randomString';

function ActivityDetails({ className, data }) {
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (data?.userAssignment) {
      setIsEnrolled(true);
      setIsCompleted(data?.userAssignment.completed);
      return;
    }

    setIsCompleted(false);
    setIsEnrolled(false);
  }, [data]);

  return (
    <div className={`${styles.main} ${className}`}>
      <div className={styles.detailsHeader}>
        <h2 className={styles.dataHeader}>Datos de la actividad</h2>
        <div className={styles.status}>
          {isEnrolled ? (
            isCompleted ? (
              <>
                <b>COMPLETADO</b>
                <CheckIcon className={styles.statusIcon} />
              </>
            ) : (
              <>
                <b>INSCRITO</b>
                <EnrolledIcon className={styles.statusIcon} />
              </>
            )
          ) : (
            ''
          )}
        </div>
      </div>
      <div className={styles.data}>
        {data?.description?.trim().length > 0 && (
        <p className={styles.description}>
          {data?.description}
        </p>
        )}
        <DataField label="Nombre de actividad" className={styles.dataField}>
          {data ? data?.name : ''}
        </DataField>
        <DataField label="Eje de ASIGBO" className={styles.dataField}>
          {data ? data?.asigboArea.name : ''}
        </DataField>
        <DataField label="Fecha de realización" className={styles.dataField}>
          {data ? dayjs(data?.date.slice(0, 10), 'YYYY-MM-DD').format('DD/MM/YYYY') : ''}
        </DataField>
        <DataField label="Horas de servicio" className={styles.dataField}>
          {data
            ? data?.serviceHours !== 1
              ? `${data?.serviceHours} horas`
              : `${data?.serviceHours} hora`
            : ''}
          {data?.userAssignment?.aditionalServiceHours > 0
            ? ` (+ ${data?.userAssignment?.aditionalServiceHours} ${
              data?.userAssignment?.aditionalServiceHours > 1 ? 'adicionales' : 'adicional'
            })`
            : ''}
        </DataField>

        <DataField label="Pago requerido" className={styles.dataField}>
          N/A
        </DataField>
      </div>
      <h3 className={`${styles.disponibility} ${styles.dataField}`}>Disponibilidad</h3>
      <div className={styles.disponData}>
        <DataField
          label="Espacios disponibles"
          className={`${styles.disponField} ${styles.dataField}`}
        >
          {data ? data?.availableSpaces : '0'}
        </DataField>
        <DataField
          label="Disponibilidad de inscripción"
          className={`${styles.disponField} ${styles.dataField}`}
        >
          {`De ${
            data
              ? dayjs(data?.registrationStartDate.slice(0, 10), 'YYYY-MM-DD').format('DD/MM/YYYY')
              : '00/00/0000'
          } hasta ${
            data
              ? dayjs(data?.registrationEndDate.slice(0, 10), 'YYYY-MM-DD').format('DD/MM/YYYY')
              : '00/00/0000'
          }
          `}
        </DataField>
        {data?.participatingPromotions ? (
          <>
            <span className={`${styles.promoLabel}`}>Promociones Participantes</span>
            <div className={styles.promosContainer}>
              {data?.participatingPromotions.sort((a, b) => b - a).map((promo) => (
                <span className={styles.promo} key={randomString()}>
                  {consts.promotionsGroups[promo] ? `${consts.promotionsGroups[promo]}` : promo}
                </span>
              ))}
            </div>
          </>
        ) : (
          ''
        )}
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
