import React, { useState, useEffect } from 'react';
import ResponsibleActivitiesTable from '@components/ResponsibleActivitiesTable/ResponsibleActivitiesTable';
import useFetch from '@hooks/useFetch';
import useToken from '@hooks/useToken';
import getTokenPayload from '@helpers/getTokenPayload';
import styles from './ResponsibleActivitiesPage.module.css';
import { serverHost } from '../../config';
import NotFoundPage from '../NotFoundPage';

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
      {errorActivities && (
        <NotFoundPage />
      )}
      {!errorActivities && (
        <>
          <h1 className={styles.pageTitle}>Actividades a cargo</h1>
          {!errorActivities
      && <ResponsibleActivitiesTable loading={loadingActivities} data={enrolledActivites} listingType="byArea" />}
        </>
      )}
    </div>
  );
}

export default ResponsibleActivitiesPage;
