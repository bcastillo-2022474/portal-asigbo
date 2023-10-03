import React from 'react';
// import PropTypes from 'prop-types';
import fondo1 from '@assets/fondos/fondo-ipala.jpg';
import fondo2 from '@assets/fondos/fondo-voluntariado.jpg';
import Banner from '@components/Banner/Banner';
import styles from './HomePage.module.css';

function HomePage() {
  return (
    <div className={styles.HomePage}>
      <Banner
        bannerImages={[fondo1, fondo2]}
      />
    </div>
  );
}

export default HomePage;

HomePage.propTypes = {

};

HomePage.defaultProps = {

};
