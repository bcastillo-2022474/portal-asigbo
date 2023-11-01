import React from 'react';
import { Link } from 'react-router-dom';
import styles from './UsersListPage.module.css';
import ManageUsersTable from '../../components/ManageUsersTable/ManageUsersTable';
import Button from '../../components/Button/Button';

function UsersListPage() {
  return (
    <div className={styles.usersListPage}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Lista de usuarios</h1>
        <Link to="/usuario/nuevo" className={styles.newUserLink}><Button text="Nuevo usuario" className={styles.newUserButton} /></Link>
      </div>
      <ManageUsersTable />
    </div>
  );
}

export default UsersListPage;
