/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import PopUp from '@components/PopUp';
import jschardet from 'jschardet';
import Button from '@components/Button';
import { BsFillCloudUploadFill } from 'react-icons/bs';
import styles from './ImportCSVPopUp.module.css';
import consts from '../../../helpers/consts';

function ImportCSVPopUp({
  close, isOpen, onImport,
}) {
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const cleanAndClose = () => {
    close();
    setError(false);
    setErrorMessage('');
  };

  const handleChange = async (e) => {
    const file = e.target.files[0];
    if (file.type !== 'text/csv') {
      setError(true);
      setErrorMessage('Tipo de archivo incorrecto, debe adjuntar un archivo de tipo .csv');
      return;
    }
    const fileURL = URL.createObjectURL(file);
    const response = await fetch(fileURL);
    const buffer = await response.arrayBuffer();
    const detectedEncoding = jschardet.detect(new Uint8Array(buffer));
    const text = new TextDecoder(detectedEncoding.encoding).decode(buffer);
    const headers = text.split('\n')[0].trim().split(',');
    if (headers.toString() !== consts.csvHeaders.toString()) {
      setError(true);
      setErrorMessage('Formato incorrecto. Se espera que los encabezados sean: "Código, Nombres, Apellidos, Correo, Promoción, Carrera y Sexo"');
      return;
    }
    onImport(text);
    cleanAndClose();
  };

  const uploadFile = () => {
    const fileInput = document.getElementById('importCSV');
    fileInput.click();
  };

  return (
    isOpen && (
      <PopUp close={cleanAndClose} maxWidth={370}>
        <div className={styles.container}>
          <label htmlFor="importCSV">
            <BsFillCloudUploadFill style={{ fontSize: '10em', color: '#16337F' }} />
            <input
              id="importCSV"
              type="file"
              onChange={handleChange}
            />
          </label>
          <Button htmlFor="importCSV" text="Subir archivo" onClick={uploadFile} />
          <p style={{
            color: 'red',
            display: `${error ? 'block' : 'none'}`,
            fontSize: '0.8em',
            textAlign: 'center',
          }}
          >
            {errorMessage}
          </p>
        </div>
      </PopUp>
    )
  );
}

export default ImportCSVPopUp;

ImportCSVPopUp.propTypes = {
  close: PropTypes.func.isRequired,
  onImport: PropTypes.func,
  isOpen: PropTypes.bool,
};

ImportCSVPopUp.defaultProps = {
  onImport: null,
  isOpen: false,
};
