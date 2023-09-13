import React from 'react';
import styles from './UsersListPage.module.css';
import ManageUsersTable from '../../components/ManageUsersTable/ManageUsersTable';

function UsersListPage() {
  return (
    <div className={styles.usersListPage}>
      <h1 className={styles.pageTitle}>Lista de usuarios</h1>
      <ManageUsersTable />
    </div>
  );
}

export default UsersListPage;
