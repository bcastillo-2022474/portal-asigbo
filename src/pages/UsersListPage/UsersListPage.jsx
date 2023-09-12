import React, { useEffect, useState } from 'react';
import styles from './UsersListPage.module.css';
import useToken from '../../hooks/useToken';
import useFetch from '../../hooks/useFetch';
import { serverHost } from '../../config';
import LoadingView from '../../components/LoadingView/LoadingView';
import ManageUsersTable from '../../components/ManageUsersTable/ManageUsersTable';

function UsersListPage() {
  const token = useToken();
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    callFetch: getUsers,
    result: resultUsers,
    error: errorUsers,
    loading: loadingUsers,
  } = useFetch();

  const fetchUsers = (promotion, search) => {
    console.log(`${serverHost}/user?includeBlocked=true?page=${currentPage}${promotion ? `?promotion=${promotion}` : ''}${search ? `?search=${search}` : ''}`);
    getUsers({
      uri: `${serverHost}/user?includeBlocked=true&page=${currentPage}${promotion ? `&promotion=${promotion}` : ''}${search ? `&search=${search}` : ''}`,
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
    setCurrentPage(1);
    fetchUsers();
  }, []);

  return (
    <div className={styles.usersListPage}>
      {loadingUsers && <LoadingView />}
      <h1 className={styles.pageTitle}>Lista de usuarios</h1>
      <ManageUsersTable users={users.result} />
    </div>
  );
}

export default UsersListPage;
