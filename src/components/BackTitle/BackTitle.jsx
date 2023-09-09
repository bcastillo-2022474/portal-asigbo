import React from 'react';
import PropTypes from 'prop-types';
import { PiKeyReturnFill as ReturnArrowIcon } from 'react-icons/pi';
import { NavLink } from 'react-router-dom';
import styles from './BackTitle.module.css';

function BackTitle({
  href, title, className, children,
}) {
  return (
    <header className={`${styles.backTitle} ${className}`}>
      <div className={styles.titleContainer}>
        <NavLink to={href} className={styles.arrowLink}>
          <ReturnArrowIcon className={styles.returnArrowIcon} />
          <span>Regresar</span>
        </NavLink>
        <h1>{title}</h1>
      </div>
      {children}
    </header>
  );
}

export default BackTitle;

BackTitle.propTypes = {
  href: PropTypes.string,
  title: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
};

BackTitle.defaultProps = {
  href: '',
  title: '',
  className: '',
  children: null,
};
