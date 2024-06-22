import React from 'react';
import PropTypes from 'prop-types';
import SearchBanner from '@assets/banner/search-banner.svg';
import styles from './ActivitiesGrid.module.css';
import ActivityTableFilter from '../ActivityTableFilter/ActivityTableFilter';
import ActivityItem from '../ActivityItem';
import LoadingView from '../LoadingView';
import randomString from '../../helpers/randomString';

function ActivitiesGrid({
  activities, loading, error, searchHandler, initialDateHandler, finalDateHandler,
}) {
  return (
    <div className={styles.activitiesGrid}>
      <header>
        <ActivityTableFilter
          className={styles.filterContainer}
          searchHandler={searchHandler}
          initialDateHandler={initialDateHandler}
          finalDateHandler={finalDateHandler}
        />
      </header>

      {activities && (
      <div className={styles.grid}>
        {activities?.map((activity) => (
          <ActivityItem
            key={randomString()}
            url={activity.url}
            imageUrl={activity.imageUrl}
            name={activity.name}
            date={activity.date}
          />
        ))}
      </div>
      )}

      {
        error && (
        <div className={styles.noResults}>
          <img src={SearchBanner} alt="Sin resultados" />
          No hay resultados.
        </div>
        )
      }
      {loading && <LoadingView />}
    </div>
  );
}

export default ActivitiesGrid;

ActivitiesGrid.propTypes = {
  activities: PropTypes.arrayOf(PropTypes.shape({
    url: PropTypes.string.isRequired,
    imageUrl: PropTypes.string,
    name: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
  })),
  searchHandler: PropTypes.func,
  initialDateHandler: PropTypes.func,
  finalDateHandler: PropTypes.func,
  loading: PropTypes.bool,
  error: PropTypes.bool,
};

ActivitiesGrid.defaultProps = {
  searchHandler: null,
  initialDateHandler: null,
  finalDateHandler: null,
  activities: null,
  loading: false,
  error: false,
};
