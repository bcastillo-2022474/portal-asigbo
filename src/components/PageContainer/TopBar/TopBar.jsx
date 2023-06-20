import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import MenuIcon from '../../../assets/icons/MenuIcon';
import mobileImg from '../../../assets/bgLoginMobile.jpg';
import styles from './TopBar.module.scss';
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
    <nav className={styles.TopBar}>
      {isMobile && (
      <div className={styles.bgContainer}>
        <div className={styles.colorLayer} />
      </div>
      )}
      <div className={styles.mainBar}>
        {/* Botón toggle */}
        <button className={styles.icon} onClick={toggler} type="button">
          <MenuIcon fill="none" stroke="#ffffff" />
        </button>
        {/* Botón de logotipo */}
        <button type="button" className={styles.logoButton}>
          <img src={logo} alt="Logo de ASIGBO" />
        </button>
      </div>
      {/* Nombre e ícono del becado */}
      <div className={styles.nameInfo}>
        <span>{name}</span>
        <div className={styles.initialCircle}>
          { name ? name.charAt(0) : 'X'}
        </div>
      </div>
    </nav>
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
