import React, { useEffect, useState } from 'react';
// import PropTypes from 'prop-types';
import { AiOutlineRight as RightArrowIcon } from 'react-icons/ai';
import { BiSolidImage as ImageIcon } from 'react-icons/bi';
import { NavLink } from 'react-router-dom';
import styles from './AreasList.module.css';
import useFetch from '../../hooks/useFetch';
import useToken from '../../hooks/useToken';
import { serverHost } from '../../config';
import TableRow from '../TableRow/TableRow';
import consts from '../../helpers/consts';
import Table from '../Table/Table';

/**
 * Componente que muestra el listado de ejes de asigbo.
 */
function AreasList() {
  const {
    callFetch: fetchAreas, result: areas, loading, error,
  } = useFetch();
  const token = useToken();

  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    // obtener listado de api
    fetchAreas({ uri: `${serverHost}/area`, headers: { authorization: token } });
  }, []);

  const handleImageError = (id) => setImageErrors((val) => ({ ...val, [id]: true }));

  return (
    <div className={styles.AreasList}>
      <Table showCheckbox={false} loading={(!areas && !error) || loading} breakPoint="450px">
        {areas?.map((area) => (
          <TableRow key={area.id} id={area.id} maxCellWidth="180px">
            <td>
              <div className={styles.cellContainer}>

                {!imageErrors[area.id] ? (
                  <img
                    className={styles.areaIcon}
                    src={`${serverHost}/${consts.imageRoute.area}/${area.id}`}
                    alt={area.name}
                    onError={() => handleImageError(area.id)}
                  />
                ) : <ImageIcon className={styles.defaultIcon} />}

                <NavLink to={`/area/${area.id}`} className={`${styles.rightButton} ${styles.responsiveButton}`}>
                  <RightArrowIcon className={styles.rightArrowIcon} />
                </NavLink>
              </div>
            </td>
            <td className={styles.nameColumn}>{area.name}</td>
            <td className={styles.arrowColumn}>
              <div className={styles.cellContainer}>
                <NavLink to={`/area/${area.id}`} className={styles.rightButton}>
                  <RightArrowIcon className={styles.rightArrowIcon} />
                </NavLink>
              </div>
            </td>
          </TableRow>
        ))}
      </Table>
    </div>
  );
}

export default AreasList;

AreasList.propTypes = {};

AreasList.defaultProps = {};
