import React from 'react';
import PropTypes from 'prop-types';
import styles from './Icon.module.css';

function HomeIcon({
  fill, width, height,
}) {
  return (
    <div className={styles.Icon}>
      <svg fill={fill} width={width} height={height} viewBox="0 0 24 24" id="home-alt-3" data-name="Flat Color" xmlns="http://www.w3.org/2000/svg" className="icon flat-color"><path id="primary" d="M21.71,11.29l-9-9a1,1,0,0,0-1.42,0l-9,9a1,1,0,0,0-.21,1.09A1,1,0,0,0,3,13H4v7.3A1.77,1.77,0,0,0,5.83,22H8.5a1,1,0,0,0,1-1V16.1a1,1,0,0,1,1-1h3a1,1,0,0,1,1,1V21a1,1,0,0,0,1,1h2.67A1.77,1.77,0,0,0,20,20.3V13h1a1,1,0,0,0,.92-.62A1,1,0,0,0,21.71,11.29Z" style={{ fill: { fill } }} /></svg>
    </div>
  );
}

HomeIcon.defaultProps = {
  fill: 'none',
  width: '100%',
  height: '100%',
};

HomeIcon.propTypes = {
  fill: PropTypes.string,
  width: PropTypes.string,
  height: PropTypes.string,
};

export default HomeIcon;
