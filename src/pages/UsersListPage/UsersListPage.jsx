import React, { useEffect, useState } from 'react';
import styles from './UsersListPage.module.css';
import useToken from '../../hooks/useToken';
import useFetch from '../../hooks/useFetch';
import { serverHost } from '../../config';
import LoadingView from '../../components/LoadingView/LoadingView';

function UsersListPage() {
  const token = useToken();
  const [users, setUsers] = useState([]);

  const {
    callFetch: getUsers,
    result: resultUsers,
    error: errorUsers,
    loading: loadingUsers,
  } = useFetch();

  const fetchUsers = (page, promotion, search) => {
    console.log(`${serverHost}/user${promotion ? `?promotion=${promotion}` : ''}${search ? `?search=${search}` : ''}`);
    getUsers({
      uri: `${serverHost}/user${promotion ? `?promotion=${promotion}` : ''}${search ? `?search=${search}` : ''}`,
      headers: { authorization: token },
    });
  };

  useEffect(() => {
    if (!resultUsers) return;
    setUsers(resultUsers);
    console.log(resultUsers);
  }, [resultUsers]);

  useEffect(() => {
    if (errorUsers) console.log(errorUsers);
  }, [errorUsers]);

  useEffect(() => {
    console.log(users);
    fetchUsers(0, 2020);
  }, []);

  return (
    <div className={styles.usersListPage}>
      {loadingUsers && <LoadingView />}
      <h1 className={styles.pageTitle}>Lista de usuarios</h1>
    </div>
  );
}

export default UsersListPage;
