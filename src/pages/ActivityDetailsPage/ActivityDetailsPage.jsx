/* eslint-disable no-nested-ternary */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  useParams,
  Route, Routes,
} from 'react-router-dom';
import styles from './ActivityDetailsPage.module.css';
import useLoggedInfo from '../../hooks/useLoggedInfo';
import useActivityByID from '../../hooks/useActivityByID';
import OptionsButton from '../../components/OptionsButton';
import TabMenu from '../../components/TabMenu';
import ActivityDetails from '../../components/ActivityDetails';
import LoadingView from '../../components/LoadingView';
import NotFound from '../NotFoundPage';
import ActivityParticipantsTable from '../../components/SelectActivityParticipantsTable/ActivityParticipantsTable';
import ActivityParticipantsPage from '../ActivityParticipantsPage/ActivityParticipantsPage';

function ActivityDetailsPage() {
  const { idActividad: activityID } = useParams();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { info: user, error: userError, loading: loadingUser } = useLoggedInfo();
  const {
    info: activity,
    error: activityError,
    loading: loadingActivity,
  } = useActivityByID(activityID);

  useEffect(() => {
    console.log(user);
    console.log(activity);
  }, [user, activity]);

  useEffect(() => {
    if (userError || activityError) {
      setNotFound(true);
    }
  }, [userError, activityError]);

  useEffect(() => {
    if ((loadingUser || !user) && !userError) {
      setLoading(true);
    } else if ((loadingActivity || !activity) && !activityError) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [loadingUser, loadingActivity]);

  return notFound ? <NotFound /> : (
    loading ? <LoadingView /> : (
      <div className={styles.main}>
        <div className={`${styles.pageHeader} ${activity ? `${activity.asigboArea.isResponsible ? styles.responsible : ''}` : ''}`}>
          <h1>Detalle de actividad</h1>
          <OptionsButton showMenuAtTop className={styles.optionsButton} label="Acciones" />
        </div>
        <TabMenu
          className={styles.tabMenu}
          options={[
            { text: 'Datos de actividad', href: '' },
            { text: 'Encargados', href: 'encargados' },
            { text: 'Participantes', href: 'participantes' },
          ]}
        />
        <Routes>
          <Route
            path="/"
            element={(
              <ActivityDetails data={activity} />
              )}
          />
          <Route
            path="/encargados"
            element={(
              <h3 className={styles.sectionTitle}>Encargados</h3>
              )}
          />
          <Route
            path="/participantes"
            element={<ActivityParticipantsPage idActivity={activityID} />}
          />
        </Routes>
      </div>
    )
  );
}

ActivityDetailsPage.propTypes = {};

export default ActivityDetailsPage;
