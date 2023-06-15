import './NavBar.scss';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import LogoLetrasBlancas from '../../assets/General/Copia de Transparente (letras blancas).png';
import MenuIcon from '../../assets/icons/MenuIcon';

function NavBar({ children }) {
  const [isToggled, setToggle] = useState(true);

  const toggleMenu = () => {
    setToggle(!isToggled);
  };
  return (
    <>
      <div className="NavBar">
        <button type="button" className="logoButton">
          <img src={LogoLetrasBlancas} alt="Logo de ASIGBO" />
        </button>
        <button className="icon" onClick={toggleMenu} type="button">
          <MenuIcon fill="none" stroke="#ffffff" />
        </button>
      </div>
      <div className={`pageContent ${isToggled ? 'showBar' : 'hideBar'}`}>
        <div className="NavMenu">
          {children}
        </div>
        <div className="content">
          {children}
        </div>
      </div>
    </>
  );
}

NavBar.defaultProps = {
  children: '',
};

NavBar.propTypes = {
  children: PropTypes.node,
};

export default NavBar;
