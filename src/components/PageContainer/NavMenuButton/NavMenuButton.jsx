import React from 'react';
import PropTypes from 'prop-types';
import styles from './NavMenuButton.module.css';

/**
*
* NavMenuButton Es un componente que contiene un botón personalizado para el componente
* NavMenu cuyos íconos, labels y callbacks de click son personalizables desde cualquier padre
*
* @param {JSXElement} icon: Cualquier componente JSX que contenga un ícono
* @param {string} label: Etiqueta que se muestra debajo del botón
* @param {function} clickCallback: Cualquier función que corresponda al click del botón
*
*/
function NavMenuButton({
  icon, label, clickCallback, className,
}) {
  return (
    <div className={`${styles.menuButton} ${className}`}>
      <button className={styles.option} type="button" onClick={clickCallback}>
        <div className={styles.button}>
          <div className={styles.icon}>
            {icon}
          </div>
        </div>
        <span>
          {label}
        </span>
      </button>
    </div>
  );
}

NavMenuButton.defaultProps = {
  icon: '',
  label: '',
  clickCallback: () => {
    // eslint-disable-next-line no-console
    throw new Error('No se ha establecido un callback para este botón');
  },
  className: '',
};

NavMenuButton.propTypes = {
  icon: PropTypes.node,
  label: PropTypes.string,
  clickCallback: PropTypes.func,
  className: PropTypes.string,
};

export default NavMenuButton;
