import React from 'react';
import PropTypes from 'prop-types';
import styles from './UserInfo.module.css';
import UserPicture from '../../UserPicture/UserPicture';

/**
 * Componente para mostrar el nombre y foto de perfil del usuario en la barra de navegación y
 * el menú.
 * @param name Nombre del usuario.
 * @param idUser Id del usuario a mostrar.
 * @param {boolean} hasImage: Indica si el usuario posee foto de perfil o no.
 */
// eslint-disable-next-line no-unused-vars
function UserInfo({
  name, idUser, className, hasImage,
}) {
  return (
    <div className={`${styles.userInfoContainer} ${className}`}>
      <span>{name}</span>
      <div className={styles.profileContainer}>
        <UserPicture
          name={name}
          idUser={idUser}
          className={styles.userPicture}
          hasImage={hasImage}
        />
      </div>
    </div>
  );
}

export default UserInfo;

UserInfo.propTypes = {
  name: PropTypes.string.isRequired,
  idUser: PropTypes.string,
  className: PropTypes.string,
  hasImage: PropTypes.bool,
};

UserInfo.defaultProps = {
  idUser: null,
  className: '',
  hasImage: false,
};
