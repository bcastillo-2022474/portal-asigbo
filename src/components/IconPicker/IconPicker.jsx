/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { BiSolidImage as ImageIcon } from 'react-icons/bi';
import { AiOutlinePlus as PlusIcon, AiOutlineMinus as MinusIcon } from 'react-icons/ai';
import styles from './IconPicker.module.css';

function IconPicker({ className, onChange, defaultImage }) {
  const [imagePreview, setImagePreview] = useState(defaultImage);

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
    if (onChange) onChange(image);
  };

  const clearInput = () => setImagePreview(null);
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
          onClick={clearInput}
          onKeyUp={clearInput}
          role="button"
          tabIndex="0"
        >
          <MinusIcon className={styles.icon} />
        </span>
      )}
      <ImageIcon className={styles.imageIcon} />
      <img src={imagePreview} alt="" className={styles.image} />
    </div>
  );
}

export default IconPicker;

IconPicker.propTypes = {
  className: PropTypes.string,
  onChange: PropTypes.func,
  defaultImage: PropTypes.string,
};

IconPicker.defaultProps = {
  className: '',
  defaultImage: null,
  onChange: null,
};
