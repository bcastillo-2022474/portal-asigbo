import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './UserPicture.module.css';
import { serverHost } from '../../config';
import consts from '../../helpers/consts';

/**
 * @module UserPicture: Foto de perfil del usuario, de lo contrario se mostrará una imagen
 * circular con su inicial, de no ser credenciales válidas en materia de nombre, se colocará
 * una "X" como inicial.
 *
 * @param {string} idUser: ID del usuario al que pertenece la foto.
 * @param {string} name: Nombre del usuario, en caso de no existir o encontrar la foto, se colocará
 * la inicial como foto. **ESTA PROPIEDAD ES OBLIGATORIA**
 * @param {string} className: Clases aplicadas al elemento padre del componente
 *
 * @exports UserPicture
 */

function UserPicture({ idUser, name, className }) {
  const [imageError, setImageError] = useState(false);

  return (

    <div className={`${styles.userPicture} ${className}`}>
      {
          !imageError
            ? <img src={`${serverHost}/${consts.imageRoute.user}/${idUser}`} alt={`Foto de perfil de ${name}`} onError={() => setImageError(true)} />
            : (
              <div className={styles.initialCircle}>
                {name ? name.charAt(0) : 'X'}
              </div>
            )
      }
    </div>

  );
}

export default UserPicture;

UserPicture.propTypes = {
  className: PropTypes.string,
  idUser: PropTypes.string,
  name: PropTypes.string.isRequired,
};

UserPicture.defaultProps = {
  className: '',
  idUser: null,
};
