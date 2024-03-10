import React from 'react';
import PropTypes from 'prop-types';
import styles from './CheckBox.module.css';

function CheckBox({ label, onChange, checked }) {
  return (
    // eslint-disable-next-line jsx-a11y/label-has-associated-control
    <label className={styles.checkBoxContainer}>
      <input
        type="checkbox"
        className={styles.inputHidden}
        defaultChecked={checked}
        onChange={onChange}
      />
      <span className={styles.customCheckBox} />
      <span className={styles.labelText}>{label}</span>
    </label>
  );
}

CheckBox.propTypes = {
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  checked: PropTypes.bool.isRequired,
};

export default CheckBox;
