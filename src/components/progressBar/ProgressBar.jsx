import './ProgressBar.scss';
// eslint-disable-next-line import/no-extraneous-dependencies
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

function ProgressBar({ progress }) {
  const [currentProgress, setProgress] = useState(0);
  const [fader, setFader] = useState(true);

  useEffect(() => {
    const delayer = setTimeout(() => {
      setProgress(progress);
    }, 1000);
    return () => clearTimeout(delayer);
  }, [progress]);
  useEffect(() => {
    const delayer = setTimeout(() => {
      setFader(false);
    }, 1000);
    return () => clearTimeout(delayer);
  }, []);
  return (
    <div className="progressBar">
      <div className="progressBackground" style={{ '--progress': `${currentProgress}%` }}>
        <div className="progressIndicator" />
      </div>
      <div className={`progressLabel ${fader ? 'hidden' : 'visible'}`}>{`${progress}%`}</div>
    </div>
  );
}

ProgressBar.propTypes = {
  progress: PropTypes.number.isRequired,
};

export default ProgressBar;
