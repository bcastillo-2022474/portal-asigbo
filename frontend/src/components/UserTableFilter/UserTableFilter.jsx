import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './UserTableFilter.module.css';
import InputSearchSelect from '../InputSearchSelect/InputSearchSelect';
import SearchInput from '../SearchInput/SearchInput';
import Button from '../Button/Button';
import PromotionsSearchSelect from '../PromotionsSearchSelect/PromotionsSearchSelect';

function UserTableFilter({
  className,
  onChange,
  onAddAllClick,
  onDeleteAllClick,
  showAddAllOption,
  showDeleteAllOption,
  hideActionButtons,
}) {
  const [filter, setFilter] = useState({});

  useEffect(() => {
    if (onChange) onChange(filter);
  }, [filter]);

  const handleChange = (name, value) => {
    setFilter((lastVal) => ({ ...lastVal, [name]: value }));
  };
  return (
    <div className={`${styles.userTableFilter} ${className}`}>
      {!hideActionButtons
      && (
      <div className={styles.buttonContainer}>
        {!showDeleteAllOption && <Button text="Añadir todos" green disabled={!showAddAllOption} onClick={onAddAllClick} />}
        {showDeleteAllOption && <Button text="Eliminar todos" red onClick={onDeleteAllClick} />}
      </div>
      )}
      <div className={styles.inputContainer}>
        <InputSearchSelect
          className={styles.selectInput}
          placeholder="Estado"
          value={filter.status}
          onChange={(e) => handleChange('status', e.target.value)}
          options={
            [{ title: 'Agregado', value: '1' }]
          }
        />
        <PromotionsSearchSelect
          className={styles.selectInput}
          value={filter.promotion}
          onChange={(value) => handleChange('promotion', value)}
        />
        <SearchInput
          className={styles.searchInput}
          handleSearch={(val) => handleChange('search', val)}
        />
      </div>
    </div>
  );
}

export default UserTableFilter;

UserTableFilter.propTypes = {
  className: PropTypes.string,
  showAddAllOption: PropTypes.bool,
  showDeleteAllOption: PropTypes.bool,
  onChange: PropTypes.func,
  onAddAllClick: PropTypes.func,
  onDeleteAllClick: PropTypes.func,
  hideActionButtons: PropTypes.bool,
};

UserTableFilter.defaultProps = {
  className: '',
  showAddAllOption: false,
  showDeleteAllOption: false,
  onChange: null,
  onAddAllClick: null,
  onDeleteAllClick: null,
  hideActionButtons: false,
};
