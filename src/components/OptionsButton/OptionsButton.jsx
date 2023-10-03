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
 * @param showMenuAtTop Boolean. Indica si el menu debe mostrarse en la parte superior del botón.
 * @param onMenuVisibleChange Función. Callback que devuelve como parámetro la visibilidad del menú.
 */
function OptionsButton({
  options,
  showMenuAtTop,
  onMenuVisibleChange,
  className,
  label,
}) {
  const [isMenuVisible, toogleMenu, setMenuVisible] = useToogle(false);
  const buttonRef = useRef();

  useEffect(() => {
    const handleWindowClick = (e) => {
      if (!buttonRef.current.contains(e.target)) setMenuVisible(false);
    };

    document.addEventListener('click', handleWindowClick);

    return () => document.removeEventListener('click', handleWindowClick);
  }, []);

  useEffect(() => {
    // llamar al callback con cambio de visibilidad
    if (onMenuVisibleChange) onMenuVisibleChange(isMenuVisible);
  }, [isMenuVisible]);

  return (
    <div className={`${styles.optionsButtonContainer} ${className}`}>
      <Button className={styles.optionsButton} buttonRef={buttonRef} onClick={toogleMenu}>
        <span>{label}</span>
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
  className: PropTypes.string,
  label: PropTypes.string,
  onMenuVisibleChange: PropTypes.func,
};

OptionsButton.defaultProps = {
  options: null,
  showMenuAtTop: false,
  className: '',
  label: 'Acciones',
  onMenuVisibleChange: null,
};
