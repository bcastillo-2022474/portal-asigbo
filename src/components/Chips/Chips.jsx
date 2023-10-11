import React, { useState, useEffect } from 'react';
import { serverHost } from '@/config';
import PropTypes from 'prop-types';
import useFetch from '@hooks/useFetch';
import useToken from '@hooks/useToken';
import styles from './Chips.module.css';

function Chip({ label, selected, onToggle }) {
  return (
    // eslint-disable-next-line max-len
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className={`${styles.chip} ${selected ? styles.chipSelected : styles.chipNotSelected}`}
      onClick={onToggle}
    >
      <span className={styles.chipLabel}>{label}</span>
    </div>
  );
}

function PromotionChips({ onSelectionChange }) {
  const {
    callFetch, result, loading, error: fetchError,
  } = useFetch();
  const token = useToken();
  const [selectedPromotions, setSelectedPromotions] = useState([]);
  const uri = `${serverHost}/promotion`;
  useEffect(() => {
    callFetch({
      uri,
      headers: { authorization: token },
      removeContentType: true,
    });
  }, []);

  const handleToggle = (promotion) => {
    setSelectedPromotions((prevPromotions) => {
      if (prevPromotions.includes(promotion)) {
        return prevPromotions.filter((p) => p !== promotion);
      }
      return [...prevPromotions, promotion];
    });
  };

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedPromotions);
    }
  }, [selectedPromotions]);

  if (loading) return <p>Loading...</p>;
  if (fetchError) {
    return (
      <p>
        Error:
        {fetchError.message}
      </p>
    );
  }

  if (!result) return null;
  return (
    <div>
      {result.notStudents.map((promotion) => (
        <Chip
          key={promotion}
          label={promotion}
          selected={selectedPromotions.includes(promotion)}
          onToggle={() => handleToggle(promotion)}
        />
      ))}
      {result.students.years.map((year) => (
        <Chip
          key={year}
          label={year.toString()}
          selected={selectedPromotions.includes(year.toString())}
          onToggle={() => handleToggle(year.toString())}
        />
      ))}
    </div>
  );
}

Chip.propTypes = {
  label: PropTypes.string.isRequired,
  selected: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

PromotionChips.propTypes = {
  onSelectionChange: PropTypes.func.isRequired,
};

export default PromotionChips;
