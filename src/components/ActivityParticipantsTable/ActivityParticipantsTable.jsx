import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line no-unused-vars
import { Pagination } from '@mui/material';
import styles from './ActivityParticipantsTable.module.css';
import Table from '../Table/Table';
import useFetch from '../../hooks/useFetch';
import useToken from '../../hooks/useToken';
import { serverHost } from '../../config';
import TableRow from '../TableRow/TableRow';
import UserPicture from '../UserPicture/UserPicture';
import UserNameLink from '../UserNameLink/UserNameLink';

function ActivityParticipantsTable({ idActivity }) {
  const {
    callFetch: fetchAssignmets,
    result: assignmentsResult,
    loading: assignmetsLoading,
    error: assignmentsError,
  } = useFetch();

  const [mappedItems, setMappedItems] = useState([]);

  const token = useToken();

  useEffect(() => {
    // obtener asignaciones al iniciar la tabla
    fetchAssignmets({
      uri: `${serverHost}/activity/${idActivity}/assignment`,
      headers: { authorization: token },
    });
  }, []);

  useEffect(() => {
    if (assignmentsResult) {
      let newItems = [];
      const oldItems = assignmentsResult;
      newItems = oldItems.map((value) => {
        const { user } = value;
        return {
          name: `${user.name} ${user.lastname}`,
          id: `${user.id}`,
          promotion: `${user.promotion}`,
        };
      });
      setMappedItems(newItems);
    }
  }, [assignmentsResult]);

  return (
    <>
      <Table
        header={['No.', '', 'Nombre', 'Promoción']}
        loading={assignmetsLoading}
        breakPoint="1100px"
        showCheckbox={false}
        showNoResults={assignmentsError !== undefined && assignmentsError !== null}
      >
        {mappedItems?.map((user, index) => (
          <TableRow id={user.id} key={user.id}>
            <td>
              {index + 1}
            </td>
            <td className={styles.pictureRow}>
              <UserPicture name={user.name} idUser={user.id} hasImage={user.hasImage ?? false} />
            </td>
            <td className={styles.nameRow}>
              <UserNameLink
                idUser={user.id}
                name={user.name}
              />
            </td>
            <td className={styles.promotionRow}>{user.promotion}</td>
          </TableRow>
        ))}
      </Table>

      {/*       <Pagination
        count={users?.pages ?? 0}
        siblingCount={paginationItems}
        className={styles.pagination}
        onChange={handlePageChange}
        page={currentPage + 1}
      /> */}
    </>
  );
}

export default ActivityParticipantsTable;

ActivityParticipantsTable.propTypes = {
  idActivity: PropTypes.string.isRequired,
};

ActivityParticipantsTable.defaultProps = {};
