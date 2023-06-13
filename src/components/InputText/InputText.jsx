import React from 'react';
import PropTypes from 'prop-types';
import randomId from '@helpers/randomString';
import styles from './InputText.module.css';

const InputText = ({
  title, error, value, onChange, name, ...props
}) => {
  const id = randomId(15);
  return (
    <div className={`${styles.inputTextContainer} ${error ? styles.error : ''}`}>
      <input type="text" {...props} id={id} name={name} defaultValue={value} onChange={onChange} />
      <label className={styles.inputLabel} htmlFor={id}>
        <div className={styles.labelText}>{title}</div>
      </label>
      {error && <span className={styles.inputError}>{error}</span>}
    </div>
  );
};

InputText.propTypes = {
  title: PropTypes.string,
  error: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.string,
  name: PropTypes.string,
};

InputText.defaultProps = {
  error: null,
  value: '',
  name: randomId(15),
  onChange: null,
  title: null,
};

export default InputText;
