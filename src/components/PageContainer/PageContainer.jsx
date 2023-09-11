import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import useToken from '@hooks/useToken';
import LogoLetrasBlancas from '../../assets/General/Copia de Transparente (letras blancas).png';
import NavMenu from './NavMenu/NavMenu';
import TopBar from './TopBar/TopBar';
import getTokenPayload from '../../helpers/getTokenPayload';
import styles from './PageContainer.module.css';

/**
*
*PageContainer: Componente con TopBar y sidebar de Menú integrados, es en donde se cargará
*cualquier página autenticada, colocando el contenido como hijo directo de este componente
*
*@param {JSXNode} children : Página o páginas que se mostrarán dentro
*
*/
function PageContainer({ children }) {
  // Estado de sidebar mostrada o retraída, mostrada por defecto.
  const [isToggled, setToggle] = useState(false);
  const [isAnimated, setAnimation] = useState(false);
  const [isShown, setShown] = useState(false);
  const [payload, setPayload] = useState({});
  const token = useToken();

  useEffect(() => {
    function handleWindow() {
      if (window.innerWidth <= 768) {
        setToggle(false);
        setTimeout(() => {
          setAnimation(true);
        }, 10);
      } else {
        setToggle(true);
        setAnimation(false);
      }
    }

    handleWindow();

    window.addEventListener('resize', handleWindow);

    return () => {
      window.removeEventListener('resize', handleWindow);
    };
  }, []);

  useEffect(() => {
    if (token === undefined || token === null) setShown(false);
    else {
      setShown(true);
      setToggle(false);
      setPayload(getTokenPayload(token));
    }
  }, [token]);

  // Función de despliegue o retracción de sidebar
  const toggleMenu = () => {
    setToggle(!isToggled);
  };

  return (
    <>
      {isShown ? <TopBar toggler={toggleMenu} logo={LogoLetrasBlancas} name={`${payload.name} ${payload.lastname}`} /> : false}
      <div className={`${styles.pageContent} ${isToggled ? styles.showBar : styles.hideBar} ${isShown ? styles.shrink : styles.expand} ${isAnimated ? styles.animation : undefined}`}>
        {isShown ? <NavMenu toggler={toggleMenu} className={styles.NavMenu} /> : false}
        <div className={styles.content}>
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
