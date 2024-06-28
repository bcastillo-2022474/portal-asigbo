/* eslint-disable react/self-closing-comp */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './ActivityResponsiblesTable.module.css';
import UserTable from '../UserTable';

function ActivityResponsiblesTable({ activityData }) {
  const [responsibles, setResponsibles] = useState([]);

  useEffect(() => {
    if (activityData) {
      let newArr = [];
      newArr = activityData?.responsible.map((value) => ({
        id: value.id,
        name: `${value.name} ${value.lastname}`,
        promotion: value.promotion,
        hasImage: value.hasImage,
      }));
      setResponsibles(newArr);
    }
  }, [activityData]);

  return (
    <UserTable
      users={responsibles}
      className={styles.table}
    />
  );
}

ActivityResponsiblesTable.propTypes = {
  activityData: PropTypes.instanceOf(Object).isRequired,
};

export default ActivityResponsiblesTable;
