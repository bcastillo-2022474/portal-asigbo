import React from 'react';
// import PropTypes from 'prop-types';
import { Route, Routes } from 'react-router-dom';
import TabMenu from '@components/TabMenu/TabMenu';
import SelectAdminTable from '@components/SelectAdminTable';
import styles from './AdminConfiguration.module.css';
import SelectPromotionResponsibleTable from '../../components/SelectPromotionResponsibleTable';

function AdminConfiguration() {
  return (
    <div className={styles.adminConfiguration}>
      <h1 className={styles.pageTitle}>Configuración</h1>
      <TabMenu className={styles.tabMenu} options={[{ text: 'General', href: '' }, { text: 'Administradores', href: 'admin' }, { text: 'Encargados de año', href: 'encargados_promocion' }]} />
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

        <Route
          end
          path="/encargados_promocion"
          element={(
            <>
              <h3 className={styles.sectionTitle}>Encargados de año</h3>
              <SelectPromotionResponsibleTable />
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
