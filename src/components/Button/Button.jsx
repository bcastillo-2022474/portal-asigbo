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
  emptyBlue,
  children,
  // eslint-disable-next-line react/prop-types
  buttonRef,
}) {
  return (
    <button
      className={`${styles.button} 
      ${emptyRed ? styles.emptyRed : ''}
      ${red ? styles.red : ''}
      ${green ? styles.green : ''}
      ${emptyBlue ? styles.emptyBlue : ''}
      ${className}`}
      type={type}
      onClick={onClick}
      disabled={disabled}
      ref={buttonRef}
    >
      {children || text}
    </button>
  );
}

Button.propTypes = {
  text: PropTypes.string,
  onClick: PropTypes.func,
  type: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  red: PropTypes.bool,
  emptyRed: PropTypes.bool,
  green: PropTypes.bool,
  emptyBlue: PropTypes.bool,
  children: PropTypes.node,
};

Button.defaultProps = {
  text: '',
  className: '',
  onClick: null,
  red: false,
  emptyRed: false,
  green: false,
  emptyBlue: false,
  type: 'button',
  disabled: false,
  children: null,
};
export default Button;
