import React from 'react';
// import PropTypes from 'prop-types';
import fondo1 from '@assets/fondos/fondo1.webp';
import fondo2 from '@assets/fondos/fondo2.webp';
import fondo3 from '@assets/fondos/fondo3.webp';
import fondo4 from '@assets/fondos/fondo4.webp';
import fondo5 from '@assets/fondos/fondo5.webp';
import fondo6 from '@assets/fondos/fondo6.webp';
import Banner from '@components/Banner/Banner';
import styles from './HomePage.module.css';
import useToken from '../../hooks/useToken';
import getTokenPayload from '../../helpers/getTokenPayload';
import UserServiceHoursSummaryPage from '../UserServiceHoursSummaryPage/UserServiceHoursSummaryPage';

function HomePage() {
  const token = useToken();
  const user = token ? getTokenPayload(token) : null;

  return (
    <div className={styles.HomePage}>
      <Banner
        bannerImages={[fondo1, fondo4, fondo2, fondo3, fondo6, fondo5]}
      />
      <div className={styles.page}>
        <h1 className={styles.helloName}>
          ¡
          {/* eslint-disable-next-line no-nested-ternary */}
          {`${user ? (user.sex === 'M' ? 'Bienvenido' : 'Bienvenida') : 'Bienvenido'} ${user ? user.name : ''}`}
          !
        </h1>

        <div className={styles.mainContent}>
          <UserServiceHoursSummaryPage userId={user.id} layoutType="Home" />
        </div>
      </div>
    </div>
  );
}

export default HomePage;

HomePage.propTypes = {

};

HomePage.defaultProps = {

};
