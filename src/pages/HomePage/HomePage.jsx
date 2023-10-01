import React from 'react';
// import PropTypes from 'prop-types';
import styles from './HomePage.module.css';
import Banner from '../../components/Banner/Banner';

function HomePage() {
  return (
    <div className={styles.HomePage}>
      <Banner
        bannerImages={['https://scontent.fgua9-2.fna.fbcdn.net/v/t39.30808-6/286199769_5086463024723137_3801566502789090748_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=52f669&_nc_ohc=zwrrjAnCtjQAX-9T6p8&_nc_ht=scontent.fgua9-2.fna&oh=00_AfA-3UuxuJEtmVa3_3dv_kA8YlLbu8Kf5Qjt0nqKQGUByw&oe=651D713D', 'https://scontent.fgua3-4.fna.fbcdn.net/v/t39.30808-6/362248186_663033259191391_7933321749619984886_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=5614bc&_nc_ohc=ZM1UFuQQMJEAX86i9tH&_nc_ht=scontent.fgua3-4.fna&oh=00_AfAMEWTBJDRwrve3uoP265oraLWCOdLfVEPdlQxmylPfAA&oe=651D7754']}
        title="Portal Asigbo"
      />
    </div>
  );
}

export default HomePage;

HomePage.propTypes = {

};

HomePage.defaultProps = {

};
