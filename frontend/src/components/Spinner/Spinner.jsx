/* eslint-disable react/prop-types */
import React from 'react';
import './Spinner.css';

function Spinner({ className }) {
  return (
    <div className={`spinner ${className}`}>
      <div />
    </div>
  );
}

export default Spinner;
