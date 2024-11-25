import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Pagination } from '@mui/material';
import Table from '@components/Table';
import TableRow from '@components/TableRow';
import Button from '@components/Button';
import useToken from '@hooks/useToken';
import UserTableFilter from '@components/UserTableFilter';
import useFetch from '@hooks/useFetch';
import { serverHost } from '@/config';
import useCount from '@hooks/useCount';
import UserNameLink from '@components/UserNameLink';
import UserPicture from '@components/UserPicture';
import styles from './UserSelectTable.module.css';

/**
 * Componente tabla para poder seleccionar usuarios.
 * @param defaultSelectedUsers Arreglo con la información de los usuarios a marcar por default.
 *    debe incluir {id, name, lastname, promotion, promotionGroup}
 * @param onChange función callback. Provee el listado de los id's de usuarios seleccionados.
 * @returns
 */
function UserSelectTable({ defaultSelectedUsers, onChange }) {
  const [userFilters, setUserFilters] = useState({});
  const [paginationItems, setPaginationItems] = useState();
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedTableRows, setSelectedTableRows] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const { count: triggerResetRowsSelection, next: resetRowsSelection } = useCount();

  const token = useToken();

  const {
    callFetch: getUsersFetch,
    result: users,
    loading: loadingUsers,
    error: usersError,
  } = useFetch();

  const handleUserFilterChange = (val) => setUserFilters(val);
  const handlePageChange = (e, page) => {
    setCurrentPage(page - 1);
  };

  const handleRowSelect = (selectedRows) => {
    setSelectedTableRows(selectedRows);
  };

  const selectUser = (user) => {
    setSelectedUsers((list) => {
      if (list.some((userData) => userData.id === user.id)) return list;
      return [...list, user];
    });
  };

  const removeUser = (user) => {
    setSelectedUsers((list) => list.filter((userData) => userData.id !== user.id));
  };

  const filterSelectedUsers = () => selectedUsers.filter((user) => {
    if (userFilters.search?.trim() !== '') {
      // filtrar por nombre
      const searchRegex = new RegExp(userFilters.search, 'gi');
      if (!`${user.name} ${user.lastname}`.match(searchRegex)) {
        return false;
      }
    }

    // filtrar por promocion
    if (
      userFilters.promotion?.trim()?.length > 0
        && user.promotion !== parseInt(userFilters.promotion, 10)
        && user.promotionGroup !== userFilters.promotion
    ) {
      return false;
    }

    return true;
  });

  const addAllSelectedUsers = () => {
    setSelectedUsers((list) => [
      ...list,
      ...users.result.filter(
        (userData) => selectedTableRows.includes(userData.id)
         && !list.some((user) => user.id === userData.id),
      ),
    ]);
    setSelectedTableRows([]);
    resetRowsSelection();
  };

  const removeAllSelectedUsers = () => {
    setSelectedUsers((list) => list.filter((user) => !selectedTableRows.includes(user.id)));
    setSelectedTableRows([]);
    resetRowsSelection();
  };

  const getUsers = () => {
    // si se deben mostrar los usuarios seleccionados, abortar solicitud
    if (userFilters.status === '1') return;

    const filtersCopy = { ...userFilters, page: currentPage };
    if (filtersCopy.search?.trim().length === 0) delete filtersCopy.search;
    if (filtersCopy.promotion?.trim().length === 0) delete filtersCopy.promotion;

    const searchParams = new URLSearchParams(filtersCopy);

    // si hay usuarios seleccionados por default , estos serán buscados primero
    defaultSelectedUsers?.forEach((user) => {
      searchParams.append('priority', user.id);
    });

    const uri = `${serverHost}/user?${searchParams.toString()}`;
    getUsersFetch({ uri, headers: { authorization: token } });
  };

  useEffect(() => {
    if (!defaultSelectedUsers) return;
    // agregar usuarios seleccionados por defecto
    setSelectedUsers(defaultSelectedUsers);
  }, [defaultSelectedUsers]);

  useEffect(() => {
    // Realiza también el fetch inicial
    getUsers();
  }, [currentPage]);

  useEffect(() => {
    if (Object.keys(userFilters).length === 0) return;
    // No realizar fetch si no hay filtros (excluye el fetch inicial)
    getUsers();
  }, [userFilters]);

  useEffect(() => {
    setCurrentPage(0);
  }, [userFilters]);

  useEffect(() => {
    // cambiar número en la paginación
    // Esta acción tiene fines estéticos para el número de items a mostrar
    const media = matchMedia('(max-width:700px)');

    const handleMediaChange = (e) => {
      if (e.matches) setPaginationItems(0);
      else setPaginationItems(2);
    };

    media.onchange = handleMediaChange;
    handleMediaChange(media);
  }, []);

  useEffect(() => {
    // lanzar el callback cuando cambian los usuarios seleccionados
    if (onChange) onChange(selectedUsers.map((user) => user.id));
  }, [selectedUsers]);

  return (
    <>
      <UserTableFilter
        onChange={handleUserFilterChange}
        showAddAllOption={
          selectedTableRows.length > 0
          && !selectedTableRows.some((id) => selectedUsers.some((userData) => userData.id === id))
        }
        showDeleteAllOption={
          selectedTableRows.length > 0
          && selectedTableRows.every((id) => selectedUsers.some((userData) => userData.id === id))
        }
        onAddAllClick={addAllSelectedUsers}
        onDeleteAllClick={removeAllSelectedUsers}
      />
      <Table
        header={['No.', '', 'Nombre', '']}
        maxCellWidth="200px"
        loading={loadingUsers}
        showNoResults={usersError !== undefined && usersError !== null}
        onSelectedRowsChange={handleRowSelect}
        resetRowSelection={triggerResetRowsSelection}
        breakPoint="700px"
      >
        {(userFilters?.status === '1' ? filterSelectedUsers() : users?.result)?.map(
          (user, index) => (
            <TableRow id={user.id} key={user.id}>
              <td>{(users ? users.resultsPerPage * currentPage : 0) + index + 1}</td>
              <td className={styles.pictureRow}>
                <UserPicture name={user.name} idUser={user.id} hasImage={user.hasImage ?? false} />
              </td>
              <td className={styles.nameRow}>
                <UserNameLink idUser={user.id} name={`${user.name} ${user.lastname}`} />
              </td>
              <td className={styles.buttonRow}>
                {selectedUsers.some((userData) => userData.id === user.id) ? (
                  <Button text="Remover" red onClick={() => removeUser(user)} />
                ) : (
                  <Button text="Agregar" green onClick={() => selectUser(user)} />
                )}
              </td>
            </TableRow>
          ),
        )}
      </Table>
      {userFilters.status !== '1' && (
        <Pagination
          count={users?.pages ?? 0}
          siblingCount={paginationItems}
          className={styles.pagination}
          onChange={handlePageChange}
          page={currentPage + 1}
        />
      )}
    </>
  );
}

export default UserSelectTable;

UserSelectTable.propTypes = {
  defaultSelectedUsers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      lastname: PropTypes.string.isRequired,
      promotion: PropTypes.number.isRequired,
      promotionGroup: PropTypes.string.isRequired,
    }),
  ),
  onChange: PropTypes.func,
};

UserSelectTable.defaultProps = {
  defaultSelectedUsers: null,
  onChange: null,
};
