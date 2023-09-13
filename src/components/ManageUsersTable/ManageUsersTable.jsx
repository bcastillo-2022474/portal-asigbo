/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useState, useEffect } from 'react';
import { AiFillLock as BlockIcon, AiFillUnlock as UnblockIcon } from 'react-icons/ai';
import { MdEmail as EmailIcon } from 'react-icons/md';
import { Pagination } from '@mui/material';
import LoadingView from '../LoadingView/LoadingView';
import Table from '../Table/Table';
import TableRow from '../TableRow/TableRow';
import UserPicture from '../UserPicture';
import styles from './ManageUsersTable.module.css';
import OptionsButton from '../OptionsButton/OptionsButton';
import { serverHost } from '../../config';
import useToken from '../../hooks/useToken';
import useFetch from '../../hooks/useFetch';

function ManageUsersTable() {
  const handleBlockOptionClick = () => {
    /* Bloquear usuario */
  };

  const handleUnblockOptionClick = () => {
    /* Desbloquear usuario */
  };

  const handleReSendEmailOptionClick = () => {
    /* Reenviar correo de registro */
  };

  const token = useToken();
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [paginationItems, setPaginationItems] = useState();

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

  const handlePageChange = (e, page) => {
    setCurrentPage(page - 1);
    fetchUsers();
  };

  useEffect(() => {
    if (!resultUsers) return;
    setUsers(resultUsers.result);
    setPaginationItems(resultUsers.pages);
    console.log(resultUsers);
  }, [resultUsers]);

  useEffect(() => {
    if (errorUsers) console.log(errorUsers);
  }, [errorUsers]);

  useEffect(() => {
    console.log(users);
    setCurrentPage(0);
    fetchUsers();
  }, []);

  return (
    <div className={styles.manageUsersTable}>
      <Table showCheckbox={false} header={['No.', '', 'Nombre', 'Promoción', '']} breakPoint="700px">
        {users?.map((user, index) => (
          <TableRow id={user.id} key={user.id} style={{ position: 'absolute' }}>
            <td>{index + 1}</td>
            <td className={styles.pictureRow}>
              <UserPicture name={user.name} idUser={user.id} />
            </td>
            <td className={styles.nameRow}>
              {`${user.name} ${user.lastname}`}
            </td>
            <td className={styles.promotionRow}>{user.promotion}</td>
            <td className={styles.actionsRow}>
              <div className={styles.optionsContainer}>
                <OptionsButton
                  options={[
                    user.blocked ? { icon: <UnblockIcon />, text: 'Desbloquear', onClick: handleUnblockOptionClick } : { icon: <BlockIcon />, text: 'Bloquear', onClick: handleBlockOptionClick },
                    !user.completeRegistration ? { icon: <EmailIcon />, text: 'Reenviar correo de registro', onClick: handleReSendEmailOptionClick } : null, // Placeholder object with no-op function
                  ]}
                  showMenuAtTop={(index === (users.length - 1) && index > 2)
                    || (index === (users.length - 2) && index > 1 && !user.completeRegistration)}
                />
              </div>
            </td>
          </TableRow>
        ))}
      </Table>
      <Pagination
        count={resultUsers?.pages ?? 0}
        siblingCount={paginationItems}
        className={styles.pagination}
        onChange={handlePageChange}
        page={currentPage + 1}
      />

      {loadingUsers && <LoadingView />}
    </div>
  );
}

export default ManageUsersTable;
