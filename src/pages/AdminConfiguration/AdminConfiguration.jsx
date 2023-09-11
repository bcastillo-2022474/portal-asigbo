import React from 'react';
// import PropTypes from 'prop-types';
import { Route, Routes } from 'react-router-dom';
import TabMenu from '@components/TabMenu/TabMenu';
import SelectAdminTable from '@components/SelectAdminTable';
import styles from './AdminConfiguration.module.css';

function AdminConfiguration() {
  return (
    <div className={styles.adminConfiguration}>
      <h1 className={styles.pageTitle}>Configuración</h1>
      <TabMenu className={styles.tabMenu} options={[{ text: 'General', href: '' }, { text: 'Administradores', href: 'admin' }]} />
      <Routes>

        <Route
          end
          path="/admin"
          element={(
            <>
              <h3 className={styles.sectionTitle}>Administradores</h3>
              <SelectAdminTable />
            </>
)}
        />
      </Routes>
    </div>
  );
}

export default AdminConfiguration;

AdminConfiguration.propTypes = {

};

AdminConfiguration.defaultProps = {

};
