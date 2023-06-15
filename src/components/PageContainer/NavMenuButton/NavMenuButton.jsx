import React from 'react';
import PropTypes from 'prop-types';
import './NavMenuButton.scss';

/*

NavMenuButton: Es un componente que contiene un botón personalizado para el componente
NavMenu cuyos íconos, labels y callbacks de click son personalizables desde cualquier padre

@params: {JSXElement} icon: Cualquier componente JSX que contenga un ícono
@params: {string} label: Etiqueta que se muestra debajo del botón
@params: {function} clickCallback: Cualquier función que corresponda al click del botón

*/
function NavMenuButton({ icon, label, clickCallback }) {
  return (
    <div className="menuButton">
      <button type="button" onClick={clickCallback}>
        <div className="icon">
          {icon}
        </div>
      </button>
      <span>
        {label}
      </span>
    </div>
  );
}

NavMenuButton.defaultProps = {
  icon: '',
  label: '',
  clickCallback: () => {
    console.log('No se ha establecido un callback para click en este componente');
  },
};

NavMenuButton.propTypes = {
  icon: PropTypes.node,
  label: PropTypes.string,
  clickCallback: PropTypes.func,
};

export default NavMenuButton;
