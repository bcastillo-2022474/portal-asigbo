import React from 'react';
import PropTypes from 'prop-types';
import randomId from '@helpers/randomString';
import styles from './InputNumber.module.css';

function InputNumber({
  title, error, value, onChange, onBlur, onFocus, name, className, min, max, ...props
}) {
  const id = randomId(15);
  return (
    <div className={`${styles.inputNumberContainer} ${error ? styles.error : ''} ${className}`}>
      <input
        className={styles.inputField}
        type="number"
        min={min}
        max={max}
        {...props}
        id={id}
        name={name}
        defaultValue={value}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
      />
      <label className={styles.inputLabel} htmlFor={id}>
        <div className={styles.labelText}>{title}</div>
      </label>
      {error && <span className={styles.inputError}>{error}</span>}
    </div>
  );
}

InputNumber.propTypes = {
  title: PropTypes.string,
  error: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  value: PropTypes.string,
  name: PropTypes.string,
  className: PropTypes.string,
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
};

InputNumber.defaultProps = {
  error: null,
  value: '',
  name: randomId(15),
  onChange: null,
  onBlur: null,
  onFocus: null,
  title: null,
  className: '',
};

export default InputNumber;
