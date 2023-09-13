import React from 'react';
import { DatePicker, ConfigProvider } from 'antd';
import PropTypes from 'prop-types';
import esES from 'antd/locale/es_ES';
import dayjs from 'dayjs';
import styles from './InputSearchDate.module.css';

function InputSearchDateBetween({
  placeholder,
  className,
  setDate,
  disabledBefore,
  disabledAfter,
}) {
  const onChange = (newDate) => {
    setDate(newDate.$d);
  };

  // eslint-disable-next-line arrow-body-style
  const disabledDate = (current) => {
    if (disabledBefore || disabledAfter) {
      let disabledDown;
      let disableUp;
      if (disabledBefore) {
        disabledDown = (current < dayjs(disabledBefore).startOf('day'));
      }
      if (disabledAfter) {
        disableUp = (current > dayjs(disabledAfter).endOf('day'));
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

export default InputSearchDateBetween;
