/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import ActivityTableFilter from '../ActivityTableFilter/ActivityTableFilter';
import styles from './ActivityTable.module.css';
import Table from '../Table/Table';
import TableRow from '../TableRow';
import { serverHost } from '../../config';

function ActivityTable({ loading, data }) {
  useEffect(() => {
    console.log(data);
  }, [data]);
  return (
    <div className={styles.activityTable}>
      <ActivityTableFilter />
      <Table header={['No.', 'Actividad', 'Horas de servicio', 'Completado', 'Fecha', 'Eje']} loading={loading} breakPoint="1400px">
        {data && data.map((value) => (
          <TableRow id={value.id}>
            <td>{value.activity.id}</td>
            <td>{value.activity.name}</td>
            <td>{value.activity.serviceHours}</td>
            <td>{value.completed ? 'Si' : 'No'}</td>
            <td>{value.activity.date}</td>
            <td>
              <img src={`${serverHost}/image/area/${value.activity.asigboArea.id}`} alt="AreaLogo" className={styles.areaLogo} />
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
