import React from 'react';
import PropTypes from 'prop-types';
import styles from './NavMenuButton.module.css';

/*

NavMenuButton: Es un componente que contiene un botón personalizado para el componente
NavMenu cuyos íconos, labels y callbacks de click son personalizables desde cualquier padre

@params: {JSXElement} icon: Cualquier componente JSX que contenga un ícono
@params: {string} label: Etiqueta que se muestra debajo del botón
@params: {function} clickCallback: Cualquier función que corresponda al click del botón

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
    console.log('No se ha establecido un callback para click en este componente');
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
