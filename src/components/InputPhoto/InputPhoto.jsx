/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { BiSolidUser as UserIcon } from 'react-icons/bi';
import { AiOutlinePlus as PlusIcon, AiOutlineMinus as MinusIcon } from 'react-icons/ai';
import styles from './InputPhoto.module.css';

/**
 * Componente para seleccionar una foto.
 * @param className String. Clase del componente.
 * @param onChange func. Callback que se ejecuta cuando cambia el estado del input.
 *      Devuelve dos parámetros (value, hasDefaultImage).
 *      Value: valor actual de la imagen. Null si no hay imagen seleccionada.
 *      hasDefaultImage: True si se proveyó una imagen default cargada exitosamente.
 * @param defaultImage src de la imagen default.
 * @returns
 */
function InputPhoto({ className, onChange, defaultImage }) {
  const [imagePreview, setImagePreview] = useState(defaultImage);
  const [hasDefaultImage, setHasDefaultImage] = useState(defaultImage !== null);

  const handleChange = (e) => {
    const image = e.target.files[0];

    if (!image) return;

    const fileReader = new FileReader();

    // cargar preview de la imagen
    fileReader.onload = (event) => {
      if (event.target.readyState === 2) {
        setImagePreview(event.target.result);
      }
    };

    fileReader.readAsDataURL(image);
    onChange(image, hasDefaultImage);
  };

  /**
   * Limpia la imagen seleccionada.
   * @param hasDefImage Valor prioritario que indica si la imagen default fue exitosa.
   */
  const clearInput = (hasDefImage) => {
    setImagePreview(null);
    onChange(null, hasDefImage ?? hasDefaultImage);
  };

  const handleClearKeyUp = (e) => {
    if (e.code !== 'Enter') return;
    clearInput();
  };

  const handleImageError = () => {
    // Indicar que la imagen default falló
    if (imagePreview === defaultImage) {
      setHasDefaultImage(false);
      clearInput(false);
    } else clearInput();
  };

  return (
    <div
      className={`${styles.inputPhoto} ${imagePreview ? styles.imageSelected : ''} ${className}`}
    >
      <input
        type="file"
        id="inputPhoto"
        className={styles.inputFile}
        accept="image/png, image/jpeg, image/jpg"
        onChange={handleChange}
      />
      {!imagePreview ? (
        <label htmlFor="inputPhoto" className={`${styles.inputLabel} ${styles.iconPosition}`}>
          <span className={styles.iconCircle}>
            <PlusIcon className={styles.icon} />
          </span>
        </label>
      ) : (
        <span
          className={`${styles.iconCircle} ${styles.iconPosition}`}
          onClick={() => clearInput()}
          onKeyUp={handleClearKeyUp}
          role="button"
          tabIndex="0"
        >
          <MinusIcon className={styles.icon} />
        </span>
      )}
      <UserIcon className={styles.userIcon} />
      <img src={imagePreview} alt="" className={styles.image} onError={handleImageError} />
    </div>
  );
}

export default InputPhoto;

InputPhoto.propTypes = {
  className: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  defaultImage: PropTypes.string,
};

InputPhoto.defaultProps = {
  className: '',
  defaultImage: null,
};
