/* eslint-disable react/self-closing-comp */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React from 'react';
import PropTypes from 'prop-types';
import styles from './ActivityResponsibles.module.css';
import ActivityResponsiblesTable from '../ActivityResponsiblesTable/ActivityResponsiblesTable';

function ActivityResponsibles({ activityData }) {
  return (
    <div className={styles.main}>
      <h2>Encargados</h2>
      <ActivityResponsiblesTable activityData={activityData} />
    </div>
  );
}

ActivityResponsibles.propTypes = {
  activityData: PropTypes.instanceOf(Object).isRequired,

};

export default ActivityResponsibles;
