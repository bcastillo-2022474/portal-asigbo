import React from 'react';
import PropTypes from 'prop-types';
import MenuIcon from '../../../assets/icons/MenuIcon';
import './TopBar.scss';

function TopBar({ toggler, logo, name }) {
  return (
    <div className="TopBar">
      <div className="mainBar">
        <button className="icon" onClick={toggler} type="button">
          <MenuIcon fill="none" stroke="#ffffff" />
        </button>
        <button type="button" className="logoButton">
          <img src={logo} alt="Logo de ASIGBO" />
        </button>
      </div>
      <div className="nameInfo">
        <span>{name}</span>
        <div className="initialCircle">
          { name ? name.charAt(0) : 'X'}
        </div>
      </div>
    </div>
  );
}

TopBar.defaultProps = {
  toggler: () => console.log('No se ha establecido un callback para despliegue'),
  logo: '',
  name: '',
};

TopBar.propTypes = {
  toggler: PropTypes.func,
  logo: PropTypes.string,
  name: PropTypes.string,
};

export default TopBar;
