import React from 'react';
import PropTypes from 'prop-types';
import styles from './ProfileUserData.module.css';
import DataField from '../DataField/DataField';

function ProfileUserData({
  email, university, campus, career, sex,
}) {
  return (
    <div className={styles.mainDataContainer}>
      {email && <DataField className={styles.dataField} label="Email">{email}</DataField>}
      {university && <DataField className={styles.dataField} label="Universidad">{university}</DataField>}
      {campus && <DataField className={styles.dataField} label="Campus">{campus}</DataField>}
      {career && <DataField className={styles.dataField} label="Carrera">{career}</DataField>}
      {sex && <DataField className={styles.dataField} label="Sexo">{sex}</DataField>}
    </div>
  );
}

export default ProfileUserData;

ProfileUserData.propTypes = {
  email: PropTypes.string,
  university: PropTypes.string,
  campus: PropTypes.string,
  career: PropTypes.string,
  sex: PropTypes.string,
};

ProfileUserData.defaultProps = {
  email: null,
  university: null,
  campus: null,
  career: null,
  sex: null,
};
