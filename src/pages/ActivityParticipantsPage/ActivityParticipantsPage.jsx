import React from 'react';
// import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import styles from './ActivityParticipantsPage.module.css';
import ActivityParticipantsTable from '../../components/SelectActivityParticipantsTable/ActivityParticipantsTable';

function ActivityParticipantsPage() {
  const { idActivity } = useParams();

  return (
    <div className={styles.activityParticipantsPage}>
      <h3>Participantes</h3>
      <ActivityParticipantsTable idActivity={idActivity} />
    </div>
  );
}

export default ActivityParticipantsPage;

ActivityParticipantsPage.propTypes = {

};

ActivityParticipantsPage.defaultProps = {

};
