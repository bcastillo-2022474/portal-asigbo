import React, { useEffect, useState } from 'react';
import ActivitiesGrid from '../ActivitiesGrid/ActivitiesGrid';
import useFetch from '../../hooks/useFetch';
import { serverHost } from '../../config';
import consts from '../../helpers/consts';
import useToken from '../../hooks/useToken';

function AssignedActivitiesGrid() {
  const [search, setSearch] = useState();
  const [initialDate, setInitialDate] = useState();
  const [finalDate, setFinalDate] = useState();

  const {
    callFetch: fetchActivities,
    result: assignmentsResult,
    loading: assignmentsLoading,
    error: assignmentsError,
  } = useFetch();

  const token = useToken();

  useEffect(() => {
    if (!token) return;
    const query = {};
    if (search) query.search = search;
    if (initialDate) query.lowerDate = initialDate;
    if (finalDate) query.upperDate = finalDate;
    const searchParams = new URLSearchParams(query);
    fetchActivities({
      uri: `${serverHost}/activity/assignment/notCompleted?${searchParams.toString()}`,
      method: 'GET',
      headers: { authorization: token },
    });
  }, [search, initialDate, finalDate]);
  return (
    <ActivitiesGrid
      searchHandler={setSearch}
      initialDateHandler={setInitialDate}
      finalDateHandler={setFinalDate}
      activities={assignmentsResult?.map((assignment) => ({
        url: `/actividad/${assignment.activity.id}`,
        imageUrl: assignment.activity.hasBanner ? `${serverHost}/${consts.imageRoute.activity}/${assignment.activity.id}` : null,
        name: assignment.activity.name,
        date: assignment.activity.date,
      }))}
      loading={assignmentsLoading}
      error={assignmentsError}
    />
  );
}

export default AssignedActivitiesGrid;
