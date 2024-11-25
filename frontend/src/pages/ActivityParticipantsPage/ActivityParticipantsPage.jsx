import React from 'react';
import PropTypes from 'prop-types';
import styles from './ActivityParticipantsPage.module.css';
import SelectActivityParticipantsTable from '../../components/SelectActivityParticipantsTable';
import useToken from '../../hooks/useToken';
import getTokenPayload from '../../helpers/getTokenPayload';
import ActivityParticipantsTable from '../../components/ActivityParticipantsTable';

function ActivityParticipantsPage({ activityData }) {
  const token = useToken();
  const user = token ? getTokenPayload(token) : null;

  return (
    <div className={styles.main}>
      <h2 className={styles.title}>Participantes</h2>
      {user.role.find((value) => (String(value).includes('admin'))
        || activityData?.asigboArea.isResponsible
        || activityData?.responsible.some((resp) => resp.id === user?.id))
        ? <SelectActivityParticipantsTable idActivity={activityData?.id} />
        : <ActivityParticipantsTable idActivity={activityData?.id} />}
    </div>

  );
}

export default ActivityParticipantsPage;

ActivityParticipantsPage.propTypes = {
  activityData: PropTypes.instanceOf(Object).isRequired,
};

ActivityParticipantsPage.defaultProps = {

};
