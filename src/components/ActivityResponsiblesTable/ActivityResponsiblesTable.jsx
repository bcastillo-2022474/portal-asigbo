/* eslint-disable react/self-closing-comp */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './ActivityResponsiblesTable.module.css';
import useActivityByID from '../../hooks/useActivityByID';
import UserTable from '../UserTable';

function ActivityResponsiblesTable({ idActivity }) {
  const {
    info: activity,
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
    <UserTable
      users={responsibles}
      loading={loadingActivity}
      className={styles.table}
    />
  );
}

ActivityResponsiblesTable.propTypes = {
  idActivity: PropTypes.string.isRequired,
};

export default ActivityResponsiblesTable;
