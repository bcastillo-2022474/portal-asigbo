import './PageContainer.scss';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import LogoLetrasBlancas from '../../assets/General/Copia de Transparente (letras blancas).png';
import NavMenu from './NavMenu/NavMenu';
import TopBar from './TopBar/TopBar';

function PageContainer({ children }) {
  const [isToggled, setToggle] = useState(true);

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
