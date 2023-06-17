import React, { useState, useEffect } from 'react';
import NavMenuButton from '../NavMenuButton/NavMenuButton';
import HomeIcon from '../../../assets/icons/HomeIcon';
import SettingsIcon from '../../../assets/icons/SettingsIcon';
import LogOutIcon from '../../../assets/icons/LogOutIcon';
import './NavMenu.scss';

/*
NavMenu: Es un sidebar desplegable que corre el contenido adyacente
a la izquierda, este se encargará de proveer al usuario de las opciones de navegación
que tenga disponibles

@param: ninguno
*/
function NavMenu() {
  // Strokes refiere al color de relleno de los íconos
  const [strokes, setStrokes] = useState('');

  useEffect(() => {
    function handleWindow() {
      if (window.innerWidth < 768) {
        setStrokes('#FFFFFF');
      } else {
        setStrokes('#16337F');
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

export default NavMenu;
