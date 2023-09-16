import React from 'react';
import PropTypes from 'prop-types';
import styles from './DataField.module.css';

function DataField({ className, children, label }) {
  return (
    <div className={`${styles.container} ${className}`}>
      <span>{label}</span>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}

DataField.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  label: PropTypes.string,
};

DataField.defaultProps = {
  className: '',
  children: '',
  label: '',
};

export default DataField;
