/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import PopUp from '@components/PopUp';
import jschardet from 'jschardet';
import { BiSolidCloudUpload } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import styles from './ImportCSVPopUp.module.css';
import consts from '../../helpers/consts';

function ImportCSVPopUp({
  close, isOpen,
}) {
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const cleanAndClose = () => {
    close();
    setError(false);
    setErrorMessage('');
  };

  const handleChange = async (e) => {
    const file = e.target.files[0];
    if (file && file.type !== 'text/csv') {
      setError(true);
      setErrorMessage('Tipo de archivo incorrecto, debe adjuntar un archivo de tipo .csv');
      return;
    }
    const fileURL = URL.createObjectURL(file);
    const response = await fetch(fileURL);
    const buffer = await response.arrayBuffer();
    const detectedEncoding = jschardet.detect(new Uint8Array(buffer));
    const text = new TextDecoder(detectedEncoding.encoding).decode(buffer);
    const content = text.trim().split('\n');
    const headers = content[0].trim().split(',');
    if (headers.toString() !== consts.csvHeaders.toString()) {
      setError(true);
      setErrorMessage('Formato incorrecto. Se espera que los encabezados sean: "Código, Nombres, Apellidos, Correo, Promoción, Carrera, Universidad, Campus y Sexo". También, asegúrate que el archivo tenga codificación ANSI.');
      return;
    }
    const rows = content.slice(1).map((row) => row.trim().split(','));
    const data = rows.map((row) => headers.reduce((acc, header, index) => {
      acc[header] = row[index];
      return acc;
    }, {}));
    navigate('/usuario/importar', {
      state: {
        data,
      },
      replace: true,
    });
    cleanAndClose();
  };

  return (
    isOpen && (
      <PopUp close={cleanAndClose} maxWidth={700}>
        <div className={styles.container}>
          <label htmlFor="importCSV">
            <BiSolidCloudUpload style={{ fontSize: '10em', color: '#16337F', margin: '-20px 0' }} />
            <h2>Importar información</h2>
            <p>Haz click o arrastra y suelta el archivo.</p>
            <input
              id="importCSV"
              type="file"
              onChange={handleChange}
            />
          </label>
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
  isOpen: PropTypes.bool,
};

ImportCSVPopUp.defaultProps = {
  isOpen: false,
};
