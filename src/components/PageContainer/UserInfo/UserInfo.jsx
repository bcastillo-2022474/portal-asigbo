import React from 'react';
import PropTypes from 'prop-types';
import styles from './UserInfo.module.css';

/**
 * Componente para mostrar el nombre y foto de perfil del usuario en la barra de navegación y
 * el menú.
 * @param name Nombre del usuario.
 * @param profileImage url de la foto de perfil.
 */
function UserInfo({ name, profileImage, className }) {
  return (
    <div className={`${styles.userInfoContainer} ${className}`}>
      <span>{name}</span>
      <div className={styles.profileContainer}>
        {
        profileImage
          ? <img src={profileImage} alt={`Foto de perfil de ${name}`} />
          : (
            <div className={styles.initialCircle}>
              {name ? name.charAt(0) : 'X'}
            </div>
          )
      }
      </div>
    </div>
  );
}

export default UserInfo;

UserInfo.propTypes = {
  name: PropTypes.string.isRequired,
  profileImage: PropTypes.string,
  className: PropTypes.string,
};

UserInfo.defaultProps = {
  profileImage: null,
  className: '',
};
