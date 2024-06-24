import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import ActivitiesGrid from '../ActivitiesGrid/ActivitiesGrid';
import useFetch from '../../hooks/useFetch';
import { serverHost } from '../../config';
import consts from '../../helpers/consts';
import useToken from '../../hooks/useToken';

function AvailableActivitiesGrid() {
  const [search, setSearch] = useState();
  const [initialDate, setInitialDate] = useState();
  const [finalDate, setFinalDate] = useState();

  const {
    callFetch: fetchActivities,
    result: activitiesResult,
    loading: activitiesLoading,
    error: activitiesError,
  } = useFetch();

  const token = useToken();

  useEffect(() => {
    if (!token) return;
    const query = {};
    if (search) query.search = search;
    if (initialDate) query.lowerDate = initialDate;
    if (finalDate) query.upperDate = new Date(dayjs(finalDate).endOf('day'));
    const searchParams = new URLSearchParams(query);
    fetchActivities({
      uri: `${serverHost}/activity/available?${searchParams.toString()}`,
      method: 'GET',
      headers: { authorization: token },
    });
  }, [search, initialDate, finalDate]);
  return (
    <ActivitiesGrid
      searchHandler={setSearch}
      initialDateHandler={setInitialDate}
      finalDateHandler={setFinalDate}
      activities={activitiesResult?.map((activity) => ({
        url: `/actividad/${activity.id}`,
        imageUrl: activity.hasBanner ? `${serverHost}/${consts.imageRoute.activity}/${activity.id}` : null,
        name: activity.name,
        date: activity.date,
      }))}
      loading={activitiesLoading}
      error={activitiesError}
    />
  );
}

export default AvailableActivitiesGrid;
