import './NavBar.scss';
import React, { useState } from 'react';
import LogoLetrasBlancas from '../../assets/General/Copia de Transparente (letras blancas).png';
import MenuIcon from '../../assets/icons/MenuIcon';
import XIcon from '../../assets/icons/XIcon';
import ActivityIcon from '../../assets/icons/ActivityIcon';

function NavBar() {
  const [isToggled, setToggle] = useState(false);

  const toggleMenu = () => {
    setToggle(!isToggled);
  };

  const selectedOption = () => {
    // TODO
    // Hacer halgo con alguna opción seleccionada
    console.log('Do Something');
  };
  // Opciones de prueba
  const options = [
    {
      icon: ActivityIcon,
      label: 'Actividades',
      link: '#',
    },
    {
      icon: ActivityIcon,
      label: 'Horas',
      link: '#',
    },
    {
      icon: ActivityIcon,
      label: 'Pagos',
      link: '#',
    },
    {
      icon: ActivityIcon,
      label: 'Pagos',
      link: '#',
    },
    {
      icon: ActivityIcon,
      label: 'Pagos',
      link: '#',
    },
    {
      icon: ActivityIcon,
      label: 'Pagos',
      link: '#',
    },
    {
      icon: ActivityIcon,
      label: 'Pagos',
      link: '#',
    },
    {
      icon: ActivityIcon,
      label: 'Pagos',
      link: '#',
    },
  ];
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
        <div className="MenuContent">
          <ul>
            {options.map((item) => (
              <li className="menuItem" key={item.label}>
                <button type="button" onClick={selectedOption}>
                  <div className="icon">
                    <item.icon fill="white" stroke="none" />
                  </div>
                  <h2>{item.label}</h2>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="MenuFooter">
          <button className="logOutButton" type="button">Cerrar Sesión</button>
        </div>
      </div>
    </>
  );
}

export default NavBar;
