import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
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

function PromotionChips({ data, onSelectionChange }) {
  const [selectedPromotions, setSelectedPromotions] = useState([]);

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

  if (!data) return null;

  return (
    <div>
      {data.notStudents.map((promotion) => (
        <Chip
          key={promotion}
          label={promotion}
          selected={selectedPromotions.includes(promotion)}
          onToggle={() => handleToggle(promotion)}
        />
      ))}
      {data.students.years.map((year) => (
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
  // eslint-disable-next-line react/forbid-prop-types
  data: PropTypes.object.isRequired,
  onSelectionChange: PropTypes.func.isRequired,
};
export default PromotionChips;
