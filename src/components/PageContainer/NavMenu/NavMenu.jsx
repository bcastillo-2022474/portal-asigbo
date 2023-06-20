import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import NavMenuButton from '../NavMenuButton/NavMenuButton';
import HomeIcon from '../../../assets/icons/HomeIcon';
import SettingsIcon from '../../../assets/icons/SettingsIcon';
import LogOutIcon from '../../../assets/icons/LogOutIcon';
import XIcon from '../../../assets/icons/XIcon';
import './NavMenu.scss';
import LogoLetrasBlancas from '../../../assets/General/Copia de Transparente (letras blancas).png';

/*
NavMenu: Es un sidebar desplegable que corre el contenido adyacente
a la izquierda, este se encargará de proveer al usuario de las opciones de navegación
que tenga disponibles

@param: ninguno
*/
function NavMenu({ toggler }) {
  // Strokes refiere al color de relleno de los íconos
  const [strokes, setStrokes] = useState('');
  const [isMobile, setMobile] = useState(false);

  useEffect(() => {
    function handleWindow() {
      if (window.innerWidth < 768) {
        setStrokes('#FFFFFF');
        setMobile(true);
      } else {
        setStrokes('#16337F');
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
    <div className="NavMenu">
      {/* Contenedor de botones */}
      {isMobile && (
      <>
        <button className="closeIcon" type="button" onClick={toggler}>
          <XIcon fill={strokes} stroke={strokes} />
        </button>
        <img src={LogoLetrasBlancas} alt="Logo de Asigbo" className="LogoSideBar" />
      </>
      )}
      <div className="buttons">
        {/* Overlay de botones del centro de la barra */}
        <div className="buttonOverlay center">
          <NavMenuButton label="Inicio" icon={<HomeIcon fill={strokes} />} />
          <NavMenuButton label="Ajustes" icon={<SettingsIcon fill={strokes} />} />
        </div>
        {/* Overlay de botones en el fondo de la barra */}
        <div className="buttonOverlay bottom">
          <NavMenuButton label="Cerrar Sesión" icon={<LogOutIcon fill={strokes} stroke={strokes} width="70%" height="70%" />} />
        </div>
      </div>
    </div>
  );
}

NavMenu.defaultProps = {
  toggler: () => console.log('Porfavor, establece un toggler para cerrar este menú'),
};

NavMenu.propTypes = {
  toggler: PropTypes.func,
};

export default NavMenu;
