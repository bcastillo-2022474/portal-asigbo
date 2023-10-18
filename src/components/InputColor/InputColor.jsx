import React from 'react';
import PropTypes from 'prop-types';
import randomId from '@helpers/randomString';
import styles from './InputColor.module.css';

function InputColor({
  className, name, value, error, onChange, ...props
}) {
  const id = randomId(15);
  return (
    <div className={`${styles.inputColorContainer} ${error ? styles.error : ''} ${className}`}>
      <label className={styles.pickerContainer} htmlFor={id}>
        <div className={styles.colorMainContainer}>
          <div className={styles.colorCircle} style={{ backgroundColor: value }} />
          <p className={styles.colorName}>
            {' '}
            {value ? value.toUpperCase() : 'Selecciona un color para el eje'}
          </p>
        </div>
        <input type="color" value={value} onChange={onChange} className={styles.colorPicker} id={id} name={name} {...props} />
      </label>
      {error && <span className={styles.inputError}>{error}</span>}
    </div>
  );
}

InputColor.propTypes = {
  className: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  error: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

InputColor.defaultProps = {
  value: '',
  className: '',
  error: null,
};

export default InputColor;
