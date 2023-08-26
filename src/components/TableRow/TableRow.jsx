import React from 'react';
import PropTypes from 'prop-types';
import styles from './TableRow.module.css';

/**
 * Fila para el componente Table. Utilizar en lugar de tr para el body de la tabla.
 *
 * @param id ID único de la fila.
 * @param onClick callback del evento onClick de la fila.
 */
function TableRow({
  id, children, onClick, onSelect, checked, header, useVerticalStyle, maxCellWidth, showCheckbox,
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
        style: { ...(child.props.style ?? {}), maxWidth: maxCellWidth },
      }))}
    </tr>
  );
}

export default TableRow;

TableRow.propTypes = {
  id: PropTypes.string.isRequired,
  children: PropTypes.node,
  onClick: PropTypes.func,
  onSelect: PropTypes.func,
  checked: PropTypes.bool,
  header: PropTypes.arrayOf(PropTypes.string),
  useVerticalStyle: PropTypes.bool,
  maxCellWidth: PropTypes.string,
  showCheckbox: PropTypes.bool,
};

TableRow.defaultProps = {
  children: null,
  onClick: null,
  checked: false,
  header: [],
  useVerticalStyle: false,
  maxCellWidth: null,
  showCheckbox: true,
  onSelect: null,
};
