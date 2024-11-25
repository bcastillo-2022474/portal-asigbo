import React, { useState } from 'react';
import ResponsibleActivitiesTable from '@components/ResponsibleActivitiesTable/ResponsibleActivitiesTable';
import styles from './ResponsibleActivitiesPage.module.css';
import NotFoundPage from '../NotFoundPage';

function ResponsibleActivitiesPage() {
  const [errorActivities] = useState(false);

  const handleError = () => {
    // setErrorActivities(true);
  };

  return (
    <div className={styles.loggedEnrolledActivitiesPage}>
      {errorActivities && (
        <NotFoundPage />
      )}
      {!errorActivities && (
        <>
          <h1 className={styles.pageTitle}>Actividades a cargo</h1>
          {!errorActivities
      && <ResponsibleActivitiesTable onError={handleError} />}
        </>
      )}
    </div>
  );
}

export default ResponsibleActivitiesPage;
