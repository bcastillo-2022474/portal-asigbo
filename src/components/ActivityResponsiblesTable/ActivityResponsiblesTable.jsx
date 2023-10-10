/* eslint-disable no-unused-vars */
/* eslint-disable react/self-closing-comp */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './ActivityResponsiblesTable.module.css';
import Table from '../Table';
import TableRow from '../TableRow';
import UserPicture from '../UserPicture';
import useActivityByID from '../../hooks/useActivityByID';

function ActivityResponsiblesTable({ idActivity }) {
  const {
    info: activity,
    error: activityError,
    loading: loadingActivity,
  } = useActivityByID(idActivity);
  const [responsibles, setResponsibles] = useState([]);

  useEffect(() => {
    if (activity) {
      let newArr = [];
      newArr = activity.responsible.map((value) => ({
        id: value.id,
        name: `${value.name} ${value.lastname}`,
        promotion: value.promotion,
      }));
      setResponsibles(newArr);
    }
  }, [activity]);

  return (
    <Table header={['No.', '', 'Nombre', 'Promoción']} showCheckbox={false} loading={loadingActivity} className={styles.table}>
      {responsibles?.map((value, index) => (
        <TableRow id={value.id} key={value.id}>
          <td>{index + 1}</td>
          <td className={styles.pictureCol}>
            <UserPicture name={value.name} idUser={value.id} />
          </td>
          <td className={styles.nameCol}>{value.name}</td>
          <td className={styles.promoCol}>{value.promotion}</td>
        </TableRow>
      ))}
    </Table>
  );
}

ActivityResponsiblesTable.propTypes = {
  idActivity: PropTypes.string.isRequired,
};

export default ActivityResponsiblesTable;
