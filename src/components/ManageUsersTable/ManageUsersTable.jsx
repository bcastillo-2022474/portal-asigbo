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
import InputSearchSelect from '../InputSearchSelect/InputSearchSelect';
import SearchInput from '../SearchInput/SearchInput';
import consts from '../../helpers/consts';

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
  const [filter, setFilter] = useState({});

  const {
    callFetch: getUsers,
    result: resultUsers,
    error: errorUsers,
    loading: loadingUsers,
  } = useFetch();

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
    if (!resultUsers) return;
    setUsers(resultUsers.result);
  }, [resultUsers]);

  useEffect(() => {
    setUsers([]);
  }, [errorUsers]);

  useEffect(() => {
    setCurrentPage(0);
  }, []);

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
