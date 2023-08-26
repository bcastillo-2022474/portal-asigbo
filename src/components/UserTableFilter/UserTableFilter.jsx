import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './UserTableFilter.module.css';
import InputSearchSelect from '../InputSearchSelect/InputSearchSelect';
import SearchInput from '../SearchInput/SearchInput';
import Button from '../Button/Button';
import useFetch from '../../hooks/useFetch';
import { serverHost } from '../../config';
import useToken from '../../hooks/useToken';
import consts from '../../helpers/consts';

function UserTableFilter({
  className,
  onChange,
  onAddAllClick,
  onDeleteAllClick,
  showAddAllOption,
  showDeleteAllOption,
}) {
  const [filter, setFilter] = useState({});
  const token = useToken();

  const {
    callFetch: getPromotionsFetch,
    result: promotions,
    loading: loadingPromotions,
    error: errorPromotions,
  } = useFetch();

  useEffect(() => {
    // obtener promociones
    getPromotionsFetch({ uri: `${serverHost}/promotion`, headers: { authorization: token } });
  }, []);

  useEffect(() => {
    if (onChange) onChange(filter);
  }, [filter]);

  const handleChange = (name, value) => {
    setFilter((lastVal) => ({ ...lastVal, [name]: value }));
  };
  return (
    <div className={`${styles.userTableFilter} ${className}`}>
      <div className={styles.buttonContainer}>
        {!showDeleteAllOption && <Button text="Añadir todos" disabled={!showAddAllOption} onClick={onAddAllClick} />}
        {showDeleteAllOption && <Button text="Eliminar todos" red onClick={onDeleteAllClick} />}
      </div>
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
        <InputSearchSelect
          className={styles.selectInput}
          placeholder="Promoción"
          value={filter.promotion}
          onChange={(e) => handleChange('promotion', e.target.value)}
          options={
            promotions
              ? [
                ...promotions.notStudents.map(
                  (val) => ({ value: val, title: consts.promotionsGroups[val] }),
                ),
                {
                  value: promotions.students.id,
                  title: consts.promotionsGroups[promotions.students.id],
                },
                ...promotions.students.years.map((year) => ({ value: `${year}`, title: `${year}` })),
              ]
              : null
          }
          disabled={errorPromotions || loadingPromotions}
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
};

UserTableFilter.defaultProps = {
  className: '',
  showAddAllOption: false,
  showDeleteAllOption: false,
  onChange: null,
  onAddAllClick: null,
  onDeleteAllClick: null,
};
