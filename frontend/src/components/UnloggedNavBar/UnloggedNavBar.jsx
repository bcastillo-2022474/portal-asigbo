import React from 'react';
// import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import styles from './UnloggedNavBar.module.css';

function UnloggedNavBar() {
  return (
    <nav className={styles.unloggedNavBar}>
      <NavLink to="/">Iniciar sesión</NavLink>
    </nav>
  );
}

export default UnloggedNavBar;

UnloggedNavBar.propTypes = {

};

UnloggedNavBar.defaultProps = {

};
