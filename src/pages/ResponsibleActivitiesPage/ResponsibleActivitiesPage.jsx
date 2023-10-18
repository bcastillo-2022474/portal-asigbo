import React, { useState, useEffect } from 'react';
import ActivityTable from '@components/ActivityTable/ActivityTable';
import useFetch from '@hooks/useFetch';
import useToken from '@hooks/useToken';
import getTokenPayload from '@helpers/getTokenPayload';
import styles from './ResponsibleActivitiesPage.module.css';
import { serverHost } from '../../config';

function ResponsibleActivitiesPage() {
  const token = useToken();
  const sessionUser = getTokenPayload(token);
  const {
    callFetch: getResponsibleActivities,
    result: resultActivities,
    error: errorActivities,
    loading: loadingActivities,
  } = useFetch();

  const [enrolledActivites, setEnrolledActivities] = useState([]);

  useEffect(() => {
    if (!resultActivities) return;
    let data = [];
    data = resultActivities.map((value) => {
      const temp = value;
      temp.registrationEndDate = value.date.slice(0, 10);
      return temp;
    });
    setEnrolledActivities(data);
  }, [resultActivities]);

  useEffect(() => {
    getResponsibleActivities({
      uri: `${serverHost}/activity/responsible/${sessionUser.id}`,
      headers: { authorization: token },
    });
  }, []);

  return (
    <div className={styles.loggedEnrolledActivitiesPage}>
      <h1 className={styles.pageTitle}>Actividades a cargo</h1>
      {!errorActivities
      && <ActivityTable loading={loadingActivities} data={enrolledActivites} listingType="byArea" />}
      {errorActivities && (
        <span className={styles.error}>{errorActivities?.message}</span>
      )}
    </div>
  );
}

export default ResponsibleActivitiesPage;
