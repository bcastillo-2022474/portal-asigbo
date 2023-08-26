/* eslint-disable react/button-has-type */
import React from 'react';
import PropTypes from 'prop-types';
import styles from './Button.module.css';

function Button({
  text,
  onClick,
  type,
  className,
  disabled = false,
  red,
  emptyRed,
  green,
}) {
  return (
    <button
      className={`${styles.button} 
      ${emptyRed ? styles.emptyRed : ''}
      ${red ? styles.red : ''}
      ${green ? styles.green : ''}
      ${className}`}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
}

Button.propTypes = {
  text: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  type: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  red: PropTypes.bool,
  emptyRed: PropTypes.bool,
  green: PropTypes.bool,
};

Button.defaultProps = {
  className: '',
  onClick: null,
  red: false,
  emptyRed: false,
  green: false,
  type: 'button',
  disabled: false,
};
export default Button;
