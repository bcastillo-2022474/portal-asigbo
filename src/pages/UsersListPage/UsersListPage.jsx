import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './UsersListPage.module.css';
import ManageUsersTable from '../../components/ManageUsersTable/ManageUsersTable';
import Button from '../../components/Button/Button';

function UsersListPage() {
  const navigate = useNavigate();

  // Redirigir a nuevo usuario
  const handleNewUser = () => {
    navigate('/usuario/nuevo');
  };

  return (
    <div className={styles.usersListPage}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Lista de usuarios</h1>
        <Button text="Nuevo usuario" onClick={handleNewUser} className={styles.newUserButton} />
      </div>
      <ManageUsersTable />
    </div>
  );
}

export default UsersListPage;
