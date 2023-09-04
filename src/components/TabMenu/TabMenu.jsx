import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import styles from './TabMenu.module.css';
import randomString from '../../helpers/randomString';

function TabMenu({ options, breakpoint, className }) {
  const [verticalDesign, setVerticalDesign] = useState();

  useEffect(() => {
    // Media para aplicar cambios
    const media = matchMedia(`(max-width:${breakpoint})`);

    const handleMediaChange = (e) => {
      setVerticalDesign(e.matches);
    };

    media.onchange = handleMediaChange;
    handleMediaChange(media);
  }, []);
  return (
    <nav className={`${styles.tabMenu} ${verticalDesign ? styles.verticalDesign : ''} ${className}`}>
      <ul className={styles.optionsList}>
        {options?.map((option) => (
          <li className={styles.optionItem} key={randomString()}>
            <NavLink end to={option.href} className={({ isActive }) => `${styles.optionLink} ${isActive ? styles.active : ''}`}>{option.text}</NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default TabMenu;

TabMenu.propTypes = {
  options: PropTypes.arrayOf(PropTypes.shape({
    text: PropTypes.string.isRequired,
    href: PropTypes.string.isRequired,
  })),
  breakpoint: PropTypes.string,
  className: PropTypes.string,
};

TabMenu.defaultProps = {
  options: null,
  breakpoint: '500px',
  className: '',
};
