import React from 'react';
// import PropTypes from 'prop-types';
import { Route, Routes } from 'react-router-dom';
import styles from './AvailableActivitiesPage.module.css';
import TabMenu from '../../components/TabMenu';
import AvailableActivitiesGrid from '../../components/AvailableActivitiesGrid/AvailableActivitiesGrid';
import AssignedActivitiesGrid from '../../components/AssignedActivitiesGrid';

function AvailableActivitiesPage() {
  return (
    <div className={styles.pageContainer}>
      <h1>Actividades de servicio</h1>
      <TabMenu
        className={styles.tabMenu}
        options={[
          { text: 'Actividades disponibles', href: '' },
          { text: 'Mis actividades por realizar', href: 'inscrito' },
        ]}
      />

      <Routes>
        <Route path="/" element={<AvailableActivitiesGrid />} />
        <Route
          path="inscrito"
          element={<AssignedActivitiesGrid />}
        />
      </Routes>

    </div>
  );
}

export default AvailableActivitiesPage;

AvailableActivitiesPage.propTypes = {

};

AvailableActivitiesPage.defaultProps = {

};
