import React from 'react';
import PropTypes from 'prop-types';
import { BiLogOut } from 'react-icons/bi';
import { IoMdSettings } from 'react-icons/io';
import styles from './NavMenu.module.css';
import UserPicture from '../../UserPicture';
import useLogout from '../../../hooks/useLogout';
import NavMenuButton from '../NavMenuButton/NavMenuButton';

/**
*
* @module NavMenu: Es un componente que establece la barra lateral de navegación, únicamente
* contiene el layout, cualquier función o manipulación externa será en materia de componente.
*
* @param {string} idUser: ID del usuario
* @param {string} name: Nombre del usuario
* @param {string} className: Clases extras a agregar al elemento padre del componente
*
*/

function NavMenu({ idUser, name, className }) {
  const logout = useLogout();

  return (
    <div className={`${styles.navMenu} ${className}`}>
      <div className={styles.profile}>
        <UserPicture className={styles.profilePicture} name={name} idUser={idUser} />
        <span className={styles.profileName}>{name}</span>
      </div>
      <div className={styles.buttons}>
        <div className={styles.navButtons}>
          <NavMenuButton icon={<IoMdSettings />} label="Configuración" className={styles.optionIcon} />
        </div>
        <div className={styles.sessionButtons}>
          <NavMenuButton icon={<BiLogOut />} clickCallback={logout} label="Cerrar Sesión" className={styles.logOut} />
        </div>
      </div>
    </div>
  );
}

NavMenu.propTypes = {
  idUser: PropTypes.string,
  name: PropTypes.string.isRequired,
  className: PropTypes.string,
};

NavMenu.defaultProps = {
  idUser: null,
  className: undefined,
};

export default NavMenu;
