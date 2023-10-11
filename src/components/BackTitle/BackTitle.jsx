import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { PiKeyReturnFill as ReturnArrowIcon } from 'react-icons/pi';
import { NavLink } from 'react-router-dom';
import styles from './BackTitle.module.css';

function BackTitle({
  href, title, className, children, breakPoint,
}) {
  const [vertical, setVertical] = useState(false);
  useEffect(() => {
    // media query para cambiar el estilo
    const mediaQuery = window.matchMedia(`(max-width: ${breakPoint})`);

    const handleMediaChange = (e) => {
      setVertical(e.matches);
    };
    mediaQuery.onchange = handleMediaChange;

    // initial change
    handleMediaChange(mediaQuery);
  }, []);
  return (
    <header className={`${styles.backTitle} ${className} ${vertical ? styles.vertical : ''}`}>
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
  breakPoint: PropTypes.string,
};

BackTitle.defaultProps = {
  href: '',
  title: '',
  className: '',
  children: null,
  breakPoint: '0px',
};
