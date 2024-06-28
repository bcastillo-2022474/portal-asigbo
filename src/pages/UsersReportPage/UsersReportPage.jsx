import React from 'react';
import styles from './UsersReportPage.module.css';
import UsersReportTable from '../../components/UsersReportTable/UsersReportTable';

function UsersReportPage() {
  return (
    <div className={styles.usersReportPage}>
      <div className={styles.headerContainer}>
        <h1 className={styles.pageTitle}>Reporte de usuarios</h1>
      </div>

      <UsersReportTable />

    </div>
  );
}

export default UsersReportPage;
