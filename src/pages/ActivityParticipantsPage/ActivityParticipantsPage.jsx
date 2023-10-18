import React from 'react';
import PropTypes from 'prop-types';
import styles from './ActivityParticipantsPage.module.css';
import SelectActivityParticipantsTable from '../../components/SelectActivityParticipantsTable';
import useToken from '../../hooks/useToken';
import getTokenPayload from '../../helpers/getTokenPayload';
import useActivityByID from '../../hooks/useActivityByID';
import ActivityParticipantsTable from '../../components/ActivityParticipantsTable';

function ActivityParticipantsPage({ idActivity }) {
  const token = useToken();
  const user = token ? getTokenPayload(token) : null;

  const {
    info, error,
  } = useActivityByID(idActivity);

  return (
    error ? 'Ocurrió un error al obtener los participantes'
      : (
        <div className={styles.main}>
          <h2 className={styles.title}>Participantes</h2>
          {user.role.find((value) => (String(value).includes('admin')) || info?.asigboArea.isResponsible) ? <SelectActivityParticipantsTable idActivity={idActivity} /> : <ActivityParticipantsTable idActivity={idActivity} />}
        </div>
      )
  );
}

export default ActivityParticipantsPage;

ActivityParticipantsPage.propTypes = {
  idActivity: PropTypes.string.isRequired,
};

ActivityParticipantsPage.defaultProps = {

};
