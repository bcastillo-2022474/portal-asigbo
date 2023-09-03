/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { BiSolidUser as UserIcon } from 'react-icons/bi';
import { AiOutlinePlus as PlusIcon, AiOutlineMinus as MinusIcon } from 'react-icons/ai';
import styles from './InputPhoto.module.css';

function InputPhoto({ className, onChange, defaultImage }) {
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
    onChange(image);
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
      <UserIcon className={styles.userIcon} />
      <img src={imagePreview} alt="" className={styles.image} />
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
