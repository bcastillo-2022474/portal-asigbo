/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useState, useEffect } from 'react';
import {
  AiFillLock as BlockIcon,
  AiFillUnlock as UnblockIcon,
  AiFillDelete as DeleteIcon,
}
  from 'react-icons/ai';
import { MdEmail as EmailIcon } from 'react-icons/md';
import { Pagination } from '@mui/material';
import SuccessNotificationPopUp from '@components/SuccessNotificationPopUp';
import ErrorNotificationPopUp from '@components/ErrorNotificationPopUp';
import ConfirmationPopUp from '@components/ConfirmationPopUp';
import LoadingView from '../LoadingView/LoadingView';
import Table from '../Table/Table';
import TableRow from '../TableRow/TableRow';
import UserPicture from '../UserPicture';
import styles from './ManageUsersTable.module.css';
import OptionsButton from '../OptionsButton/OptionsButton';
import { serverHost } from '../../config';
import useToken from '../../hooks/useToken';
import useFetch from '../../hooks/useFetch';
import usePopUp from '../../hooks/usePopUp';
import InputSearchSelect from '../InputSearchSelect/InputSearchSelect';
import SearchInput from '../SearchInput/SearchInput';
import consts from '../../helpers/consts';
import UserNameLink from '../UserNameLink/UserNameLink';
import useCount from '../../hooks/useCount';

function ManageUsersTable() {
  const token = useToken();
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [paginationItems, setPaginationItems] = useState();
  const [filter, setFilter] = useState({});
  const { count: resetTableHeightTrigger, next: fireTableHeightTrigger } = useCount();

  const [userId, setUserId] = useState('');

  const [isSuccessOpen, openSuccess, closeSuccess] = usePopUp();
  const [isErrorOpen, openError, closeError] = usePopUp();
  const [isConfirmatonOpen, openConfirmaton, closeConfirmaton] = usePopUp();

  const {
    callFetch: getUsers,
    result: resultUsers,
    error: errorUsers,
    loading: loadingUsers,
  } = useFetch();

  const {
    callFetch: disableUser,
    result: resultDisable,
    error: errorDisable,
    loading: loadingDisable,
  } = useFetch();

  const {
    callFetch: enableUser,
    result: resultEnable,
    error: errorEnable,
    loading: loadingEnable,
  } = useFetch();

  const {
    callFetch: deleteUser,
    result: resultDelete,
    error: errorDelete,
    loading: loadingDelete,
  } = useFetch();

  // Mensajes a mostrar
  const [notificationText, setNotificationText] = useState('');

  // Confirmación de las acciones
  const [action, setAction] = useState('');

  const handleAction = (currentUserId, currentAction) => {
    setUserId(currentUserId);
    setAction(currentAction);
    openConfirmaton();
  };

  const fetchUsers = () => {
    const { promotion, search } = filter;
    const paramsObj = {
      includeBlocked: true, page: currentPage,
    };

    if (promotion !== undefined && promotion !== '') {
      paramsObj.promotion = promotion;
    }

    if (search !== undefined && search !== '') {
      paramsObj.search = search;
    }

    const searchParams = new URLSearchParams(paramsObj);
    getUsers({
      uri: `${serverHost}/user?${searchParams.toString()}`,
      headers: { authorization: token },
    });
  };

  const {
    callFetch: getPromotionsFetch,
    result: promotions,
    loading: loadingPromotions,
    error: errorPromotions,
  } = useFetch();

  const handleBlockOptionClick = async (currentUserId) => {
    await disableUser({
      uri: `${serverHost}/user/${currentUserId}/disable`,
      headers: { authorization: token },
      method: 'PATCH',
      parse: false,
    });
    fetchUsers();
  };

  const handleUnblockOptionClick = async (currentUserId) => {
    await enableUser({
      uri: `${serverHost}/user/${currentUserId}/enable`,
      headers: { authorization: token },
      method: 'PATCH',
      parse: false,
    });
    fetchUsers();
  };

  const handleReSendEmailOptionClick = () => {
    /* Reenviar correo de registro */
  };

  const handleDeleteUserOptionClick = async (currentUserId) => {
    await deleteUser({
      uri: `${serverHost}/user/${currentUserId}`,
      headers: { authorization: token },
      method: 'DELETE',
      parse: false,
    });
  };

  const handleConfirmation = (value) => {
    if (!value) return;
    if (action === 'deleting') handleDeleteUserOptionClick(userId);
    if (action === 'disabling') handleBlockOptionClick(userId);
    if (action === 'enabling') handleUnblockOptionClick(userId);
  };

  const handlePageChange = (e, page) => {
    setCurrentPage(page - 1);
  };

  const handleChange = (name, value) => {
    setCurrentPage(0);
    setFilter((lastVal) => ({ ...lastVal, [name]: value }));
  };

  useEffect(() => {
    // cambiar número en la paginación
    const media = matchMedia('(max-width:700px)');

    const handleMediaChange = (e) => {
      if (e.matches) setPaginationItems(0);
      else setPaginationItems(2);
    };

    media.onchange = handleMediaChange;
    handleMediaChange(media);
    getPromotionsFetch({ uri: `${serverHost}/promotion`, headers: { authorization: token } });
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, filter]);

  useEffect(() => {
    if (resultUsers) setUsers(resultUsers.result);
  }, [resultUsers]);

  useEffect(() => {
    if (errorUsers) setUsers([]);
  }, [errorUsers]);

  useEffect(() => {
    setCurrentPage(0);
  }, []);

  useEffect(() => {
    if (!resultDisable) return;
    setNotificationText('El usuario del becado ha sido deshabilitado de forma exitosa.');
    openSuccess();
  }, [resultDisable]);

  useEffect(() => {
    if (!errorDisable) return;
    setNotificationText(() => errorDisable?.message);
    openError();
  }, [errorDisable]);

  useEffect(() => {
    if (!resultEnable) return;
    setNotificationText('El usuario del becado ha sido habilitado de forma exitosa.');
    openSuccess();
  }, [resultEnable]);

  useEffect(() => {
    if (!errorEnable) return;
    setNotificationText(errorEnable?.message);
    openError();
  }, [errorEnable]);

  useEffect(() => {
    if (!resultDelete) return;
    setNotificationText('El usuario del becado ha sido eliminado de forma exitosa.');
    openSuccess();
  }, [resultDelete]);

  useEffect(() => {
    if (!errorDelete) return;
    setNotificationText(errorDelete?.message);
    openError();
  }, [errorDelete]);

  return (
    <div className={styles.manageUsersTable}>
      <div className={styles.filtersContainer}>
        <InputSearchSelect
          className={styles.selectInput}
          placeholder="Promoción"
          value={filter.promotion}
          onChange={(e) => handleChange('promotion', e.target.value)}
          options={
            promotions
              ? [
                ...promotions.notStudents.map(
                  (val) => ({ value: val, title: consts.promotionsGroups[val] }),
                ),
                {
                  value: promotions.students.id,
                  title: consts.promotionsGroups[promotions.students.id],
                },
                ...promotions.students.years.map((year) => ({ value: `${year}`, title: `${year}` })),
              ]
              : null
          }
          disabled={errorPromotions || loadingPromotions}
        />
        <SearchInput
          className={styles.searchInput}
          handleSearch={(val) => handleChange('search', val)}
        />
      </div>
      <Table
        showCheckbox={false}
        header={['No.', '', 'Nombre', 'Promoción', '']}
        breakPoint="700px"
        resetTableHeight={resetTableHeightTrigger}
      >
        {users?.map((user, index) => (
          <TableRow id={user.id} key={user.id} style={{ position: 'absolute' }}>
            <td>{index + 1}</td>
            <td className={styles.pictureRow}>
              <UserPicture name={user.name} idUser={user.id} hasImage={user.hasImage ?? false} />
            </td>
            <td className={styles.nameRow}>
              <UserNameLink idUser={user.id} name={`${user.name} ${user.lastname}`} />
            </td>
            <td className={styles.promotionRow}>{user.promotion}</td>
            <td className={styles.actionsRow}>
              <div className={styles.optionsContainer}>
                <OptionsButton
                  onMenuVisibleChange={fireTableHeightTrigger}
                  options={[
                    user.blocked ? { icon: <UnblockIcon />, text: 'Desbloquear', onClick: () => handleAction(user.id, 'enabling') } : { icon: <BlockIcon />, text: 'Bloquear', onClick: () => handleAction(user.id, 'disabling') },
                    !user.completeRegistration ? { icon: <EmailIcon />, text: 'Reenviar correo de registro', onClick: handleReSendEmailOptionClick } : null, // Placeholder object with no-op function
                    { icon: <DeleteIcon />, text: 'Eliminar usuario', onClick: () => handleAction(user.id, 'deleting') },
                  ]}
                  showMenuAtTop={(index === (users.length - 1) && index > 2)
                    || (index === (users.length - 2) && index > 1 && user.completeRegistration)}
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

      <ConfirmationPopUp
        close={closeConfirmaton}
        isOpen={isConfirmatonOpen}
        callback={handleConfirmation}
        body={
          action === 'deleting' ? (
            <>
              ¿Estás seguro/a de
              <b> eliminar </b>
              el usuario de este becado? Esta es una acción permanente que no podrá ser revertida.
            </>
          ) : (
            <>
              ¿Estás seguro/a de
              <b>{action === 'disabling' ? ' deshabilitar ' : ' habilitar '}</b>
              el usuario de este becado? Esta acción sí puede ser revertida,
              sin embargo, puede resultar en
              comportamientos inesperados para los usuarios.
            </>
          )
        }
      />

      <SuccessNotificationPopUp
        close={closeSuccess}
        isOpen={isSuccessOpen}
        text={notificationText}
      />

      <ErrorNotificationPopUp
        close={closeError}
        isOpen={isErrorOpen}
        text={notificationText}
      />
      {(loadingUsers || loadingDisable || loadingEnable || loadingDelete) && <LoadingView />}
    </div>
  );
}

export default ManageUsersTable;
