/* eslint-disable no-unused-vars */
/* eslint-disable arrow-body-style */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { IoMdSettings } from 'react-icons/io';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import styles from './UserProfilePage.module.css';
import useEnrolledActivities from '../../hooks/useEnrolledActivities';
import LoadingView from '../../components/LoadingView';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import useUserInfo from '../../hooks/useUserInfo';
import ProfilePicture from '../../components/ProfilePicture/ProfilePicture';
import Button from '../../components/Button';
import { serverHost } from '../../config';

/**
 * @module UserProfilePage: Genera una página en la que se mostrará la información básica
 * de un becado.
 */

ChartJS.register(ArcElement, Tooltip, Legend);

const data = {
  labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
  datasets: [
    {
      label: '# of Votes',
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
      ],
      borderWidth: 1,
    },
  ],
};

function UserProfilePage() {
  const { userId } = useParams();
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [content, setContent] = useState([[]]);
  const [completedAct, setCompletedAct] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [deptDetails, setDeptDetails] = useState([]);
  const {
    info: loggedInfo,
    error: errorInfo,
    loading: loadingInfo,
  } = useUserInfo(userId);
  const { info: loggedActivities, loading: loadingActivities } = useEnrolledActivities(userId);

  useEffect(() => {
    if (loadingInfo || loadingActivities) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [loadingInfo, loadingActivities]);

  useEffect(() => {
    let newArr = [];
    const completed = [];
    if (loggedActivities) {
      loggedActivities.forEach((value) => {
        if (value.completed) {
          completed.push(value);
        }
      });

      newArr = loggedActivities.map((value) => {
        const temp = value;

        if (value.activity) {
          temp.activity.date = value.activity.date.slice(0, 10);
        }
        return temp;
      });
    }
    setCompletedAct(completed);
    setContent(newArr);
  }, [loggedActivities]);

  useEffect(() => {
    const auxObj = {};
    const areas = [];
    if (completedAct) {
      completedAct.forEach((value) => {
        const temp = {};
        temp.areaId = value.activity.asigboArea.id;
        temp.areaName = value.activity.asigboArea.name;

        if (auxObj[temp.areaId]) {
          auxObj[temp.areaId] += value.activity.serviceHours;
        } else {
          auxObj[temp.areaId] = value.activity.serviceHours;
        }
      });
    }
    Object.keys(auxObj).forEach((valueKeys) => {
      const values = completedAct.find(
        (object) => object.activity.asigboArea.id === valueKeys,
      );

      if (values) {
        const area = {};
        area.id = values.activity.asigboArea.id;
        area.name = values.activity.asigboArea.name;
        area.hours = auxObj[valueKeys];
        areas.push(area);
      }
    });
    setDeptDetails(areas);
  }, [completedAct]);

  useEffect(() => {
    console.log(deptDetails);
  }, [deptDetails]);

  return (
    <div className={styles.main}>
      {loading ? (
        <LoadingView />
      ) : (
        <div className={styles.infoBlock}>
          <div className={styles.pageHeader}>
            <h1>Información del Becado</h1>
            <Button className={styles.adminButton}>
              Administrar
              <IoMdSettings className={styles.adminButtIcon} />
            </Button>
          </div>
          <div className={styles.holderDetails}>
            <ProfilePicture
              uri="https://placehold.co/600x600"
              className={styles.pfp}
            />
            <div className={styles.holderInfo}>
              <h2>
                {`${loggedInfo ? loggedInfo.name : ''} ${
                  loggedInfo ? loggedInfo.lastname : ''
                }`}

              </h2>
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
                  {`${
                    loggedInfo
                      ? `${
                        loggedInfo.serviceHours
                          ? loggedInfo.serviceHours.total
                          : '0'
                      }`
                      : '0'
                  } horas`}
                </h2>
              </div>
              <div className={styles.totalHours}>
                <span>Actividades participadas</span>
                <h2>
                  {`${
                    loggedActivities ? Object.keys(loggedActivities).length : '0'
                  } actividades`}

                </h2>
              </div>
              <div className={styles.progressContainer}>
                <span>Porcentaje de horas beca requisito completadas</span>
                <ProgressBar
                  progress={loggedInfo ? loggedInfo.serviceHours.total / 2 : 0}
                />
              </div>
            </div>
          </div>
          <div className={styles.areaClasification}>
            <h4>Clasificación de horas de servicio</h4>
            <div className={styles.areaDetails}>
              <div className={styles.areaList}>
                <ul>
                  { deptDetails
                    ? deptDetails.map((value, _index, array) => {
                      return (
                        <li key={value + array} className={styles.areaListItem}>
                          <img src={`${serverHost}/image/area/${value.id}`} alt="Logotipo" className={styles.areaListIcon} />
                          <b>{`${value.name}:`}</b>
                          {`${value.hours} horas`}
                        </li>
                      );
                    })
                    : 'Hola'}
                </ul>
              </div>
              <div className={styles.chartContainer}>
                <Doughnut data={data} className={styles.chart} />
              </div>
            </div>
          </div>
        </div>
      )}
      {errorInfo ? <div>Ocurrió un error</div> : undefined}
    </div>
  );
}

export default UserProfilePage;
