import React, { useState } from 'react';
import PropTypes from 'prop-types';
import randomId from '@helpers/randomString';
import styles from './InputSearchSelect.module.css';

/**
 *
 * @param options Arreglo de objetos {value, title}
 * @returns
 */
function InputSearchSelect({
  title, error, options, className, onChange, name, placeholder, ...props
}) {
  const [addPlaceholderStyle, setAddPlaceholderStyle] = useState(true);
  const id = randomId(15);

  const handleChange = (e) => {
    const { value } = e.target;
    setAddPlaceholderStyle(value === '');
    onChange(e);
  };
  return (
    <div className={`${styles.inputTextContainer} ${error ? styles.error : ''} ${className}`}>
      {title && (
        <label htmlFor={id}>
          {title}
        </label>
      )}
      <select type="text" {...props} id={id} name={name} onChange={handleChange} className={addPlaceholderStyle ? styles.placeHolderStyle : ''}>
        <option value="">{placeholder}</option>
        {options?.map((op) => <option key={randomId(10)} value={op.value}>{op.title}</option>)}
      </select>
      {error && <div className={styles.inputError}>{error}</div>}
    </div>
  );
}

InputSearchSelect.propTypes = {
  title: PropTypes.string,
  error: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
  })),
  className: PropTypes.string,
  placeholder: PropTypes.string,
};

InputSearchSelect.defaultProps = {
  error: null,
  name: randomId(15),
  options: null,
  className: '',
  title: null,
  placeholder: 'Seleccionar opción.',
};

export default InputSearchSelect;
