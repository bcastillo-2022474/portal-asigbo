/* eslint-disable no-unused-vars */
/* eslint-disable react/self-closing-comp */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './ActivityResponsibles.module.css';
import Table from '../Table';
import TableRow from '../TableRow';
import UserPicture from '../UserPicture';
import ActivityResponsiblesTable from '../ActivityResponsiblesTable/ActivityResponsiblesTable';

function ActivityResponsibles({ idActivity }) {
  return (
    <div className={styles.main}>
      <h2>Encargados</h2>
      <ActivityResponsiblesTable idActivity={idActivity} />
    </div>
  );
}

ActivityResponsibles.propTypes = {
  idActivity: PropTypes.string.isRequired,
};

export default ActivityResponsibles;
