import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import AsigboIcon from '@assets/logo/icono_asigbo.png';
import dayjs from 'dayjs';
import styles from './ActivityItem.module.css';
import 'dayjs/locale/es';

dayjs.locale('es');

function ActivityItem({
  url,
  name,
  imageUrl,
  date,
  className,
}) {
  const [showDefaultImg, setShowDefaultImg] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!imageUrl) {
      setShowDefaultImg(true);
      setShow(true);
    }
  }, [imageUrl]);

  const handleImageError = () => {
    setShowDefaultImg(true);
    setShow(true);
  };

  return (
    <div className={`${styles.activityItemContainer} ${show ? styles.visible : ''} ${className}`}>
      <NavLink to={url} className={styles.linkContainer}>
        <div className={styles.activityItem}>
          {!showDefaultImg && (
            <div className={styles.imageContainer}>
              <img
                src={`${imageUrl}`}
                alt="Imagen descriptiva de la actividad"
                loading="lazy"
                onError={handleImageError}
                onLoad={() => setShow(true)}
              />
            </div>

          )}
        </div>
        {
            showDefaultImg && (
            <div className={styles.defaultImageContainer}>
              <img src={AsigboIcon} alt="Asigbo" />
            </div>
            )
          }
        <div className={styles.infoContainer}>
          <h3 className={styles.date}>{dayjs(date).locale('es').format('dddd, D [de] MMMM YYYY')}</h3>
          <h3 className={styles.name}>{name}</h3>
        </div>
      </NavLink>
    </div>
  );
}

export default ActivityItem;

ActivityItem.propTypes = {
  url: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  imageUrl: PropTypes.string,
  className: PropTypes.string,
  date: PropTypes.string.isRequired,
};

ActivityItem.defaultProps = {
  className: '',
  imageUrl: null,
};
