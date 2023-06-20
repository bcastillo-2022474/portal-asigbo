import React, { useEffect } from 'react';
import HolderIcon from '../../assets/icons/HolderIcon';
import styles from './UserProfilePage.module.scss';
import useLoggedInfo from '../../hooks/useLoggedInfo';
import LoadingView from '../../components/LoadingView';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import Table from '../../components/Table/Table';

function UserProfilePage() {
  const { info, error, loading } = useLoggedInfo();

  useEffect(() => {
    console.log(info);
  }, []);

  return (
    <div className={styles.main}>
      {loading || error ? <LoadingView /> : (
        <div className={styles.infoBlock}>
          <h1>Información del Becado</h1>
          <div className={styles.holderDetails}>
            <HolderIcon fill="#000000" className={styles.holderIcon} />
            <div className={styles.holderInfo}>
              <h2>{`${info ? info.name : ''} ${info ? info.lastname : ''}`}</h2>
              <span>
                <b>Código: </b>
                <b>{info ? info.code : ''}</b>
              </span>
              <span>
                <b>Promoción: </b>
                {info ? info.promotion : ''}
              </span>
              <span>
                <b>Carrera: </b>
                {info ? info.career : ''}
              </span>
            </div>
          </div>
          <div className={styles.serviceBlock}>
            <h1>Horas de servicio</h1>
            <div className={styles.serviceDetails}>
              <div className={styles.totalHours}>
                <span>Total de horas de servicio</span>
                <h2>
                  {`${info ? info.serviceHours.total : '0'} horas`}
                </h2>
              </div>
              <div className={styles.totalHours}>
                <span>Actividades participadas</span>
                <h2>{`${info ? info.serviceHours.areas.length : '0'} actividades`}</h2>
              </div>
              <div className={styles.progressContainer}>
                <span>Porcentaje de horas beca requisito completadas</span>
                <ProgressBar progress={65} />
              </div>
            </div>
            <Table />
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProfilePage;
