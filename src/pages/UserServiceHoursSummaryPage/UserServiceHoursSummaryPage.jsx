/* eslint-disable arrow-body-style */
import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import PropTypes from 'prop-types';
import NoActivitiesBanner from '@assets/banner/rest-banner.svg';
import styles from './UserServiceHoursSummaryPage.module.css';
import LoadingView from '../../components/LoadingView';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import useUserInfo from '../../hooks/useUserInfo';
import NotFound from '../NotFoundPage';
import { serverHost } from '../../config';
import ActivityTable from '../../components/ActivityAssignmentTable';

/*----------------------------------------------------------------------------------------------*/

/**
 * @module UserServiceHoursSummaryPage: Genera una página en la que se mostrará el resumen de las
 * horas de servicio de un becado.
 * @todo Colocar un color adecuado para cada cada sección del chart, es decir, ver el color
 * predominante del ícono que al que pertenece el área, es preferible que esto pueda venir
 * del backend, puesto que es complicado hacerlo en frontend, debido a que está sujeto a procesos
 * asincrónicos por la consulta.
 */

/*----------------------------------------------------------------------------------------------*/

ChartJS.register(ArcElement, Tooltip, Legend);

function UserServiceHoursSummaryPage({ userId }) {
  // Estados de información
  const [loading, setLoading] = useState(true);
  const [deptDetails, setDeptDetails] = useState([]);
  const [chartData, setChartData] = useState({});
  const [notFound, setNotFound] = useState(false);

  // Hooks de carga de información
  const {
    info: loggedInfo,
    error: errorInfo,
    loading: loadingInfo,
  } = useUserInfo(userId);

  const activitiesCompleted = loggedInfo?.serviceHours.activitiesCompleted ?? 0;

  // Si no encuentra al usuario o hay algún error relacionado con la información
  // se tomará como datos no encontrados
  useEffect(() => {
    if (errorInfo) {
      setNotFound(true);
    }
  }, [errorInfo]);

  // Efecto de animación de carga
  useEffect(() => {
    if ((loadingInfo || !loggedInfo) && !errorInfo) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [loadingInfo]);

  // Obtiene las horas de servicio por area del usuario, las formatea y filtra
  useEffect(() => {
    const areas = loggedInfo?.serviceHours.areas.map((area) => ({
      id: area.asigboArea.id,
      name: area.asigboArea.name,
      hours: area.total,
      color: area.asigboArea.color,
    }));
    setDeptDetails(areas?.filter((area) => area.hours > 0));
  }, [loggedInfo]);

  // Manejo de datos del chart, utiliza la misma información que las áreas, sin
  // embargo posee una sintaxis especial que hay que mapear.
  useEffect(() => {
    if (!deptDetails) return;
    const newData = {
      labels: [],
      datasets: [
        {
          label: '# de Horas',
          data: [],
          backgroundColor: [],
          borderColor: [],
          borderWidth: 2,
        },
      ],
    };
    newData.labels = [];
    deptDetails.forEach(async (value) => {
      newData.labels.push(value.name);
      newData.datasets[0].data.push(value.hours);
      newData.datasets[0].backgroundColor.push(value.color ? `${value.color}BB` : '#E18634BB');
      newData.datasets[0].borderColor.push(value.color ? `${value.color}FF` : '#E18634FF');
    });
    setChartData(newData);
  }, [deptDetails]);

  return notFound ? <NotFound /> : (
    <div className={styles.main}>
      {loading ? (
        <LoadingView />
      ) : (
        <div className={styles.infoBlock}>
          <div className={styles.serviceBlock}>
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
                  {`${activitiesCompleted} ${activitiesCompleted !== 1 ? 'actividades' : 'actividad'}`}
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
                    <ul key={`areaList${userId}`}>
                      { deptDetails
                        ? deptDetails.map((value, _index, array) => {
                          return (
                            <li key={value.id + array} className={styles.areaListItem}>
                              <img src={`${serverHost}/image/area/${value.id}`} alt="Logotipo" className={styles.areaListIcon} />
                              <b>{`${value.name}:`}</b>
                              {`${value.hours} horas`}
                            </li>
                          );
                        })
                        : 'No se ha completado ninguna actividad aún...'}
                    </ul>
                  </div>
                  <div className={styles.chartContainer}>
                    <Doughnut data={chartData} className={styles.chart} key={`chartID ${userId}`} />
                  </div>
                </>
              ) : (
                <div className={styles.noActivityContent}>
                  <img src={NoActivitiesBanner} alt="sin actividades" />
                  <span>Aún no se han completado actividades</span>
                </div>
              )}
            </div>
          </div>
          <div className={styles.allActivities}>
            <h3>Actividades Realizadas</h3>
            <ActivityTable id={userId} />
          </div>
        </div>
      )}
      {errorInfo ? <div>Ocurrió un error</div> : undefined}
    </div>
  );
}

/*----------------------------------------------------------------------------------------------*/

export default UserServiceHoursSummaryPage;

UserServiceHoursSummaryPage.propTypes = {
  userId: PropTypes.string.isRequired,
};

UserServiceHoursSummaryPage.defaultProps = {
};
