import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { scrollbarGray } from '@styles/scrollbar.module.css';
import styles from './Table.module.css';
import Spinner from '../Spinner/Spinner';
import randomString from '../../helpers/randomString';
/**
 * @module Table: Componente para crear las tablas del proyecto.
 *
 *
 * @example
 * <Table>
 *  <TableRow>
 *    <td>valor fila </td>
 *  </TableRow>
 * </Table>
 *
 * @param {string[]} header Arreglo de strings con los encabezados de la tabla.
 * @param {string} breakPoint max-width en el que se aplica el estilo mobile. Se espera que sea
 * un string con medidas válidas.
 * @param {string} maxCellWidth max-width de las celdas de la tabla. Se espera que sea compatible
 * con estilos CSS.
 * @param {string} minCellWidth min-width de las celdas de la tabla. Se espera que sea compatible
 * con estilos CSS.
 * @param {boolean} showCheckbox Se utiliza para indicar si los checkbox se muestran o no.
 * @param {function(selectedRowsId)} onSelectedRowsChange Función que devuelve las filas
 * seleccionadas.
 * @param {string} className String de clases aplicables al elemento padre de la tabla.
 * @param {boolean} loading Indica a la tabla si la información está cargando o no.
 * @param {number} resetTableHeight Funciona como un trigger para resetear las filas seleccionadas.
 * @param {number} resetTableHeight Funciona como un trigger para resetear el alto de la tabla.
 * El alto puede verse modificado cuando el contenido supera el contenedor (los submenus por
 * ejemplo).
 * @param {function(isVerticalStyle)} onTableStyleChange callback para cuando cambia el estilo de
 * la tabla. El parámetro de la función devuelve si es el estilo vertical o no.
 *
 * @requires <TableRow/>
 */
function Table({
  header,
  children,
  breakPoint,
  maxCellWidth,
  minCellWidth,
  showCheckbox,
  onSelectedRowsChange,
  className,
  loading,
  resetRowSelection,
  resetTableHeight,
  onTableStyleChange,
}) {
  const [selectedRowsId, setSelectedRowsId] = useState([]);
  const [useVerticalStyle, setUseVerticalStyle] = useState(false);

  const containerRef = useRef();
  const tableRef = useRef();

  const handleSelect = (id, selected) => {
    if (selected) setSelectedRowsId((prev) => Array.from(new Set([...prev, id])));
    else setSelectedRowsId((prev) => prev.filter((val) => val !== id));
  };

  const handleSelectAll = (e) => {
    // se ejecuta cuando se modifica manualmente el checkbox del encabezado
    const { checked } = e.target;

    if (checked) {
      // seleccionar todos
      setSelectedRowsId(React.Children.map(children, (item) => item.props.id) ?? []);
    } else setSelectedRowsId([]); // vaciar todos
  };

  const resetTableSize = () => {
    containerRef.current.style.height = 'auto';
  };

  useEffect(() => {
    // media query para cambiar el estilo
    const mediaQuery = window.matchMedia(`(max-width: ${breakPoint})`);

    const handleMediaChange = (e) => {
      setUseVerticalStyle(e.matches);
    };
    mediaQuery.onchange = handleMediaChange;

    // initial change
    handleMediaChange(mediaQuery);
  }, []);

  useEffect(() => {
    if (onSelectedRowsChange) onSelectedRowsChange(selectedRowsId);
  }, [selectedRowsId]);

  useEffect(() => {
    // cada vez que se muestre el loading, resetear filas seleccionadas
    setSelectedRowsId([]);
  }, [loading]);

  useEffect(() => {
    // resetear seleccion de filas
    if (resetRowSelection === null) return;
    setSelectedRowsId([]);
  }, [resetRowSelection]);

  useEffect(() => {
    resetTableSize();
  }, [children, resetTableHeight]);

  useEffect(() => {
    /* Detecta si el contenido de la tabla sobrepasa su tamaño y ajusta su altura para
    evitar la aparición de un scroll vertical
    ¡IMPORTANTE! Luego de modificar el alto, es necesario resetear su altura a auto.
    */
    const handleContainerSizeChange = () => {
      const contentSize = containerRef.current.scrollHeight;
      const containerSize = containerRef.current.offsetHeight;

      if (contentSize > containerSize) {
        containerRef.current.style.height = `${contentSize + 30}px`;
      }
    };

    // Observer para detectar cambios en el contenedor de la tabla
    const observer = new MutationObserver(handleContainerSizeChange);

    const config = { attributes: true, childList: true, subtree: true };

    // Comienza a observar el div
    observer.observe(containerRef.current, config);

    return () => observer.disconnect(); // Deja de recibir cambios al desmontar comp.
  }, []);

  useEffect(() => {
    if (onTableStyleChange) onTableStyleChange(useVerticalStyle);
  }, [useVerticalStyle]);

  return (
    <div
      className={`${styles.tableContainer} ${scrollbarGray} ${
        useVerticalStyle ? styles.verticalDesign : ''
      } ${className}`}
      ref={containerRef}
    >
      <table className={`${styles.table} `} ref={tableRef}>
        <thead>
          <tr>
            {showCheckbox && (
              <td className={styles.checkboxCell}>
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={
                    selectedRowsId.length === (children?.length ?? 1) && selectedRowsId.length !== 0
                  }
                />
              </td>
            )}
            {header?.map((val) => (
              <td style={{ maxWidth: maxCellWidth, minWidth: minCellWidth }} key={randomString(10)}>
                {val}
              </td>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td className={styles.completeRow} colSpan={(header?.length ?? 0) + 1}>
                <Spinner />
              </td>
            </tr>
          )}

          {!loading && !(children?.length > 0) && (
            <tr>
              <td
                className={`${styles.completeRow} ${styles.noResults}`}
                colSpan={(header?.length ?? 0) + 1}
              >
                No hay resultados.
              </td>
            </tr>
          )}

          {React.Children.map(children, (child) => {
            if (child) {
              return React.cloneElement(child, {
                onSelect: handleSelect,
                checked: selectedRowsId.includes(child?.props.id),
                header,
                useVerticalStyle,
                maxCellWidth: child?.props.maxCellWidth ?? maxCellWidth,
                minCellWidth: child?.props.minCellWidth ?? minCellWidth,
                showCheckbox,
              });
            }
            return null;
          })}
        </tbody>
        <tfoot />
      </table>
    </div>
  );
}

export default Table;

Table.propTypes = {
  header: PropTypes.arrayOf(PropTypes.string).isRequired,
  children: PropTypes.node,
  breakPoint: PropTypes.string,
  maxCellWidth: PropTypes.string,
  minCellWidth: PropTypes.string,
  showCheckbox: PropTypes.bool,
  onSelectedRowsChange: PropTypes.func,
  className: PropTypes.string,
  loading: PropTypes.bool,
  resetRowSelection: PropTypes.number,
  resetTableHeight: PropTypes.number,
  onTableStyleChange: PropTypes.func,
};

Table.defaultProps = {
  children: null,
  breakPoint: '600px',
  maxCellWidth: null,
  minCellWidth: null,
  showCheckbox: true,
  onSelectedRowsChange: null,
  className: '',
  loading: false,
  resetRowSelection: null,
  resetTableHeight: null,
  onTableStyleChange: null,
};
