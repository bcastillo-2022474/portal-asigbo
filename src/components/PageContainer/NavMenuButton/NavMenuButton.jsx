import React from 'react';
import PropTypes from 'prop-types';
import './NavMenuButton.scss';

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
  /* Icon refiere a un cualquier nodo JSX que sea capaz de mostrar una
  imagen (vector, svg, etc.) únicamente */

  icon: PropTypes.node,
  label: PropTypes.string,
  clickCallback: PropTypes.func,
};

export default NavMenuButton;
