import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import useLogout from '../../../hooks/useLogout';
import NavMenuButton from '../NavMenuButton/NavMenuButton';
import HomeIcon from '../../../assets/icons/HomeIcon';
import SettingsIcon from '../../../assets/icons/SettingsIcon';
import LogOutIcon from '../../../assets/icons/LogOutIcon';
import XIcon from '../../../assets/icons/XIcon';
import LogoLetrasBlancas from '../../../assets/General/Copia de Transparente (letras blancas).png';
import styles from './NavMenu.module.scss';

/*
NavMenu: Es un sidebar desplegable que corre el contenido adyacente
a la izquierda, este se encargará de proveer al usuario de las opciones de navegación
que tenga disponibles

@param: ninguno
*/
function NavMenu({ toggler, className }) {
  // Strokes refiere al color de relleno de los íconos
  const [strokes, setStrokes] = useState('');
  const [isMobile, setMobile] = useState(false);
  const logOut = useLogout();

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
    <nav className={`${styles.NavMenu} ${className}`}>
      {/* Contenedor de botones */}
      {isMobile && (
      <>
        <button className={styles.closeIcon} type="button" onClick={toggler}>
          <XIcon fill={strokes} stroke={strokes} />
        </button>
        <img src={LogoLetrasBlancas} alt="Logo de Asigbo" className={styles.LogoSideBar} />
      </>
      )}
      <div className={styles.buttons}>
        {/* Overlay de botones del centro de la barra */}
        <div className={`${styles.buttonOverlay} ${styles.center}`}>
          <NavMenuButton label="Inicio" icon={<HomeIcon fill={strokes} />} className={styles.menuButton} />
          <NavMenuButton label="Ajustes" icon={<SettingsIcon fill={strokes} />} className={styles.menuButton} />
        </div>
        {/* Overlay de botones en el fondo de la barra */}
        <div className={`${styles.buttonOverlay} ${styles.bottom}`}>
          <NavMenuButton label="Cerrar Sesión" icon={<LogOutIcon fill={strokes} stroke={strokes} width="70%" height="70%" />} clickCallback={logOut} className={styles.menuButton} />
        </div>
      </div>
    </nav>
  );
}

NavMenu.defaultProps = {
  // eslint-disable-next-line no-console
  toggler: () => console.log('Porfavor, establece un toggler para cerrar este menú'),
  className: '',
};

NavMenu.propTypes = {
  toggler: PropTypes.func,
  className: PropTypes.string,
};

export default NavMenu;
