import React from 'react';
import useLogout from '@hooks/useLogout';
import { useNavigate } from 'react-router-dom';
import styles from './AdminProfilePage.module.css';

function AdminProfilePage() {
  const logout = useLogout();
  const navigate = useNavigate();

  return (
    <div className={styles.adminProfilePage}>
      <h1>En desarrollo: Perfil de administrador</h1>
      <button onClick={logout} type="submit">Logout</button>
      <button onClick={() => navigate('/newUser', { replace: true })} type="submit">Crear usuario</button>
    </div>
  );
}

export default AdminProfilePage;
