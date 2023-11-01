/* eslint-disable no-underscore-dangle */
/* eslint-disable no-restricted-syntax */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { NavLink } from 'react-router-dom';
import { Pagination } from '@mui/material';
import ActivityTableFilter from '../ActivityTableFilter/ActivityTableFilter';
import styles from './ActivityAssignmentTable.module.css';
import Table from '../Table/Table';
import TableRow from '../TableRow';
import { serverHost } from '../../config';
import useAssignment from '../../hooks/useAssignment';
import useToken from '../../hooks/useToken';
import getTokenPayload from '../../helpers/getTokenPayload';

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

function ActivityTable({ /* loading, data, */ listingType, id }) {
  // Estados
  const token = useToken();
  const userInfo = getTokenPayload(token);
  const [search, setSearch] = useState();
  const [filtrated, setFiltrated] = useState();
  const [initialDate, setInitialDate] = useState();
  const [finalDate, setFinalDate] = useState();
  const [currentPage, setCurrentPage] = useState(0);
  const [paginationItems, setPaginationItems] = useState();

  // eslint-disable-next-line no-unused-vars
  const {
    getAssignment, info, loading, error,
  } = useAssignment();

  // Si la búsqieda está vacía la información filtrada es igual a la que proviene del parámetro.

  useEffect(() => {
    dayjs.locale('es');

    const media = matchMedia('(max-width:700px)');

    const handleMediaChange = (e) => {
      if (e.matches) setPaginationItems(0);
      else setPaginationItems(2);
    };

    media.onchange = handleMediaChange;
    handleMediaChange(media);
  }, []);

  const handlePageChange = (e, page) => {
    setCurrentPage(page - 1);
  };

  useEffect(() => {
    if (info) {
      setFiltrated(info.result);
    }
  }, [info]);

  useEffect(() => {
    if (error) {
      setFiltrated(undefined);
    }
  }, [error]);

  // Uso de parámetro de búsqueda con estado.
  const searchHandler = (query) => {
    setSearch(query);
  };

  // Uso de fecha "cota inferior" para filtrado de fechas.
  const initialDateHandler = (date) => {
    let newDate;
    if (date) {
      newDate = dayjs(date);
      newDate = `${newDate.year()}-${newDate.month() + 1}-${newDate.$D}`;
    }
    setInitialDate(newDate);
  };

  // Uso de fecha "cota superior" para filtrado de fechas.
  const finalDateHandler = (date) => {
    let newDate;
    if (date) {
      newDate = dayjs(date);
      newDate = `${newDate.year()}-${newDate.month() + 1}-${newDate.$D}`;
    }
    setFinalDate(newDate);
  };

  /**
   * @function searchValue: Función que indica si al menos un key dentro del objeto y sus objetos
   * internos posee el parámetro de búsqueda esperado.
   *
   * @param {Object} object: Objeto en el que se buscará
   * @param {string} searchParam Parámetro de búsqueda
   * @returns {boolean} Si encontró que el objeto posee el parámetro de búsqueda
   */

  /**
   * @function filterBetweenDates: Función que filtra entre las fechas establecidas o dadas,
   * si alguna de ellas se omite, se hará en base a la cota superior o inferior establecida,
   * si se envían las dos cotas, se filtrará entre ambas fechas. Y si no se proporciona ninguna
   * se devolverá el objeto o arreglo exactamente igual al parámetro dado.
   *
   * @param {Object[]} dataArr: Objeto sobre el que se filtrará
   * @param {string} lowerDate: Cota inferior de fecha.
   * @param {string} upperDate: Cota superior de fecha.
   * @param {string} activityType: Tipo de actividad ('enrolled' o 'byArea').
   * @returns {Object[]} Objeto filtrado entre fechas dadas.
   */

  // Cuando un parámetro de filtro cambie, filtrar sobre ellos.
  useEffect(() => {
    if (!token || (!id && !userInfo?.id)) return;

    getAssignment({
      user: id ?? userInfo.id,
      lowerDate: initialDate,
      upperDate: finalDate,
      searchParam: search,
      page: currentPage,
      token,
    });
  }, [search, initialDate, finalDate]);

  return (
    <div className={styles.activityTable}>
      <ActivityTableFilter
        searchHandler={searchHandler}
        initialDateHandler={initialDateHandler}
        finalDateHandler={finalDateHandler}
      />
      {listingType === 'enrolled' && (
        <Table
          loading={loading}
          header={[
            'Actividad',
            'Horas de servicio',
            'Completado',
            'Fecha',
            'Eje',
          ]}
          breakPoint="1110px"
          showCheckbox={false}
        >
          {filtrated
            && !loading
            && filtrated.map((value) => (
              <TableRow
                id={value.id}
                /*  onClick={() => goToActivity(value.activity.id)} */
                key={value.id}
                /*  onMouseDown={() => newTabActivity(value.activity.id)} */
              >
                <td>
                  <NavLink
                    className={styles.actName}
                    to={`/actividad/${value.activity.id}`}
                  >
                    {value.activity.name}
                  </NavLink>
                </td>
                <td>{value.activity.serviceHours}</td>
                <td>{value.completed ? 'Si' : 'No'}</td>
                <td>
                  {dayjs(
                    String(value.activity.date)
                      .slice(0, 10)
                      .replaceAll('-', '/'),
                    'YYYY-MM-DD',
                  ).format('DD-MM-YYYY')}
                </td>
                <td>
                  <img
                    src={`${serverHost}/image/area/${value.activity.asigboArea.id}`}
                    alt="AreaLogo"
                    className={styles.areaLogo}
                    title={value.activity.asigboArea.name}
                  />
                </td>
              </TableRow>
            ))}
        </Table>
      )}

      {(info && !error) && (
        <Pagination
          className={styles.pagination}
          count={info?.pages ?? 0}
          siblingCount={paginationItems}
          onChange={handlePageChange}
          page={currentPage + 1}
        />
      )}
    </div>
  );
}

/*----------------------------------------------------------------------------------------------*/

ActivityTable.propTypes = {
  /*   loading: PropTypes.bool,
  data: PropTypes.instanceOf(Object), */
  id: PropTypes.string,
  listingType: PropTypes.oneOf(['enrolled', 'byArea']),
};

ActivityTable.defaultProps = {
  /*   loading: false,
  data: undefined, */
  id: '',
  listingType: 'enrolled',
};

/*----------------------------------------------------------------------------------------------*/

export default ActivityTable;
