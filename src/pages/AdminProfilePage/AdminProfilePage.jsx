import React from 'react';
import useLogout from '@hooks/useLogout';
import styles from './AdminProfilePage.module.css';

function AdminProfilePage() {
  const logout = useLogout();
  return (
    <div className={styles.adminProfilePage}>
      <h1>En desarrollo: Perfil de administrador</h1>
      <button onClick={logout} type="submit">Logout</button>
    </div>
  );
}

export default AdminProfilePage;
