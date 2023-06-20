import React from 'react';
import useLogout from '@hooks/useLogout';
import styles from './UserProfilePage.module.css';

function UserProfilePage() {
  const logout = useLogout();
  return (
    <div className={styles.userProfilePage}>
      En desarrollo: Página de usuario
      <button onClick={logout} type="submit">Cerrar sesión</button>
    </div>
  );
}

export default UserProfilePage;
