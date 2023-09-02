import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './UserPicture.module.css';
import { serverHost } from '../../config';
import consts from '../../helpers/consts';

function UserPicture({ idUser, name }) {
  const [imageError, setImageError] = useState(false);

  return (

    <div className={styles.userPicture}>
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
  idUser: PropTypes.string,
  name: PropTypes.string.isRequired,
};

UserPicture.defaultProps = {
  idUser: null,
};
