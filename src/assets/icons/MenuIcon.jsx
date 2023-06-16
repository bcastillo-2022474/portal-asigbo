import React from 'react';
import PropTypes from 'prop-types';
import './Icon.scss';

function MenuIcon({ fill, stroke }) {
  return (
    <div className="MenuIcon Icon">
      <svg width="100%" height="100%" viewBox="0 0 24 24" fill={fill} xmlns="http://www.w3.org/2000/svg">
        <g id="Menu / Menu_Alt_01">
          <path id="Vector" d="M12 17H19M5 12H19M5 7H19" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

MenuIcon.defaultProps = {
  fill: 'none',
  stroke: '#000000',
};

MenuIcon.propTypes = {
  fill: PropTypes.string,
  stroke: PropTypes.string,
};

export default MenuIcon;
