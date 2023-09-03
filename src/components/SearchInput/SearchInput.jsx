/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FaSearch as SearchIcon } from 'react-icons/fa';
import styles from './SearchInput.module.css';

function SearchInput({ handleSearch, className, ...props }) {
  const [query, setQuery] = useState('');
  const handleChange = (e) => {
    const { value } = e.target;
    setQuery(value);
    if (value.length === 0) handleSearch(value);
  };

  const handleKeyUp = (e) => {
    const { value } = e.target;

    if (e.key === 'Enter') {
      handleSearch(value);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <div className={`${styles.searchInput} ${className}`}>
      <input
        type="text"
        placeholder="Buscar..."
        {...props}
        onChange={handleChange}
        onKeyUp={handleKeyUp}
        onKeyDown={handleKeyDown}
      />
      <button
        type="button"
        name="search-button"
        className={styles.searchButton}
        onClick={() => handleSearch(query)}
      >
        <SearchIcon />
      </button>
    </div>
  );
}

export default SearchInput;

SearchInput.propTypes = {
  handleSearch: PropTypes.func.isRequired,
  className: PropTypes.string,
};

SearchInput.defaultProps = {
  className: '',
};
