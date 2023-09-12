import React from 'react';
import PropTypes from 'prop-types';
import randomId from '@helpers/randomString';
import styles from './InputSelect.module.css';

function InputSelect({
  title, error, options, className, onChange, name, placeholder, onBlur, onFocus, value, ...props
}) {
  const id = randomId(15);
  return (
    <div className={`${styles.inputSelectContainer} ${error ? styles.error : ''} ${className}`}>
      <select
        className={styles.inputField}
        type="text"
        {...props}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        required
      >
        <option value="">{placeholder}</option>
        {options?.map((op) => <option key={randomId(10)} value={op.value}>{op.title}</option>)}
      </select>
      <label className={styles.inputLabel} htmlFor={id}>
        <div className={styles.labelText}>{title}</div>
      </label>
      {error && <span className={styles.inputError}>{error}</span>}
    </div>
  );
}

InputSelect.propTypes = {
  title: PropTypes.string,
  value: PropTypes.string,
  error: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  name: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  })),
  className: PropTypes.string,
  placeholder: PropTypes.string,
};

InputSelect.defaultProps = {
  error: null,
  value: '',
  onBlur: null,
  onFocus: null,
  name: randomId(15),
  options: null,
  className: '',
  title: '',
  placeholder: 'Seleccionar opción.',
};

export default InputSelect;
