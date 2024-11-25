import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import useToken from '@hooks/useToken';
import getTokenPayload from '@helpers/getTokenPayload';
import styles from './UserNameLink.module.css';

function UserNameLink({ idUser, name }) {
  const token = useToken();
  const user = token ? getTokenPayload(token) : null;
  return (
    <Link to={user?.id === idUser ? '/perfil' : `/usuario/${idUser}`} className={styles.userLink}>{name}</Link>
  );
}

export default UserNameLink;

UserNameLink.propTypes = {
  idUser: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};

UserNameLink.defaultProps = {

};
