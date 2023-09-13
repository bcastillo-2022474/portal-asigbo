import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { BiSolidUser } from 'react-icons/bi';
import styles from './ProfilePicture.module.css';

/*----------------------------------------------------------------------------------------------*/

/**
 * @module ProfilePicture: Componente que muestra la foto cuya URI es proporcionada, si esta no
 * es proporcionada o no se encuentra, se colocará un placeholder que hará alusión a un usuario
 * genérico.
 *
 * @param {string} uri: URI de dirección de la foto o imagen a mostrar.
 * @param {string} className: Clase(s) que desean agregarse al componente padre, en especial para
 * cambiar su estilo
 *
 * @exports ProfilePicture
 */

/*----------------------------------------------------------------------------------------------*/

function ProfilePicture({ uri, className }) {
  // Se asume en un inicio que la imagen cargará correctamente
  const [loadError, setLoadError] = useState(false);

  // En caso de no cargar o encontrar algún error
  const errorHandler = () => {
    setLoadError(true);
  };

  return (
    <div className={`${styles.profilePicture} ${className}`}>

      {/* Mostrar la imagen, de encontrar un error, utilizar el placeholder */}
      {!loadError ? (

        <img src={uri} alt="Profile" onError={errorHandler} className={styles.image} />

      ) : (

        <div className={styles.placeHolder}>
          <BiSolidUser className={styles.placeHolderIcon} />
        </div>

      )}
    </div>
  );
}

/*----------------------------------------------------------------------------------------------*/

ProfilePicture.propTypes = {
  uri: PropTypes.string.isRequired,
  className: PropTypes.string,
};

ProfilePicture.defaultProps = {
  className: '',
};

/*----------------------------------------------------------------------------------------------*/

export default ProfilePicture;
