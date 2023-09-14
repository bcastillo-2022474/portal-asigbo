import { useEffect } from 'react';
import { serverHost } from '../config';
import useFetch from './useFetch';

function useEnrolledActivities(_id) {
  const {
    callFetch,
    result,
    error,
    loading,
  } = useFetch();

  const getEnrolledActivities = async () => {
    const uri = `${serverHost}/activity/assignment/?idUser=${_id}`;
    await callFetch({ uri });
  };

  useEffect(() => {
    getEnrolledActivities();
  }, []);

  return {
    getEnrolledActivities,
    info: result,
    error,
    loading,
  };
}

export default useEnrolledActivities;
