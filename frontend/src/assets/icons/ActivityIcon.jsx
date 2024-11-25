import React from 'react';
import PropTypes from 'prop-types';
import styles from './Icon.module.css';

function ActivityIcon({ fill }) {
  return (
    <div className={`ActivityIcon ${styles.Icon}`}>
      <svg fill={fill} width="100%" height="100%" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg"><path d="M790 166h-41V83h-84v83H333V83h-83v83h-42q-34 0-58.5 24.5T125 250v582q0 34 24 58.5t59 24.5h582q35 0 59-24.5t24-58.5V250q0-35-24.5-59.5T790 166zm0 666H208V374h582v458zM291 457h208v208H291V457z" /></svg>
    </div>
  );
}

ActivityIcon.defaultProps = {
  fill: '#000000',
};

ActivityIcon.propTypes = {
  fill: PropTypes.string,
};

export default ActivityIcon;
