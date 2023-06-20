import React from 'react';
import PropTypes from 'prop-types';
import styles from './Table.module.scss';
import XIcon from '../../assets/icons/XIcon';

function Table({ headers, content, className }) {
  return (
    <table className={`${className} ${styles.Table}`}>
      <thead>
        <tr className={styles.tableHeaders} style={{ '--headers': `${headers.length}` }}>{headers.map((value) => <th key={`header ${value}`}>{value}</th>)}</tr>
      </thead>
      <tbody>
        {/* eslint-disable-next-line arrow-body-style */}
        {content.map((value, index) => {
          return (
            <tr className={`${(index % 2 === 0) ? styles.evenRow : styles.oddRow} ${styles.tableContent}`} style={{ '--headers': `${headers.length}` }} key={`row ${value[index]}`}>
              {value.map((data = value) => <td key={`rowData ${value[index]} ${data}`}><span className={`${typeof data === 'object' ? styles.node : false}`}>{data}</span></td>)}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

Table.propTypes = {
  headers: PropTypes.arrayOf(PropTypes.string),
  content: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.node)),
  className: PropTypes.string,
};

Table.defaultProps = {
  headers: ['Columna1', 'Columna2', 'Columna3', 'Columna4', 'Columna5'],
  content: [['Row 1 Col 1', 'Row 1 Col 2', 'Row 2 Col 3', 'Row 3 Col4', <XIcon />], ['Row 2 Col 1', 'Row 2 Col 2', 'Row 2 Col 3', <XIcon />, 'Row 2 Col 5'], ['Row 3 Col 1', 'Row 3 Col 2', <XIcon />, 'Row 3 Col 4', 'Row 3 Col 5']],
  className: '',
};

export default Table;
