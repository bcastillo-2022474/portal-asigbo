import React from 'react';
import PropTypes from 'prop-types';
import styles from './ActivityParticipantsPage.module.css';
import ActivityParticipantsTable from '../../components/SelectActivityParticipantsTable/ActivityParticipantsTable';

function ActivityParticipantsPage({ idActivity }) {
  return (
    <div className={styles.activityParticipantsPage}>
      <h3>Participantes</h3>
      <ActivityParticipantsTable idActivity={idActivity} />
    </div>
  );
}

export default ActivityParticipantsPage;

ActivityParticipantsPage.propTypes = {
  idActivity: PropTypes.string.isRequired,
};

ActivityParticipantsPage.defaultProps = {

};
