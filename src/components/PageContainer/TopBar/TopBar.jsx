import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import MenuIcon from '../../../assets/icons/MenuIcon';
import './TopBar.scss';
import mobileImg from '../../../assets/bgLoginMobile.jpg';
/*

TopBar: Es un componente que establece la barra superior de cualquier página autenticada,
posee un botón destinado a desplegar cualquier menú por medio del parámetro de función toggler,
se deberá proveer de un logo y el nombre del becado

@params: {function} toggler: Función destinada a retraer y desplegar algo
@params: {string | JSXElement}: Fuente del logotipo a mostrar
@params: {string} name: Nombre del becado

*/
function TopBar({ toggler, logo, name }) {
  const [isMobile, setMobile] = useState(false);

  useEffect(() => {
    function handleWindow() {
      if (window.innerWidth < 768) {
        setMobile(mobileImg);
      } else {
        setMobile(false);
      }
    }

    handleWindow();

    window.addEventListener('resize', handleWindow);

    return () => {
      window.removeEventListener('resize', handleWindow);
    };
  }, []);

  return (
    <div className="TopBar">
      {isMobile && (
      <div className="bgContainer">
        <div className="colorLayer" />
      </div>
      )}
      <div className="mainBar">
        {/* Botón toggle */}
        <button className="icon" onClick={toggler} type="button">
          <MenuIcon fill="none" stroke="#ffffff" />
        </button>
        {/* Botón de logotipo */}
        <button type="button" className="logoButton">
          <img src={logo} alt="Logo de ASIGBO" />
        </button>
      </div>
      {/* Nombre e ícono del becado */}
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
  // eslint-disable-next-line no-console
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
