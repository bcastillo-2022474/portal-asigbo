/* eslint-disable no-underscore-dangle */
/* eslint-disable no-restricted-syntax */
import { useParams, Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Pagination } from '@mui/material';
import dayjs from 'dayjs';
import ActivityTableFilter from '../ActivityTableFilter/ActivityTableFilter';
import styles from './ActivityTable.module.css';
import Table from '../Table/Table';
import TableRow from '../TableRow';
import useFetch from '../../hooks/useFetch';
import { serverHost } from '../../config';

/*----------------------------------------------------------------------------------------------*/
/**
 * @module ActivityTable: Tabla destinada a mostrar actividades, se espera que se le envíen datos
 * compatibles con su layout, además es capaz de filtrar estas actividades por intervalos de fecha
 * y por valores **exactos** en sus campos.
 *
 * @param {boolean} loading: Le indica a la tabla si la información está cargando o no.
 * @param {Object} data: Objeto de datos de tabla, se espera que el esquema utilizado, sea igual
 * al que devuelve el hook useEnrolledActivities.
 *
 * @requires <Table/>,<TableRow/>,<ActivityTableFilter/>
 */

/*----------------------------------------------------------------------------------------------*/

function ActivityTable({ idArea, onError }) {
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [paginationItems, setPaginationItems] = useState();
  const token = useParams();
  const {
    callFetch: fetchActivities,
    result: resultActivities,
    error: errorActivities,
    loading: loadingActivities,
  } = useFetch();

  // Manejar filtros
  const handleChange = (name, value) => {
    setFilters((lastVal) => ({ ...lastVal, [name]: value }));
  };

  // Manejar paginación
  const handlePageChange = (e, page) => {
    setCurrentPage(page - 1);
  };

  // Obtener actividades
  const getActivities = () => {
    const { search, lowerDate, upperDate } = filters;
    const paramsObj = { page: currentPage };

    if (lowerDate !== undefined && lowerDate !== null) {
      paramsObj.lowerDate = new Date(lowerDate);
    }
    if (upperDate !== undefined && upperDate !== null) {
      paramsObj.upperDate = new Date(dayjs(upperDate).endOf('day'));
    }
    if (search !== undefined && search !== '') paramsObj.search = search;
    const searchParams = new URLSearchParams(paramsObj);
    fetchActivities({
      uri: `${serverHost}/activity/?asigboArea=${idArea}&${searchParams.toString()}`,
      headers: { authorization: token },
    });
  };

  useEffect(() => {
    getActivities();
  }, [filters, currentPage]);

  useEffect(() => {
    if (errorActivities) onError();
  }, [errorActivities]);

  useEffect(() => {
    // cambiar número en la paginación
    const media = matchMedia('(max-width:700px)');

    const handleMediaChange = (e) => {
      if (e.matches) setPaginationItems(0);
      else setPaginationItems(2);
    };

    media.onchange = handleMediaChange;
    handleMediaChange(media);
  }, []);

  return (
    <div className={styles.activityTable}>
      <ActivityTableFilter
        searchHandler={(value) => handleChange('search', value)}
        initialDateHandler={(date) => handleChange('lowerDate', date)}
        finalDateHandler={(date) => handleChange('upperDate', date)}
      />
      <Table
        header={['Actividad', 'Horas de servicio', 'Fecha']}
        loading={loadingActivities}
        breakPoint="1110px"
        showCheckbox={false}
        showNoResults={errorActivities !== undefined && errorActivities !== null}
      >
        {resultActivities?.result.map((value) => (
          <TableRow
            id={value.id}
            key={value.id}
          >
            <td><Link to={`/actividad/${value.id}`} className={styles.activityLink}>{value.name}</Link></td>
            <td>{value.serviceHours}</td>
            <td>{dayjs(value.date).format('DD/MM/YYYY')}</td>
            {/* <td>
              <div className={styles.cellContainer}>

                <Link to={`/area/${value.asigboArea.id}`}>
                  {!imageErrors[value.asigboArea.id] ? (
                    <img
                      className={styles.areaIcon}
                      title={value.asigboArea.name}
                      src={`${serverHost}/${consts.imageRoute.area}/${value.asigboArea.id}`}
                      alt={value.asigboArea.name}
                      onError={() => handleImageError(value.asigboArea.id)}
                    />
                  ) : <ImageIcon className={styles.defaultIcon} title={value.asigboArea.name} />}
                </Link>

              </div>
            </td> */}
          </TableRow>
        ))}
      </Table>
      <Pagination
        count={resultActivities?.pages ?? 0}
        siblingCount={paginationItems}
        className={styles.pagination}
        onChange={handlePageChange}
        page={currentPage + 1}
      />
    </div>
  );
}

/*----------------------------------------------------------------------------------------------*/

ActivityTable.propTypes = {
  idArea: PropTypes.string.isRequired,
  onError: PropTypes.func.isRequired,
};

/*----------------------------------------------------------------------------------------------*/

export default ActivityTable;
