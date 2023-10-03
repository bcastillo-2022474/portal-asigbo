import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './ActivityParticipantsTableFilter.module.css';
import InputSearchSelect from '../InputSearchSelect/InputSearchSelect';
import SearchInput from '../SearchInput/SearchInput';
import useFetch from '../../hooks/useFetch';
import { serverHost } from '../../config';
import useToken from '../../hooks/useToken';
import consts from '../../helpers/consts';

/**
 * Componente para filtrado de tabla de participantes de actividad.
 * El filtro status devuelve, sin seleccionar: '', inscrito: '1', completado: '2'
 * @param onChange Object. Devuelve un objeto con los filtros {status, promotion, search}
 * @returns
 */
function ActivityParticipantsTableFilter({
  className,
  onChange,
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
    <div className={`${styles.activityParticipantsTableFilter} ${className}`}>
      <div className={styles.inputContainer}>
        <InputSearchSelect
          className={styles.selectInput}
          placeholder="Estado"
          value={filter.status}
          onChange={(e) => handleChange('status', e.target.value)}
          options={
            [{ title: 'Inscrito', value: '1' }, { title: 'No completado', value: '2' }, { title: 'Completado', value: '3' }]
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

export default ActivityParticipantsTableFilter;

ActivityParticipantsTableFilter.propTypes = {
  className: PropTypes.string,
  onChange: PropTypes.func,
};

ActivityParticipantsTableFilter.defaultProps = {
  className: '',
  onChange: null,
};
