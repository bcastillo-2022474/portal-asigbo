/* eslint-disable jsx-a11y/control-has-associated-label */
import React from 'react';
import PropTypes from 'prop-types';
import { AiFillLock as BlockIcon, AiFillUnlock as UnblockIcon } from 'react-icons/ai';
import { MdEmail as EmailIcon } from 'react-icons/md';
import Table from '../Table/Table';
import TableRow from '../TableRow/TableRow';
import UserPicture from '../UserPicture';
import styles from './ManageUsersTable.module.css';
import OptionsButton from '../OptionsButton/OptionsButton';

function ManageUsersTable({ users }) {
  const handleBlockOptionClick = () => {
    /* Bloquear usuario */
  };

  const handleUnblockOptionClick = () => {
    /* Desbloquear usuario */
  };

  const handleReSendEmailOptionClick = () => {
    /* Reenviar correo de registro */
  };

  return (
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
              />
            </div>
          </td>
        </TableRow>
      ))}
    </Table>
  );
}

export default ManageUsersTable;

ManageUsersTable.propTypes = {
  users: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    lastname: PropTypes.string.isRequired,
    promotion: PropTypes.number.isRequired,
    blocked: PropTypes.bool.isRequired,
    completeRegistration: PropTypes.bool.isRequired,
  })),
};

ManageUsersTable.defaultProps = {
  users: null,
};
