/* eslint-disable jsx-a11y/control-has-associated-label */
import React from 'react';
import PropTypes from 'prop-types';
import UserNameLink from '@components/UserNameLink';
import Table from '../Table/Table';
import TableRow from '../TableRow/TableRow';
import UserPicture from '../UserPicture';
import styles from './UserTable.module.css';

function UserTable({ users, loading, className }) {
  return (
    <Table showCheckbox={false} header={['No.', '', 'Nombre', 'Promoción']} breakPoint="700px" loading={loading} className={className}>
      {users?.map((user, index) => (
        <TableRow id={user.id} key={user.id}>
          <td>{index + 1}</td>
          <td className={styles.pictureRow}>
            <UserPicture name={user.name} idUser={user.id} hasImage={user.hasImage ?? false} />
          </td>
          <td className={styles.nameRow}>
            <UserNameLink idUser={user.id} name={`${user.name} ${user.lastname ?? ''}`} />
          </td>
          <td className={styles.promotionRow}>{user.promotion}</td>
        </TableRow>
      ))}
    </Table>
  );
}

export default UserTable;

UserTable.propTypes = {
  className: PropTypes.string,
  loading: PropTypes.bool,
  users: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    lastname: PropTypes.string,
    promotion: PropTypes.number.isRequired,
    hasImage: PropTypes.bool,
  })),
};

UserTable.defaultProps = {
  className: '',
  loading: false,
  users: null,
};
