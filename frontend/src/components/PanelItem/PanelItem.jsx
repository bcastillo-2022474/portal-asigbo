import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styles from './PanelItem.module.css';

function PanelItem({ icon, title, href }) {
  return (
    <Link to={href} className={styles.panelItem}>
      <div className={styles.iconContainer}>{icon}</div>
      <h3 className={styles.itemTitle}>{title}</h3>
    </Link>
  );
}

export default PanelItem;

PanelItem.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  href: PropTypes.string,
};

PanelItem.defaultProps = {
  href: '#',
};
