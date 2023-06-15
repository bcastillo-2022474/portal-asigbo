import React from 'react';
import NavMenuButton from '../NavMenuButton/NavMenuButton';
import HomeIcon from '../../../assets/icons/HomeIcon';
import SettingsIcon from '../../../assets/icons/SettingsIcon';
import LogOutIcon from '../../../assets/icons/LogOutIcon';
import './NavMenu.scss';

function NavMenu() {
  const strokes = '#16337F';

  return (
    <div className="NavMenu">
      <div className="buttons">
        <div className="buttonOverlay center">
          <NavMenuButton label="Inicio" icon={<HomeIcon fill={strokes} />} />
          <NavMenuButton label="Ajustes" icon={<SettingsIcon fill={strokes} />} />
        </div>
        <div className="buttonOverlay bottom">
          <NavMenuButton label="Cerrar Sesión" icon={<LogOutIcon fill={strokes} stroke={strokes} width="70%" height="70%" />} />
        </div>
      </div>
    </div>
  );
}

export default NavMenu;
