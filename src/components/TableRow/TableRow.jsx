import React from 'react';
import PropTypes from 'prop-types';
import styles from './TableRow.module.css';

/**
 * Fila para el componente Table. Utilizar en lugar de tr para el body de la tabla.
 *
 * @param id ID único de la fila.
 * @param onClick callback del evento onClick de la fila.
 * @param onSelect callbarck cuando la fila es seleccionada a través del checkbox.
 * @param checked valor default de si la fila está seleccionada.
 * @param header array de stings. Corresponden a los encabezados de cada celda en orden.
 * @param useVerticalStyle bool. Indica si hay que colocar el estilo vertical de la tabla.
 * @param maxCellWidth string. Valor css que indica el maxWidth de todas las celdas de la fila.
 * @param minCellWidth string. Valor css que indica el minWidth de todas las celdas de la fila.
 * @param showCheckbox bool. Indica si hay que mostrar o no el checkbox.
 */
function TableRow({
  id,
  children,
  onClick,
  onSelect,
  checked,
  header,
  useVerticalStyle,
  maxCellWidth,
  minCellWidth,
  showCheckbox,
}) {
  const handleChange = (e) => {
    const value = e.target.checked;
    if (onSelect) onSelect(id, value);
  };

  return (
    <tr
      className={`${styles.tableRow} ${useVerticalStyle ? styles.verticalDesign : ''} ${
        checked ? styles.selectedRow : ''
      }`}
      onClick={onClick}
    >
      {showCheckbox && (
        <td className={`${styles.checkboxCell}`}>
          <input type="checkbox" onChange={handleChange} checked={checked} />
        </td>
      )}

      {React.Children.map(children, (child, index) => React.cloneElement(child, {
        'data-header': header[index],
        style: { ...(child.props.style ?? {}), maxWidth: maxCellWidth, minWidth: minCellWidth },
      }))}
    </tr>
  );
}

export default TableRow;

TableRow.propTypes = {
  id: PropTypes.string,
  children: PropTypes.node,
  onClick: PropTypes.func,
  onSelect: PropTypes.func,
  checked: PropTypes.bool,
  header: PropTypes.arrayOf(PropTypes.string),
  useVerticalStyle: PropTypes.bool,
  maxCellWidth: PropTypes.string,
  minCellWidth: PropTypes.string,
  showCheckbox: PropTypes.bool,
};

TableRow.defaultProps = {
  id: null,
  children: null,
  onClick: null,
  checked: false,
  header: [],
  useVerticalStyle: false,
  maxCellWidth: null,
  minCellWidth: null,
  showCheckbox: true,
  onSelect: null,
};
