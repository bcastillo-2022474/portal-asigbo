import './NavBar.scss';
import React, { useState } from 'react';
import LogoLetrasBlancas from '../../assets/General/Copia de Transparente (letras blancas).png';
import MenuIcon from '../../assets/icons/MenuIcon';

function NavBar() {
  const [isToggled, setToggle] = useState(false);

  const toggleMenu = () => {
    setToggle(!isToggled);
  };
  return (
    <div className="NavBar">
      <button type="button" className="logoButton">
        <img src={LogoLetrasBlancas} alt="Logo de ASIGBO" />
      </button>
      <button className="icon" onClick={toggleMenu} type="button">
        <MenuIcon fill="none" stroke="#ffffff" />
      </button>
    </div>
  );
}

export default NavBar;
