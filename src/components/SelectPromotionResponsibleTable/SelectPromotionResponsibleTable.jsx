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
import styles from './SelectPromotionResponsibleTable.module.css';
import UserNameLink from '../UserNameLink/UserNameLink';

function SelectPromotionResponsibleTable() {
  const {
    callFetch: fetchPromotionResponsibleUsersList,
    result: promotionResponsibleUsersList,
    error: promotionResponsibleUsersError,
  } = useFetch();
  const { callFetch: fetchUsers, result: users, loading: loadingUsers } = useFetch();
  const {
    callFetch: fetchAction,
    result: actionResult,
    loading: actionLoading,
    error: actionError,
  } = useFetch();

  const token = useToken();

  const [initialLoading, setInitialLoading] = useState(true);
  const [promotionResponsibleUsers, setPromotionResponsibleUsers] = useState();
  const [filter, setFilter] = useState({});
  const [paginationItems, setPaginationItems] = useState();
  const [currentPage, setCurrentPage] = useState(0);

  // Variables de control para des/asignar usuarios encargados de año
  const [currentAction, setCurrentAction] = useState(); // remove/assign
  const [currentUser, setCurrentUser] = useState();

  const [isConfirmationOpen, openConfirmation, closeConfirmation] = usePopUp();
  const [isSuccessOpen, openSuccess, closeSuccess] = usePopUp();
  const [isErrorOpen, openError, closeError] = usePopUp();

  useEffect(() => {
    // obtener listado inicial de encargados de año
    fetchPromotionResponsibleUsersList({ uri: `${serverHost}/user/promotionResponsible`, headers: { authorization: token } });
  }, []);

  useEffect(() => {
    if (!promotionResponsibleUsersList) return;

    // añadir encargados de año como usuarios prioridad al hacer consultas
    setPromotionResponsibleUsers(promotionResponsibleUsersList.map((user) => user.id));
  }, [promotionResponsibleUsersList]);

  useEffect(() => {
    if (!promotionResponsibleUsersError) return;
    // Error al consultar responsables de año en api, lista vacía
    setPromotionResponsibleUsers([]);
  }, [promotionResponsibleUsersError]);

  useEffect(() => {
    if (!promotionResponsibleUsers || !filter) return;
    // Realizar la consulta con los filtros
    const filterCopy = { ...filter };

    if (filterCopy?.search?.trim() === '') delete filterCopy.search;
    if (filterCopy?.promotion?.trim() === '') delete filterCopy.search;
    if (filterCopy?.status === '1') filterCopy.role = consts.roles.promotionResponsible;
    delete filterCopy.status;

    filterCopy.page = currentPage;

    const searchParams = new URLSearchParams(filterCopy);
    promotionResponsibleUsers?.forEach((value) => searchParams.append('priority', value));

    const uri = `${serverHost}/user?${searchParams.toString()}`;
    fetchUsers({ uri, headers: { authorization: token } });
  }, [promotionResponsibleUsers, filter, currentPage]);

  useEffect(() => {
    if (users) setInitialLoading(false); // Al obtener usuarios, parar loading inicial
  }, [users]);

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
    const uri = `${serverHost}/user/${currentUser.id}/role/promotionResponsible`;
    const method = currentAction === 'assign' ? 'PATCH' : 'DELETE';

    fetchAction({
      uri,
      method,
      headers: { authorization: token },
      parse: false,
    });
  };

  const handleFinishAction = () => {
    // Añadir o retirar usuario de la lista de encargados. Esto provoca que la tabla se actualice.
    if (currentAction === 'assign') setPromotionResponsibleUsers((list) => [...list, currentUser.id]);
    else setPromotionResponsibleUsers((list) => list.filter((id) => id !== currentUser.id));
    setCurrentPage(0);
  };

  return (
    <div className={styles.selectPromotionResponsibleTable}>
      <UserTableFilter hideActionButtons onChange={handleFilterChange} className={styles.filter} />
      <Table
        header={['No.', '', 'Nombre', 'Promoción', '']}
        showCheckbox={false}
        loading={(initialLoading || loadingUsers) && !users}
        breakPoint="900px"
      >
        {users?.result.map((user, index) => (
          <TableRow key={user.id}>
            <td>{index + 1}</td>
            <td className={styles.pictureRow}>
              <UserPicture name={user.name} idUser={user.id} hasImage={user.hasImage ?? false} />
            </td>
            <td className={styles.nameRow}>
              <UserNameLink name={`${user.name} ${user.lastname}`} idUser={user.id} />
            </td>
            <td className={styles.promotionRow}>{user.promotion}</td>
            <td className={styles.buttonRow}>
              {user.role?.includes(consts.roles.promotionResponsible) ? (
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
            como encargado de su año?
            <br />
            <br />
            {getTokenPayload(token).id === currentUser?.id
              ? 'Toma en cuenta que al confirmar esta acción, perderás tus propios privilegios de encargado de año.'
              : ''}
          </>
        )}
      />

      <SuccessNotificationPopUp
        isOpen={isSuccessOpen}
        close={closeSuccess}
        text={`El usuario ha sido ${
          currentAction === 'assign' ? 'asignado' : 'removido'
        } como encargado de su año de forma exitosa.`}
        callback={handleFinishAction}
      />
      <ErrorNotificationPopUp isOpen={isErrorOpen} close={closeError} text={actionError?.message} />
    </div>
  );
}

export default SelectPromotionResponsibleTable;

SelectPromotionResponsibleTable.propTypes = {};

SelectPromotionResponsibleTable.defaultProps = {};
