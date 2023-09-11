/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
// import PropTypes from 'prop-types';
import { Pagination } from '@mui/material';
import UserTableFilter from '@components/UserTableFilter';
import Table from '@components/Table';
import useFetch from '@hooks/useFetch';
import { serverHost } from '@/config';
import useToken from '@hooks/useToken';
import consts from '@helpers/consts';
import UserPicture from '@components/UserPicture';
import TableRow from '@components/TableRow';
import Button from '@components/Button';
import ConfirmationPopUp from '@components/ConfirmationPopUp';
import usePopUp from '@hooks/usePopUp';
import LoadingView from '@components/LoadingView';
import SuccessNotificationPopUp from '@components/SuccessNotificationPopUp';
import ErrorNotificationPopUp from '@components/ErrorNotificationPopUp';
import getTokenPayload from '@helpers/getTokenPayload';
import styles from './SelectAdminTable.module.css';

function SelectAdminTable() {
  const { callFetch: fetchAdminsList, result: adminsList, loading: loadingAdminsList } = useFetch();
  const { callFetch: fetchUsers, result: users, loading: loadingUsers } = useFetch();
  const {
    callFetch: fetchAction,
    result: actionResult,
    loading: actionLoading,
    error: actionError,
  } = useFetch();

  const token = useToken();

  const [adminList, setAdminList] = useState();
  const [filter, setFilter] = useState({});
  const [paginationItems, setPaginationItems] = useState();
  const [currentPage, setCurrentPage] = useState(0);

  // Variables de control para des/asignar usuarios admin
  const [currentAction, setCurrentAction] = useState(); // remove/assign
  const [currentUser, setCurrentUser] = useState();

  const [isConfirmationOpen, openConfirmation, closeConfirmation] = usePopUp();
  const [isSuccessOpen, openSuccess, closeSuccess] = usePopUp();
  const [isErrorOpen, openError, closeError] = usePopUp();

  useEffect(() => {
    // obtener listado inicial de administradores
    fetchAdminsList({ uri: `${serverHost}/user/admin`, headers: { authorization: token } });
  }, []);

  useEffect(() => {
    if (!adminsList) return;

    // añadir admins como usuarios prioridad al hacer consultas
    setAdminList(adminsList.map((user) => user.id));
  }, [adminsList]);

  useEffect(() => {
    if (!adminList || !filter) return;
    // Realizar la consulta con los filtros
    const filterCopy = { ...filter };

    if (filterCopy?.search?.trim() === '') delete filterCopy.search;
    if (filterCopy?.promotion?.trim() === '') delete filterCopy.search;
    if (filterCopy?.status === '1') filterCopy.role = consts.roles.admin;
    delete filterCopy.status;

    filterCopy.page = currentPage;

    const searchParams = new URLSearchParams(filterCopy);

    adminList?.forEach((value) => searchParams.append('priority', value));

    const uri = `${serverHost}/user?${searchParams.toString()}`;
    fetchUsers({ uri, headers: { authorization: token } });
  }, [adminList, filter, currentPage]);

  useEffect(() => {
    setCurrentPage(0);
  }, [filter]);

  useEffect(() => {
    // cambiar número en la paginación
    const media = matchMedia('(max-width:700px)');

    const handleMediaChange = (e) => {
      if (e.matches) setPaginationItems(0);
      else setPaginationItems(2);
    };

    media.onchange = handleMediaChange;
    handleMediaChange(media);
  }, []);

  useEffect(() => {
    if (actionResult) openSuccess();
  }, [actionResult]);

  useEffect(() => {
    if (actionError) openError();
  }, [actionError]);

  const handleFilterChange = (val) => {
    setFilter((prev) => ({ ...prev, ...val }));
  };

  const handlePageChange = (e, page) => {
    setCurrentPage(page - 1);
  };

  const handleAssignUserClick = (user) => {
    setCurrentAction('assign');
    setCurrentUser(user);
    openConfirmation();
  };

  const handleRemoveUserClick = (user) => {
    setCurrentAction('remove');
    setCurrentUser(user);
    openConfirmation();
  };

  const handleConfirmationChange = (value) => {
    if (!value || !currentUser) return;
    const uri = `${serverHost}/user/${currentUser.id}/role/admin`;
    const method = currentAction === 'assign' ? 'PATCH' : 'DELETE';

    fetchAction({
      uri,
      method,
      headers: { authorization: token },
      parse: false,
    });
  };

  const handleFinishAction = () => {
    // Añadir o retirar usuario de la lista de admins. Esto provoca que la tabla se actualice.
    if (currentAction === 'assign') setAdminList((list) => [...list, currentUser.id]);
    else setAdminList((list) => list.filter((id) => id !== currentUser.id));
    setCurrentPage(0);
  };

  return (
    <div className={styles.selectAdminTable}>
      <UserTableFilter hideActionButtons onChange={handleFilterChange} className={styles.filter} />
      <Table
        header={['No.', '', 'Nombre', 'Promoción', '']}
        showCheckbox={false}
        loading={loadingUsers}
        breakPoint="900px"
      >
        {users?.result.map((user, index) => (
          <TableRow>
            <td>{index + 1}</td>
            <td className={styles.pictureRow}>
              <UserPicture name={user.name} idUser={user.id} />
            </td>
            <td className={styles.nameRow}>{`${user.name} ${user.lastname}`}</td>
            <td className={styles.promotionRow}>{user.promotion}</td>
            <td className={styles.buttonRow}>
              {user.role.includes(consts.roles.admin) ? (
                <Button text="Remover" red onClick={() => handleRemoveUserClick(user)} />
              ) : (
                <Button text="Agregar" green onClick={() => handleAssignUserClick(user)} />
              )}
            </td>
          </TableRow>
        ))}
      </Table>

      <Pagination
        count={users?.pages ?? 0}
        siblingCount={paginationItems}
        className={styles.pagination}
        onChange={handlePageChange}
        page={currentPage + 1}
      />

      {actionLoading && <LoadingView />}

      <ConfirmationPopUp
        close={closeConfirmation}
        isOpen={isConfirmationOpen}
        callback={handleConfirmationChange}
        body={(
          <>
            ¿Estás seguro de
            <b>{currentAction === 'assign' ? ' asignar ' : ' remover '}</b>
            al usuario
            {' '}
            {currentUser?.name}
            {' '}
            {currentUser?.lastname}
            {' '}
            como administrador?
            <br />
            <br />
            {getTokenPayload(token).id === currentUser?.id
              ? 'Toma en cuenta que al confirmar esta acción, perderás tus propios privilegios de administrador.'
              : ''}
          </>
        )}
      />

      <SuccessNotificationPopUp
        isOpen={isSuccessOpen}
        close={closeSuccess}
        text={`El usuario ha sido ${
          currentAction === 'assign' ? 'asignado' : 'removido'
        } como administrador de forma exitosa.`}
        callback={handleFinishAction}
      />
      <ErrorNotificationPopUp isOpen={isErrorOpen} close={closeError} text={actionError?.message} />
    </div>
  );
}

export default SelectAdminTable;

SelectAdminTable.propTypes = {};

SelectAdminTable.defaultProps = {};
