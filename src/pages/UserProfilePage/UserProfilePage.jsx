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
import NotFound from '../NotFoundPage';
import Button from '../../components/Button';
import { serverHost } from '../../config';
import ActivityTable from '../../components/ActivityTable';

/*----------------------------------------------------------------------------------------------*/

/**
 * @module UserProfilePage: Genera una página en la que se mostrará la información básica
 * de un becado.
 *
 * @todo Colocar un color adecuado para cada cada sección del chart, es decir, ver el color
 * predominante del ícono que al que pertenece el área, es preferible que esto pueda venir
 * del backend, puesto que es complicado hacerlo en frontend, debido a que está sujeto a procesos
 * asincrónicos por la consulta.
 */

/*----------------------------------------------------------------------------------------------*/

ChartJS.register(ArcElement, Tooltip, Legend);

function UserProfilePage() {
  // Estados de información
  const { userId } = useParams();
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState([[]]);
  const [completedAct, setCompletedAct] = useState([]);
  const [deptDetails, setDeptDetails] = useState([]);
  const [chartData, setChartData] = useState({});
  const [notFound, setNotFound] = useState(false);

  // Hooks de carga de información
  const {
    info: loggedInfo,
    error: errorInfo,
    loading: loadingInfo,
  } = useUserInfo(userId);
  const {
    info: enrolledActivities,
    loading: loadingActivities,
    error: errorActivities,
  } = useEnrolledActivities(userId);

  // Si no encuentra al usuario o hay algún error relacionado con la información
  // se tomará como datos no encontrados
  useEffect(() => {
    if (errorInfo) {
      setNotFound(true);
    }
  }, [errorInfo, errorActivities]);

  // Efecto de animación de carga
  useEffect(() => {
    if ((loadingInfo || !loggedInfo) && !errorInfo) {
      setLoading(true);
    } else if ((loadingActivities || !enrolledActivities) && !errorActivities) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [loadingInfo, loadingActivities]);

  // Efecto que maneja las actividades comunes y completadas.
  useEffect(() => {
    let newArr = [];
    const completed = [];
    if (enrolledActivities) {
      enrolledActivities.forEach((value) => {
        if (value.completed) {
          completed.push(value);
        }
      });

      newArr = enrolledActivities.map((value) => {
        const temp = value;

        if (value.activity) {
          temp.activity.date = value.activity.date.slice(0, 10);
        }
        return temp;
      });
    }
    setCompletedAct(completed);
    setContent(newArr);
  }, [enrolledActivities]);

  // Efecto que maneja las areas en las que únicamente se han completado actividades,
  // guarda en el estado un arreglo de objetos donde cada objeto posee el ID del área,
  // su nombre, y cuántas horas totales completadas posee por el perfil.
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

  // Manejo de datos del chart, utiliza la misma información que las áreas, sin
  // embargo posee una sintaxis especial que hay que mapear.
  useEffect(() => {
    console.log(deptDetails);
    const newData = {
      labels: [],
      datasets: [
        {
          label: '# de Horas',
          data: [],
          backgroundColor: [
            '#E18634',
          ],
          borderColor: [
            '#7d4a1b',
          ],
          borderWidth: 2,
        },
      ],
    };
    newData.labels = [];
    deptDetails.forEach(async (value) => {
      newData.labels.push(value.name);
      newData.datasets[0].data.push(value.hours);
    });
    setChartData(newData);
  }, [deptDetails]);

  return notFound ? <NotFound /> : (
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
              uri={`/image/user/${loggedInfo ? loggedInfo.id : ''}`}
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
                    enrolledActivities ? Object.keys(enrolledActivities).length : '0'
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
            <h3>Clasificación de horas de servicio</h3>
            <div className={styles.areaDetails}>
              {deptDetails.length !== 0 ? (
                <>
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
                    <Doughnut data={chartData} className={styles.chart} />
                  </div>
                </>
              ) : <span>No se ha completado ninguna actividad aún...</span>}
            </div>
          </div>
          <div className={styles.allActivities}>
            <h3>Actividades Realizadas</h3>
            <ActivityTable data={content} loading={loading} />
          </div>
        </div>
      )}
      {errorInfo ? <div>Ocurrió un error</div> : undefined}
    </div>
  );
}

/*----------------------------------------------------------------------------------------------*/

export default UserProfilePage;
