import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import useToken from '@hooks/useToken';
import LogoLetrasBlancas from '../../assets/General/Copia de Transparente (letras blancas).png';
import TopBar from './TopBar/TopBar';
import getTokenPayload from '../../helpers/getTokenPayload';
import styles from './PageContainer.module.css';
import NotFoundPage from '../../pages/NotFoundPage';
import NavMenu from './NavMenu/NavMenu';

/**
 *
 * PageContainer: Componente con TopBar y sidebar de Menú integrados, es en donde se cargará
 * cualquier página autenticada, colocando el contenido como hijo directo de este componente
 *
 * @param {JSXNode} children : Página o páginas que se mostrarán dentro
 *
 */
function PageContainer({ children }) {
  const [isToggled, setToggle] = useState(false);
  const [isShown, setShown] = useState(false);
  const [isMobile, setMobile] = useState(false);
  const [payload, setPayload] = useState({});
  const token = useToken();

  // Este efecto obtiene la medida de la pantalla para
  // manejar condiciones especiales de Layouts móviles y de escritorio
  useEffect(() => {
    function handleWindow() {
      if (window.innerWidth < 768 || window.innerHeight < 500) {
        if (!isMobile) {
          setToggle(false);
        }
        setMobile(true);
      } else {
        setMobile(false);
        setToggle(false);
      }
    }
    handleWindow();
    window.addEventListener('resize', handleWindow);

    return () => {
      window.removeEventListener('resize', handleWindow);
    };
  }, []);

  // Efecto para obtener la información del usuario, si esta devuelve algún "falsy"
  // no debe mostrarse ningún tipo de información
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
      {isShown ? (
        <TopBar
          toggler={toggleMenu}
          logo={LogoLetrasBlancas}
          name={`${payload.name} ${payload.lastname}`}
          showToggler={isMobile}
        />
      ) : (
        false
      )}
      <div className={styles.pageContainer}>
        <div className={`${styles.navMenu} ${isToggled ? undefined : styles.retractedMenu}`}>
          <NavMenu name={`${payload.name} ${payload.lastname}`} />
        </div>
        <div className={styles.page}>
          {children}
        </div>
      </div>
    </>
  );
}

PageContainer.defaultProps = {
  children: <NotFoundPage />,
};

PageContainer.propTypes = {
  children: PropTypes.node,
};

export default PageContainer;
