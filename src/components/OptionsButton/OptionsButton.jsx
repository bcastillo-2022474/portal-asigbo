import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { AiOutlineDown as DownArrow } from 'react-icons/ai';
import Button from '@components/Button';
import useToogle from '@hooks/useToogle';
import randomString from '@helpers/randomString';
import styles from './OptionsButton.module.css';

/**
 * Botón que muestra un menu que aparece/desaparece al hacer click.
 * @param options Arreglo de opciones a mostrar. Las opciones deben ser un objeto:
 * {icon: Nodo, text: string, onClick: func}
 */
function OptionsButton({ options, showMenuAtTop }) {
  const [isMenuVisible, toogleMenu, setMenuVisible] = useToogle(false);
  const buttonRef = useRef();

  useEffect(() => {
    const handleWindowClick = (e) => {
      if (!buttonRef.current.contains(e.target)) setMenuVisible(false);
    };

    document.addEventListener('click', handleWindowClick);

    return () => document.removeEventListener('click', handleWindowClick);
  }, []);

  return (
    <div className={styles.optionsButtonContainer}>
      <Button className={styles.optionsButton} buttonRef={buttonRef} onClick={toogleMenu}>
        <span>Acciones</span>
        <DownArrow />
      </Button>

      <div className={`${styles.dropMenu} ${isMenuVisible ? styles.visible : ''} ${showMenuAtTop ? styles.topMenu : ''}`}>
        {options?.map((option) => (
          option !== null && (
          <div
            className={styles.menuItem}
            key={randomString()}
            onClick={option.onClick}
            onKeyUp={option.onClick}
            tabIndex={0}
            role="button"
          >
            {option.icon}
            <span>{option.text}</span>
          </div>
          )
        ))}
      </div>
    </div>
  );
}

export default OptionsButton;

OptionsButton.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.node.isRequired,
      text: PropTypes.string.isRequired,
      onClick: PropTypes.func,
    }),
  ),
  showMenuAtTop: PropTypes.bool,
};

OptionsButton.defaultProps = {
  options: null,
  showMenuAtTop: false,
};
