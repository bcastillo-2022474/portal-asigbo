import React, { useState, useEffect } from 'react';
import { DatePicker, ConfigProvider } from 'antd';
import esES from 'antd/locale/es_ES';
import styles from './InputSearchDate.module.css';

const { RangePicker } = DatePicker;

function InputSearchDateBetween() {
  const [date, setDate] = useState();

  const onChange = (newDate) => {
    setDate(newDate);
  };

  useEffect(() => {
    console.log(date);
  }, [date]);

  return (
    <ConfigProvider
      locale={esES}
      theme={
      {
        token: {
          colorPrimary: 'gray',
        },
      }
    }
    >
      <div className={styles.inputDateContainer}>
        <RangePicker onChange={onChange} className={styles.inputDate} />
      </div>
    </ConfigProvider>
  );
}

InputSearchDateBetween.propTypes = {};

export default InputSearchDateBetween;
