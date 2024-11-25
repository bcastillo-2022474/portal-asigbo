import React from 'react';
import PropTypes from 'prop-types';
import randomId from '@helpers/randomString';
import styles from './TextArea.module.css';

function TextArea({
  title, error, className, onChange, name, onBlur, onFocus, value, ...props
}) {
  const id = randomId(15);
  return (
    <div className={`${styles.inputAreaContainer} ${error ? styles.error : ''} ${className}`}>
      <textarea
        className={styles.inputField}
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

TextArea.propTypes = {
  title: PropTypes.string,
  value: PropTypes.string,
  error: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  name: PropTypes.string,
  className: PropTypes.string,
  placeholder: PropTypes.string,
};

TextArea.defaultProps = {
  error: null,
  value: '',
  onBlur: null,
  onFocus: null,
  name: randomId(15),
  className: '',
  title: '',
  placeholder: '',
};

export default TextArea;
