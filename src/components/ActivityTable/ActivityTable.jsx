/* eslint-disable no-restricted-syntax */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import ActivityTableFilter from '../ActivityTableFilter/ActivityTableFilter';
import styles from './ActivityTable.module.css';
import Table from '../Table/Table';
import TableRow from '../TableRow';
import { serverHost } from '../../config';

/*----------------------------------------------------------------------------------------------*/
/**
 * @module ActivityTable: Tabla destinada a mostrar actividades, se espera que se le envíen datos
 * compatibles con su layout, además es capaz de filtrar estas actividades por intervalos de fecha
 * y por valores **exactos** en sus campos.
 *
 * @param {boolean} loading: Le indica a la tabla si la información está cargando o no.
 * @param {Object} data: Objeto de datos de tabla, se espera que el esquema utilizado, sea igual
 * al que devuelve el hook useEnrolledActivities.
 *
 * @requires <Table/>,<TableRow/>,<ActivityTableFilter/>
 */

/*----------------------------------------------------------------------------------------------*/

function ActivityTable({ loading, data }) {
  // Estados
  const navigate = useNavigate();
  const [search, setSearch] = useState();
  const [filtrated, setFiltrated] = useState();
  const [initialDate, setInitialDate] = useState();
  const [finalDate, setFinalDate] = useState();

  // Si la búsqieda está vacía la información filtrada es igual a la que proviene del parámetro.
  useEffect(() => {
    if (!search) {
      setFiltrated(data);
    }
  }, [data]);

  // Redirección a actividad.
  const goToActivity = (id) => {
    navigate(`/actividad/${id}`);
  };

  // Redirección a actividad.
  const newTabActivity = (id) => {
    navigate(`/actividad/${id}`);
  };

  // Uso de parámetro de búsqueda con estado.
  const searchHandler = (query) => {
    setSearch(query);
  };

  // Uso de fecha "cota inferior" para filtrado de fechas.
  const initialDateHandler = (date) => {
    setInitialDate(date);
  };

  // Uso de fecha "cota superior" para filtrado de fechas.
  const finalDateHandler = (date) => {
    setFinalDate(date);
  };

  /**
   * @function searchValue: Función que indica si al menos un key dentro del objeto y sus objetos
   * internos posee el parámetro de búsqueda esperado.
   *
   * @param {Object} object: Objeto en el que se buscará
   * @param {string} searchParam Parámetro de búsqueda
   * @returns {boolean} Si encontró que el objeto posee el parámetro de búsqueda
   */
  const searchValue = (object, searchParam) => {
    for (const key in object) {
      if (typeof object[key] === 'object') {
        if (searchValue(object[key], searchParam)) {
          return true;
        }
      } else if (object[key] === searchParam) {
        return true;
      }
    }
    return false;
  };

  /**
   * @function filterBetweenDates: Función que filtra entre las fechas establecidas o dadas,
   * si alguna de ellas se omite, se hará en base a la cota superior o inferior establecida,
   * si se envían las dos cotas, se filtrará entre ambas fechas. Y si no se proporciona ninguna
   * se devolverá el objeto o arreglo exactamente igual al parámetro dado.
   *
   * @param {Object} dataArr: Objeto sobre el que se filtrará
   * @param {string} lowerDate: Cota inferior de fecha.
   * @param {string} upperDate: Cota superior de fecha.
   * @returns {Object} Objeto filtrado entre fechas dadas.
   */
  const filterBetweenDates = (dataArr, lowerDate, upperDate) => {
    let filtered;
    if (lowerDate && upperDate) {
      filtered = dataArr.filter(
        (value) => {
          const fecha = dayjs(value.activity.date);
          return ((dayjs(lowerDate).startOf('day') <= fecha) && (dayjs(upperDate).endOf('day') >= fecha));
        },
      );
    } else if (lowerDate) {
      filtered = dataArr.filter(
        (value) => {
          const fecha = dayjs(value.activity.date);
          return (dayjs(lowerDate).startOf('day') <= fecha);
        },
      );
    } else if (upperDate) {
      filtered = dataArr.filter(
        (value) => {
          const fecha = dayjs(value.activity.date);
          return (dayjs(upperDate).endOf('day') >= fecha);
        },
      );
    } else {
      return dataArr;
    }
    return filtered;
  };

  // Cuando un parámetro de filtro cambie, filtrar sobre ellos.
  useEffect(() => {
    let filtered;
    if (search) {
      filtered = data.filter(
        (value) => searchValue(value, search),
      );
    } else {
      filtered = data;
    }
    filtered = filterBetweenDates(filtered, initialDate, finalDate);
    setFiltrated(filtered);
  }, [search, initialDate, finalDate]);

  return (
    <div className={styles.activityTable}>
      <ActivityTableFilter
        searchHandler={searchHandler}
        initialDateHandler={initialDateHandler}
        finalDateHandler={finalDateHandler}
      />
      <Table header={['Actividad', 'Horas de servicio', 'Completado', 'Fecha', 'Eje']} loading={loading} breakPoint="1110px" showCheckbox={false}>
        {filtrated && filtrated.map((value) => (
          <TableRow
            id={value.id}
            onClick={() => goToActivity(value.id)}
            key={value}
            onMouseDown={() => newTabActivity(value.id)}
          >
            <td>{value.activity.name}</td>
            <td>{value.activity.serviceHours}</td>
            <td>{value.completed ? 'Si' : 'No'}</td>
            <td>{value.activity.date}</td>
            <td>
              <img src={`${serverHost}/image/area/${value.activity.asigboArea.id}`} alt="AreaLogo" className={styles.areaLogo} title={value.activity.asigboArea.name} />
            </td>
          </TableRow>
        ))}
      </Table>
    </div>
  );
}

/*----------------------------------------------------------------------------------------------*/

ActivityTable.propTypes = {
  loading: PropTypes.bool,
  data: PropTypes.instanceOf(Object),
};

ActivityTable.defaultProps = {
  loading: false,
  data: undefined,
};

/*----------------------------------------------------------------------------------------------*/

export default ActivityTable;
