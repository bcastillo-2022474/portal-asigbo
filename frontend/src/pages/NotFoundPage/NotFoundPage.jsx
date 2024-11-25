import React from 'react';
// import PropTypes from 'prop-types';
import banner from '@assets/banner/not-found-banner.svg';
import { NavLink } from 'react-router-dom';
import styles from './NotFoundPage.module.css';

function NotFoundPage() {
  return (
    <div className={styles.notFoundPage}>
      <img src={banner} alt="Banner página no encontrada" className={styles.banner} />
      <h1 className={styles.title}>Página no encontrada</h1>
      <NavLink to="/">Regresar al inicio</NavLink>
    </div>
  );
}

export default NotFoundPage;

NotFoundPage.propTypes = {

};

NotFoundPage.defaultProps = {

};
