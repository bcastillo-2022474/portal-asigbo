import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { serverHost } from '@/config';
import consts from '@helpers/consts';
import getTokenPayload from '@helpers/getTokenPayload';
import useToken from '@hooks/useToken';
import styles from './UserPicture.module.css';

/**
 * @module UserPicture: Foto de perfil del usuario, de lo contrario se mostrará una imagen
 * circular con su inicial, de no ser credenciales válidas en materia de nombre, se colocará
 * una "X" como inicial.
 *
 * @param {string} idUser: ID del usuario al que pertenece la foto.
 * @param {string} name: Nombre del usuario, en caso de no existir o encontrar la foto, se colocará
 * la inicial como foto. **ESTA PROPIEDAD ES OBLIGATORIA**
 * @param {string} className: Clases aplicadas al elemento padre del componente
 * @param {boolean} hasImage: Indica si el usuario posee foto de perfil o no.
 *
 * @exports UserPicture
 */

function UserPicture({
  idUser, name, className, hasImage, onClick,
}) {
  const [imageError, setImageError] = useState(false);

  const token = useToken();
  const user = token ? getTokenPayload(token) : null;

  return (
    <Link
      to={user?.id === idUser ? '/perfil' : `/usuario/${idUser}`}
      className={`${styles.userPicture} ${className}`}
      title={name}
      onClick={onClick}
    >
      {hasImage && !imageError && idUser ? (
        <img
          src={`${serverHost}/${consts.imageRoute.user}/${idUser}`}
          alt={`Foto de perfil de ${name}`}
          onError={() => setImageError(true)}
        />
      ) : (
        <div className={styles.initialCircle}>{name ? name.charAt(0) : 'X'}</div>
      )}
    </Link>
  );
}

export default UserPicture;

UserPicture.propTypes = {
  className: PropTypes.string,
  idUser: PropTypes.string,
  name: PropTypes.string.isRequired,
  hasImage: PropTypes.bool.isRequired,
  onClick: PropTypes.func,
};

UserPicture.defaultProps = {
  className: '',
  idUser: null,
  onClick: null,
};
