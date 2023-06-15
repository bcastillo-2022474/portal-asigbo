import './PageContainer.scss';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import LogoLetrasBlancas from '../../assets/General/Copia de Transparente (letras blancas).png';
import NavMenu from './NavMenu/NavMenu';
import TopBar from './TopBar/TopBar';

/*

PageContainer: Componente con TopBar y sidebar de Menú integrados, es en donde se cargará
cualquier página autenticada, colocando el contenido como hijo directo de este componente

@params: {JSXNode} children : Página o páginas que se mostrarán dentro

*/
function PageContainer({ children }) {
  // Estado de sidebar mostrada o retraída, mostrada por defecto.
  const [isToggled, setToggle] = useState(true);

  // Función de despliegue o retracción de sidebar
  const toggleMenu = () => {
    setToggle(!isToggled);
  };

  return (
    <>
      <TopBar toggler={toggleMenu} logo={LogoLetrasBlancas} name="Sebastián Silva" />
      <div className={`pageContent ${isToggled ? 'showBar' : 'hideBar'}`}>
        <NavMenu />
        <div className="content">
          {children}
        </div>
      </div>
    </>
  );
}

PageContainer.defaultProps = {
  children: '',
};

PageContainer.propTypes = {
  children: PropTypes.node,
};

export default PageContainer;
