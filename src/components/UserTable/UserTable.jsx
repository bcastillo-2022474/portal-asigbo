import React from 'react';
import PropTypes from 'prop-types';
import Table from '../Table/Table';
import TableRow from '../TableRow/TableRow';
import UserPicture from '../UserPicture';
import styles from './UserTable.module.css';

function UserTable({ users }) {
  return (
    <Table showCheckbox={false} header={['No.', '', 'Nombre', 'Promoción']} breakPoint="700px">
      {users?.map((user, index) => (
        <TableRow id={user.id} key={user.id}>
          <td>{index + 1}</td>
          <td className={styles.pictureRow}>
            <UserPicture name={user.name} idUser={user.id} />
          </td>
          <td className={styles.nameRow}>
            {`${user.name} ${user.lastname}`}
          </td>
          <td className={styles.promotionRow}>{user.promotion}</td>
        </TableRow>
      ))}
    </Table>
  );
}

export default UserTable;

UserTable.propTypes = {
  users: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    lastname: PropTypes.string.isRequired,
    promotion: PropTypes.number.isRequired,
  })),
};

UserTable.defaultProps = {
  users: null,
};
