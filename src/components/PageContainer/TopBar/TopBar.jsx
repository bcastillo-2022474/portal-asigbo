import React from 'react';
import PropTypes from 'prop-types';
import MenuIcon from '../../../assets/icons/MenuIcon';
import styles from './TopBar.module.css';
import UserInfo from '../UserInfo/UserInfo';
/*

TopBar: Es un componente que establece la barra superior de cualquier página autenticada,
posee un botón destinado a desplegar cualquier menú por medio del parámetro de función toggler,
se deberá proveer de un logo y el nombre del becado

@params: {function} toggler: Función destinada a retraer y desplegar algo
@params: {string | JSXElement}: Fuente del logotipo a mostrar
@params: {string} name: Nombre del becado

*/
function TopBar({ toggler, logo, name }) {
  return (
    <nav className={styles.TopBar}>
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
      <UserInfo className={styles.userInfo} name={name} />
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
