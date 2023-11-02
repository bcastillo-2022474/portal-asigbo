/* eslint-disable no-underscore-dangle */
/* eslint-disable no-restricted-syntax */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
// import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { Pagination } from '@mui/material';
import { BiSolidImage as ImageIcon } from 'react-icons/bi';
import ActivityTableFilter from '../ActivityTableFilter/ActivityTableFilter';
import styles from './ResponsibleActivitiesTable.module.css';
import Table from '../Table/Table';
import TableRow from '../TableRow';
import { serverHost } from '../../config';
import useToken from '../../hooks/useToken';
import getTokenPayload from '../../helpers/getTokenPayload';
import useFetch from '../../hooks/useFetch';
import consts from '../../helpers/consts';

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

function ResponsibleActivitiesTable({ onError }) {
  // Constantes
  const token = useToken();
  const sessionUser = getTokenPayload(token);
  const {
    callFetch: fetchResponsibleActivities,
    result: resultActivities,
    error: errorActivities,
    loading: loadingActivities,
  } = useFetch();

  // Estados
  const [filters, setFilters] = useState({});
  const [paginationItems, setPaginationItems] = useState();
  const [currentPage, setCurrentPage] = useState(0);
  const [imageErrors, setImageErrors] = useState({});

  // Manejar imagenes
  const handleImageError = (id) => setImageErrors((val) => ({ ...val, [id]: true }));

  // Manejar filtros
  const handleChange = (name, value) => {
    setFilters((lastVal) => ({ ...lastVal, [name]: value }));
  };

  // Manejar paginación
  const handlePageChange = (e, page) => {
    setCurrentPage(page - 1);
  };

  // Obtener actividades
  const getResponsibleActivities = () => {
    const { search, lowerDate, upperDate } = filters;
    const paramsObj = { page: currentPage };

    if (lowerDate !== undefined && lowerDate !== null) {
      const moment = new Date(lowerDate);
      paramsObj.lowerDate = moment.toISOString().slice(0, 10);
    }
    if (upperDate !== undefined && upperDate !== null) {
      const moment = new Date(upperDate);
      paramsObj.upperDate = moment.toISOString(upperDate).slice(0, 10);
    }
    if (search !== undefined && search !== '') paramsObj.search = search;

    const searchParams = new URLSearchParams(paramsObj);
    fetchResponsibleActivities({
      uri: `${serverHost}/activity/responsible/${sessionUser.id}?${searchParams.toString()}`,
      headers: { authorization: token },
    });
  };

  useEffect(() => {
    getResponsibleActivities();
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

      <Table header={['Actividad', 'Horas de servicio', 'Fecha', 'Eje']} loading={loadingActivities} breakPoint="1110px" showCheckbox={false}>
        {resultActivities?.result.map((value) => (
          <TableRow
            id={value.id}
            key={value.id}
          >
            <td><Link to={`/actividad/${value.id}`} className={styles.activityLink}>{value.name}</Link></td>
            <td>{value.serviceHours}</td>
            <td>{`${value.date.slice(8, 10)}-${value.date.slice(5, 7)}-${value.date.slice(0, 4)}`}</td>
            <td>
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
            </td>
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

ResponsibleActivitiesTable.propTypes = {
  onError: PropTypes.func.isRequired,
};

/*----------------------------------------------------------------------------------------------*/

export default ResponsibleActivitiesTable;
