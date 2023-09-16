/* eslint-disable jsx-a11y/control-has-associated-label */
import React from 'react';
import PropTypes from 'prop-types';
import styles from './ActivityResponsibles.module.css';
import Table from '../Table';
import TableRow from '../TableRow';
import UserPicture from '../UserPicture';

function ActivityResponsibles({ data, loading }) {
  return (
    <div className={styles.main}>
      <h1>Encargados</h1>
      {data}
      <Table showCheckbox={false} loading={loading} header={['No.', 'Nombre', 'Promoción']} breakPoint="800px">
        <TableRow>
          <td>2</td>
          <td className={styles.td}>
            <UserPicture idUser="6490fccbf7f317928e0ff3ae" className={styles.img} />
            Herber Sebastián Silva Muñoz
          </td>
          <td>2021</td>
        </TableRow>
        <TableRow>
          <td>3</td>
          <td className={styles.td}>
            <UserPicture idUser="6490fccbf7f317928e0ff3ae" className={styles.img} />
            Herber Sebastián Silva Muñoz
          </td>
          <td>2021</td>
        </TableRow>
      </Table>
    </div>
  );
}

ActivityResponsibles.propTypes = {
  data: PropTypes.instanceOf(Object),
  loading: PropTypes.bool,
};

ActivityResponsibles.defaultProps = {
  data: null,
  loading: false,
};

export default ActivityResponsibles;
