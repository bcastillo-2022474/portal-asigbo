import React from 'react';
import { DatePicker, ConfigProvider } from 'antd';
import PropTypes from 'prop-types';
import esES from 'antd/locale/es_ES';
import dayjs from 'dayjs';
import styles from './InputSearchDate.module.css';

/*----------------------------------------------------------------------------------------------*/

/**
 * @module InputSearchBetween: Componente "input" en el que se podrá seleccionar una fecha,
 * asimismo, restringir fechas de ser necesario.
 *
 * @param {string} placeholder: Placeholder que se mostrará cuando no se haya seleccionado una fecha
 * @param {string} className: Clase(s) a agregar al elemento padre del componente.
 * @param {function} setDate: Función que se espera que maneje la fecha seleccionada.
 * @param {string} disabledBefore: Establece una restricción de selección antes de esta fecha.
 * @param {string} disabledAfter: Establece una restricción de selección después de esta fecha.
 *
 */

/*----------------------------------------------------------------------------------------------*/

function InputSearchDateBetween({
  placeholder,
  className,
  setDate,
  disabledBefore,
  disabledAfter,
}) {
  // Función que maneja el cambio en la fecha.
  const onChange = (newDate) => {
    if (newDate) {
      setDate(newDate.$d);
    } else {
      setDate(null);
    }
  };

  // eslint-disable-next-line arrow-body-style
  // Función que deshabilita las fechas según los parámetros dados.
  const disabledDate = (current) => {
    if (disabledBefore || disabledAfter) {
      let disabledDown;
      let disableUp;
      if (disabledBefore) {
        disabledDown = current < dayjs(disabledBefore).startOf('day');
      }
      if (disabledAfter) {
        disableUp = current > dayjs(disabledAfter).endOf('day');
      }
      return disableUp || disabledDown;
    }
    return false;
  };

  return (
    <ConfigProvider
      locale={esES}
      theme={{
        token: {
          colorPrimary: 'gray',
        },
      }}
    >
      <div className={`${styles.inputDateContainer} ${className}`}>
        <DatePicker
          onChange={onChange}
          className={styles.inputDate}
          placeholder={placeholder}
          disabledDate={disabledDate}
        />
      </div>
    </ConfigProvider>
  );
}

/*----------------------------------------------------------------------------------------------*/

InputSearchDateBetween.propTypes = {
  placeholder: PropTypes.string,
  className: PropTypes.string,
  disabledBefore: PropTypes.instanceOf(Date),
  disabledAfter: PropTypes.instanceOf(Date),
  setDate: PropTypes.func.isRequired,
};

InputSearchDateBetween.defaultProps = {
  placeholder: 'Seleccionar fecha',
  className: '',
  disabledBefore: undefined,
  disabledAfter: undefined,
};

/*----------------------------------------------------------------------------------------------*/

export default InputSearchDateBetween;
