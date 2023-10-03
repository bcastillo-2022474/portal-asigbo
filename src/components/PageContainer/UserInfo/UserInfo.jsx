import React from 'react';
import PropTypes from 'prop-types';
import styles from './UserInfo.module.css';
import UserPicture from '../../UserPicture/UserPicture';

/**
 * Componente para mostrar el nombre y foto de perfil del usuario en la barra de navegación y
 * el menú.
 * @param name Nombre del usuario.
 * @param idUser Id del usuario a mostrar.
 */
// eslint-disable-next-line no-unused-vars
function UserInfo({ name, idUser, className }) {
  return (
    <div className={`${styles.userInfoContainer} ${className}`}>
      <span>{name}</span>
      <div className={styles.profileContainer}>
        <UserPicture name={name} idUser={idUser} className={styles.userPicture} />
      </div>
    </div>
  );
}

export default UserInfo;

UserInfo.propTypes = {
  name: PropTypes.string.isRequired,
  idUser: PropTypes.string,
  className: PropTypes.string,
};

UserInfo.defaultProps = {
  idUser: null,
  className: '',
};
