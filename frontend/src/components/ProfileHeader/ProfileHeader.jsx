import React from 'react';
import PropTypes from 'prop-types';
import styles from './ProfileHeader.module.css';
import ProfilePicture from '../ProfilePicture/ProfilePicture';
import { serverHost } from '../../config';

function ProfileHeader({
  idUser, hasImage, name, lastname, promotion,
}) {
  return (
    <div className={styles.profileHeader}>

      <ProfilePicture uri={`${serverHost}/image/user/${idUser}`} hasImage={hasImage} />

      <div className={styles.headerDataContainer}>
        <span className={styles.userName}>{`${name} ${lastname}`}</span>
        <span className={styles.userPromotion}>{`Promoción ${promotion}`}</span>
      </div>
    </div>
  );
}

export default ProfileHeader;

ProfileHeader.propTypes = {
  idUser: PropTypes.string.isRequired,
  hasImage: PropTypes.bool,
  name: PropTypes.string.isRequired,
  lastname: PropTypes.string.isRequired,
  promotion: PropTypes.number.isRequired,
};

ProfileHeader.defaultProps = {
  hasImage: false,
};
