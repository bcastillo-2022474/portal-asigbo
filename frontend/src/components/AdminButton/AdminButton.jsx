import React from 'react';
import PropTypes from 'prop-types';
import { IoMdSettings } from 'react-icons/io';
import styles from './AdminButton.module.css';
import Button from '../Button';

function AdminButton({ className }) {
  return (
    <Button className={`${styles.adminButton} ${className}`}>
      Administrar
      <IoMdSettings className={styles.adminButtIcon} />
    </Button>
  );
}

export default AdminButton;

AdminButton.propTypes = {
  className: PropTypes.string,
};

AdminButton.defaultProps = {
  className: '',
};
