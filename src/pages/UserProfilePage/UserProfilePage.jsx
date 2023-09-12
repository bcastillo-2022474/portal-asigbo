/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useLoggedInfo from '@hooks/useLoggedInfo';
import HolderIcon from '../../assets/icons/HolderIcon';
import styles from './UserProfilePage.module.css';
import useEnrolledActivities from '../../hooks/useEnrolledActivities';
import LoadingView from '../../components/LoadingView';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import Table2 from '../../components/Table2/Table';
import useUserInfo from '../../hooks/useUserInfo';
import { serverHost } from '../../config';

/**
 * @module UserProfilePage: Genera una página en la que se mostrará la información básica
 * de un becado.
 */

function UserProfilePage() {
  const { userId } = useParams();
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState([[]]);
  const { info: loggedInfo, error: errorInfo, loading: loadingInfo } = useUserInfo(userId);
  const {
    info: loggedActivities,
    error: errorActivities,
    loading: loadingActivities,
  } = useEnrolledActivities(userId);

  const headers = ['No.', 'Actividad', 'Horas de servicio', 'Fecha', 'Eje'];

  useEffect(() => {
    if (loadingInfo || loadingActivities) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [loadingInfo, loadingActivities]);

  const onError = () => {
    console.log('Error');
  };

  useEffect(() => {
    console.log(loggedInfo);
  }, [loggedInfo]);

  useEffect(() => {
    console.log(loggedActivities);
  }, [loggedActivities]);

  useEffect(() => {
    let newArr = [];
    if (loggedActivities) {
      newArr = loggedActivities.map((value, index) => {
        const item = [];
        item.push(index);
        item.push(value.name);
        item.push(value.serviceHours);
        item.push(value.date.slice(0, 10));
        item.push(value.asigboArea.name);
        return item;
      });
    }
    setContent(newArr);
  }, [loggedActivities]);

  return (
    <div className={styles.main}>
      {loading ? <LoadingView /> : (
        <div className={styles.infoBlock}>
          <h1>Información del Becado</h1>
          <div className={styles.holderDetails}>
            <HolderIcon fill="#000000" className={styles.holderIcon} />
            <div className={styles.holderInfo}>
              <h2>{`${loggedInfo ? loggedInfo.name : ''} ${loggedInfo ? loggedInfo.lastname : ''}`}</h2>
              <span>
                <b>Código: </b>
                <b>{loggedInfo ? loggedInfo.code : ''}</b>
              </span>
              <span>
                <b>Promoción: </b>
                {loggedInfo ? loggedInfo.promotion : ''}
              </span>
              <span>
                <b>Carrera: </b>
                {loggedInfo ? loggedInfo.career : ''}
              </span>
            </div>
          </div>
          <div className={styles.serviceBlock}>
            <h1>Horas de servicio</h1>
            <div className={styles.serviceDetails}>
              <div className={styles.totalHours}>
                <span>Total de horas de servicio</span>
                <h2>
                  {`${loggedInfo ? `${loggedInfo.serviceHours ? loggedInfo.serviceHours.total : '0'}` : '0'} horas`}
                </h2>
              </div>
              <div className={styles.totalHours}>
                <span>Actividades participadas</span>
                <h2>{`${loggedActivities ? Object.keys(loggedActivities).length : '0'} actividades`}</h2>
              </div>
              <div className={styles.progressContainer}>
                <span>Porcentaje de horas beca requisito completadas</span>
                <ProgressBar progress={loggedInfo ? (loggedInfo.serviceHours.total / 2) : 0} />
              </div>
            </div>
            {errorActivities
              ? <span>{errorActivities.message}</span>
              : <Table2 headers={headers} content={content} />}
          </div>
        </div>
      )}
      {errorInfo ? <div>Ocurrió un error</div> : undefined}
      <img src={`${serverHost}/image/user/${userId}`} alt="Imágen" onError={onError} />
    </div>
  );
}

export default UserProfilePage;
