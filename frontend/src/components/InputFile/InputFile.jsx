import React from 'react';
import PropTypes from 'prop-types';
import { FaFileUpload as UploadIcon } from 'react-icons/fa';
import styles from './InputFile.module.css';
import Button from '../Button';

function InputFile({ className, onChange, disabled }) {
  const handleOnChange = (evt) => {
    const images = evt.target.files;
    if (onChange && images) onChange(Array.from(images));
  };
  return (
    <Button className={`${styles.inputFileContainer} ${className} ${disabled ? styles.disabled : ''}`}>
      <input
        type="file"
        className={styles.inputFile}
        onChange={handleOnChange}
        multiple
        disabled={disabled}
        title={disabled ? 'El máximo de archivos es 5.' : null}
      />
      <UploadIcon className={styles.uploadButtIcon} />
      Subir archivos
    </Button>
  );
}

export default InputFile;

InputFile.propTypes = {
  className: PropTypes.string,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
};

InputFile.defaultProps = {
  className: '',
  onChange: null,
  disabled: false,
};
