/* eslint-disable no-restricted-syntax */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import ActivityTableFilter from '../ActivityTableFilter/ActivityTableFilter';
import styles from './ActivityTable.module.css';
import Table from '../Table/Table';
import TableRow from '../TableRow';
import { serverHost } from '../../config';

function ActivityTable({ loading, data }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState();
  const [filtrated, setFiltrated] = useState();
  const [initialDate, setInitialDate] = useState();
  const [finalDate, setFinalDate] = useState();

  useEffect(() => {
    if (!search) {
      setFiltrated(data);
    }
  }, [data]);

  const goToActivity = (id) => {
    navigate(`/actividad/${id}`);
  };

  const newTabActivity = (id) => {
    navigate(`/actividad/${id}`);
  };

  const searchHandler = (query) => {
    setSearch(query);
  };

  const initialDateHandler = (date) => {
    setInitialDate(date);
  };

  const finalDateHandler = (date) => {
    setFinalDate(date);
  };

  const searchValue = (objeto, valorDeseado) => {
    for (const clave in objeto) {
      if (typeof objeto[clave] === 'object') {
        if (searchValue(objeto[clave], valorDeseado)) {
          return true;
        }
      } else if (objeto[clave] === valorDeseado) {
        return true;
      }
    }
    return false;
  };

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
      <Table header={['No.', 'Actividad', 'Horas de servicio', 'Completado', 'Fecha', 'Eje']} loading={loading} breakPoint="1370px" showCheckbox={false}>
        {filtrated && filtrated.map((value) => (
          <TableRow
            id={value.id}
            onClick={() => goToActivity(value.id)}
            key={value}
            onMouseDown={() => newTabActivity(value.id)}
          >
            <td>{value.activity.id}</td>
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

ActivityTable.propTypes = {
  loading: PropTypes.bool,
  data: PropTypes.instanceOf(Object),
};

ActivityTable.defaultProps = {
  loading: false,
  data: undefined,
};

export default ActivityTable;
