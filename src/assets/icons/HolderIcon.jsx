import React from 'react';
import PropTypes from 'prop-types';
import styles from './Icon.module.css';

function HolderIcon({
  fill, width, height, className,
}) {
  return (
    <div className={`${HolderIcon.defaultProps.className} ${className}`}>
      <svg xmlns="http://www.w3.org/2000/svg" fill={fill} width={width} height={height} viewBox="0 0 24 24"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0 4c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1.4c0-2 4-3.1 6-3.1s6 1.1 6 3.1V19z" /></svg>
    </div>
  );
}

HolderIcon.defaultProps = {
  fill: 'none',
  width: '100%',
  height: '100%',
  className: `HolderIcon ${styles.Icon}`,
};

HolderIcon.propTypes = {
  fill: PropTypes.string,
  width: PropTypes.string,
  height: PropTypes.string,
  className: PropTypes.string,
};

export default HolderIcon;
