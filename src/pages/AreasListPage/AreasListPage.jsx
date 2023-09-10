import React from 'react';
// import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import styles from './AreasListPage.module.css';
import AreasList from '../../components/AreasList/AreasList';
import Button from '../../components/Button/Button';

function AreasListPage() {
  return (
    <div className={styles.globalConfigPage}>
      <div className={styles.pageHeader}>
        <h1>Ejes de ASIGBO</h1>
        <NavLink to="/area/nuevo" className={styles.newLink}>
          <Button text="Nuevo" />
        </NavLink>
      </div>
      <AreasList />
    </div>
  );
}

export default AreasListPage;

AreasListPage.propTypes = {

};

AreasListPage.defaultProps = {

};
