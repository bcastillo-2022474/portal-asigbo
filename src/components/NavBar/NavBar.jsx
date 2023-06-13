import './NavBar.scss';
import React, { useState } from 'react';
import LogoLetrasBlancas from '../../assets/General/Copia de Transparente (letras blancas).png';
import MenuIcon from '../../assets/icons/MenuIcon';
import XIcon from '../../assets/icons/XIcon';

function NavBar() {
  const [isToggled, setToggle] = useState(false);

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
      <div className={`NavBarMenu ${isToggled ? 'show' : 'hide'}`}>
        <div className="MenuHeader">
          <h1>Menú</h1>
          <button className="closeButton icon" onClick={toggleMenu} type="button">
            <XIcon fill="#ffffff" stroke="#ffffff" />
          </button>
        </div>
        <div className="MenuFooter">
          <button className="logOutButton" type="button">Cerrar Sesión</button>
        </div>
      </div>
    </>
  );
}

export default NavBar;
